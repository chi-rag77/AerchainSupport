// v1.0 - Support Copilot Core Engine
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

    // --- STEP 1: INTENT DETECTION ---
    const intentPrompt = `
      You are an intent classification engine for a support operations AI assistant.
      Classify the user's query into ONE of these intents:
      - insight → user is asking for explanation or analysis
      - action → user wants to perform an operation
      - navigation → user wants to view something
      - knowledge → user is asking how to solve something

      Also extract entities: metrics, filters, actions.
      Return STRICT JSON:
      {
        "intent": "insight|action|navigation|knowledge",
        "entities": { "metric": "", "customer": "", "time_range": "", "priority": "" }
      }
      User Query: "${query}"
    `;

    const intentRes = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=\${geminiApiKey}\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: intentPrompt }] }],
        generationConfig: { response_mime_type: "application/json" }
      }),
    });

    const intentData = await intentRes.json();
    const intent = JSON.parse(intentData.candidates[0].content.parts[0].text);

    // --- STEP 2: DATA FETCHING ---
    let systemData = {};
    if (intent.intent === 'insight' || intent.intent === 'navigation') {
      const [{ count: total }, { count: open }, { count: urgent }] = await Promise.all([
        supabase.from('freshdesk_tickets').select('*', { count: 'exact', head: true }),
        supabase.from('freshdesk_tickets').select('*', { count: 'exact', head: true }).not('status', 'in', '("Resolved","Closed")'),
        supabase.from('freshdesk_tickets').select('*', { count: 'exact', head: true }).eq('priority', 'Urgent')
      ]);
      systemData = { total, open, urgent };
    }

    // --- STEP 3: RESPONSE GENERATION ---
    const responsePrompt = `
      You are a support operations analyst. 
      User asked: "${query}"
      Intent: ${intent.intent}
      System Data: ${JSON.stringify(systemData)}
      Current Page: ${context.current_page || 'dashboard'}

      Explain clearly what is happening and what needs attention.
      If intent is 'navigation', suggest a filter action.
      If intent is 'insight', provide data points.

      Return STRICT JSON:
      {
        "type": "${intent.intent}",
        "title": "Short Title",
        "answer": "Main response text",
        "bullets": ["point 1", "point 2"],
        "actions": [
          { "label": "Action Label", "type": "filter|navigate", "payload": {} }
        ]
      }
    `;

    const finalRes = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=\${geminiApiKey}\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: responsePrompt }] }],
        generationConfig: { response_mime_type: "application/json" }
      }),
    });

    const finalData = await finalRes.json();
    const result = JSON.parse(finalData.candidates[0].content.parts[0].text);

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