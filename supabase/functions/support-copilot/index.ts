// v1.2 - Optimized Support Copilot
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

    const authHeader = req.headers.get('Authorization');
    const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
      global: { headers: { Authorization: authHeader! } },
    });

    const { query, context = {} } = await req.json();

    // 1. Fetch System Context in Parallel
    const [
      { count: total }, 
      { count: open }, 
      { count: urgent }
    ] = await Promise.all([
      supabase.from('freshdesk_tickets').select('*', { count: 'exact', head: true }),
      supabase.from('freshdesk_tickets').select('*', { count: 'exact', head: true }).not('status', 'in', '("Resolved","Closed")'),
      supabase.from('freshdesk_tickets').select('*', { count: 'exact', head: true }).eq('priority', 'Urgent')
    ]);

    const systemData = { total, open, urgent };

    // 2. Single AI Call for both Intent and Response (Faster than sequential)
    const prompt = `
      You are a support operations analyst. 
      User Query: "${query}"
      System Data: ${JSON.stringify(systemData)}
      Current Page: ${context.current_page || 'dashboard'}

      Analyze intent (insight|action|navigation|knowledge) and provide a helpful response.
      Return STRICT JSON:
      {
        "type": "intent",
        "title": "Short Title",
        "answer": "Main response text",
        "bullets": ["point 1"],
        "actions": [{ "label": "Action", "type": "filter|navigate", "payload": {} }]
      }
    `;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { response_mime_type: "application/json", temperature: 0.2 }
      }),
    });

    const data = await res.json();
    const result = JSON.parse(data.candidates[0].content.parts[0].text);

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