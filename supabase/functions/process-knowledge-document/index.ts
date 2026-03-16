// v1.5 - Robust Document Processor
// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
// @ts-ignore
import * as XLSX from "https://esm.sh/xlsx@0.18.5";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { documentId } = await req.json();
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

    if (!geminiApiKey) throw new Error("GEMINI_API_KEY is not set.");

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // 1. Get Document Info
    const { data: doc, error: docError } = await supabase
      .from('knowledge_documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (docError || !doc) throw new Error(`Document not found: ${docError?.message}`);

    console.log(`[process-knowledge-document] Processing: ${doc.name}`);

    // 2. Download File from Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('knowledge')
      .download(doc.file_path);

    if (downloadError) throw new Error(`Storage download failed: ${downloadError.message}`);

    let text = "";
    const isExcel = doc.name.toLowerCase().endsWith('.xlsx') || doc.name.toLowerCase().endsWith('.xls') || doc.file_type?.includes('spreadsheet');

    if (isExcel) {
      const arrayBuffer = await fileData.arrayBuffer();
      const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
      workbook.SheetNames.forEach((sheetName: string) => {
        const worksheet = workbook.Sheets[sheetName];
        const sheetText = XLSX.utils.sheet_to_txt(worksheet);
        text += `Sheet: ${sheetName}\n${sheetText}\n\n`;
      });
    } else {
      text = await fileData.text();
    }

    if (!text || text.trim().length === 0) {
      throw new Error("No text content extracted from document.");
    }

    // 3. Chunking (1000 char chunks with 200 char overlap)
    const chunks = [];
    for (let i = 0; i < text.length; i += 800) {
      chunks.push(text.slice(i, i + 1000));
    }

    console.log(`[process-knowledge-document] Generated ${chunks.length} chunks.`);

    // 4. Generate Embeddings & Save using v1beta endpoint
    for (const chunk of chunks) {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: { parts: [{ text: chunk }] }
        })
      });

      if (!res.ok) {
        console.error(`[process-knowledge-document] Embedding failed for chunk: ${await res.text()}`);
        continue;
      }

      const embedData = await res.json();
      const embedding = embedData.embedding?.values;

      if (embedding) {
        const { error: insertError } = await supabase.from('knowledge_chunks').insert({
          document_id: documentId,
          content: chunk,
          embedding: embedding,
          metadata: { customer: doc.customer_name, category: doc.category }
        });
        if (insertError) console.error("[process-knowledge-document] Insert Error:", insertError);
      }
    }

    return new Response(JSON.stringify({ success: true, chunks: chunks.length }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("[process-knowledge-document] Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});