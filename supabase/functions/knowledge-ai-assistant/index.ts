// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { query, customerName } = await req.json();
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

    const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
      global: { headers: { Authorization: req.headers.get('Authorization')! } },
    });

    // 1. Embed the Query
    const embedRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: "models/text-embedding-004",
        content: { parts: [{ text: query }] }
      })
    });
    const { embedding } = await embedRes.json();

    // 2. Vector Search
    const { data: chunks, error: searchError } = await supabase.rpc('match_knowledge_chunks', {
      query_embedding: embedding.values,
      match_threshold: 0.5,
      match_count: 5,
      filter_customer_name: customerName === 'All' ? null : customerName
    });

    if (searchError) throw searchError;

    // 3. Generate Answer with Context
    const context = chunks.map((c: any) => `Source: ${c.document_name}\nContent: ${c.content}`).join('\n---\n');
    
    const prompt = `
      You are the Support Brain AI. Use the following documentation context to answer the user's question.
      If the answer isn't in the context, say you don't know and suggest escalating to an expert.
      
      Context:
      ${context}
      
      Question: ${query}
      
      Return STRICT JSON:
      {
        "answer": "Detailed answer here",
        "confidence": 0-100,
        "sources": [{"title": "Doc Name", "section": "Brief context"}]
      }
    `;

    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { response_mime_type: "application/json" }
      }),
    });

    const aiData = await geminiRes.json();
    const rawText = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const result = JSON.parse(rawText.replace(/```json/g, '').replace(/```/g, '').trim());

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});