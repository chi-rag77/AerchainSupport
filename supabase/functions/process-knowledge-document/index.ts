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

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // 1. Get Document Info
    const { data: doc, error: docError } = await supabase
      .from('knowledge_documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (docError || !doc) throw new Error("Document not found");

    // 2. Download File from Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('knowledge')
      .download(doc.file_path);

    if (downloadError) throw downloadError;

    let text = "";
    const isExcel = doc.name.endsWith('.xlsx') || doc.name.endsWith('.xls') || doc.file_type.includes('spreadsheet');

    if (isExcel) {
      // Parse Excel
      const arrayBuffer = await fileData.arrayBuffer();
      const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
      
      // Convert each sheet to a text representation
      workbook.SheetNames.forEach((sheetName: string) => {
        const worksheet = workbook.Sheets[sheetName];
        const sheetText = XLSX.utils.sheet_to_txt(worksheet);
        text += `Sheet: ${sheetName}\n${sheetText}\n\n`;
      });
    } else {
      // Assume text/markdown for other types
      text = await fileData.text();
    }

    if (!text || text.trim().length === 0) {
      throw new Error("No text content extracted from document.");
    }

    // 3. Chunking (Simple 1000 char chunks with overlap)
    const chunks = [];
    for (let i = 0; i < text.length; i += 800) {
      chunks.push(text.slice(i, i + 1000));
    }

    // 4. Generate Embeddings & Save
    for (const chunk of chunks) {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "models/text-embedding-004",
          content: { parts: [{ text: chunk }] }
        })
      });

      if (!res.ok) {
        console.error(`Embedding failed for chunk: ${await res.text()}`);
        continue;
      }

      const { embedding } = await res.json();

      await supabase.from('knowledge_chunks').insert({
        document_id: documentId,
        content: chunk,
        embedding: embedding.values,
        metadata: { customer: doc.customer_name, category: doc.category }
      });
    }

    return new Response(JSON.stringify({ success: true, chunks: chunks.length }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("[process-knowledge-document] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});