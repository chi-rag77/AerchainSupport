// v1.0 - Conversational Ticket Intelligence with Gemini 2.5 Flash
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

    if (!geminiApiKey) throw new Error("GEMINI_API_KEY is not set.");

    const authHeader = req.headers.get('Authorization');
    const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
      global: { headers: { Authorization: authHeader! } },
    });

    const { ticketId, query, history = [] } = await req.json();

    // 1. Fetch Ticket Context
    const [{ data: ticket }, { data: messages }] = await Promise.all([
      supabase.from('freshdesk_tickets').select('*').eq('freshdesk_id', ticketId).single(),
      supabase.from('ticket_messages').select('*').eq('ticket_id', ticketId).order('created_at', { ascending: true })
    ]);

    if (!ticket) throw new Error("Ticket not found.");

    // 2. Construct Contextual Prompt
    const conversation = (messages || []).map(m => `${m.is_agent ? 'Agent' : 'Customer'}: ${m.body_html}`).join('\n---\n');
    
    const prompt = `
      You are an expert support operations analyst. You are helping an agent resolve a ticket.
      
      TICKET CONTEXT:
      ID: ${ticket.freshdesk_id}
      Subject: ${ticket.subject}
      Status: ${ticket.status}
      Priority: ${ticket.priority}
      Company: ${ticket.cf_company}
      Module: ${ticket.cf_module}
      Created: ${ticket.created_at}
      
      CONVERSATION HISTORY:
      ${conversation}
      
      USER QUERY: "${query}"
      
      INSTRUCTIONS:
      1. Answer the query accurately based ONLY on the provided ticket data and conversation.
      2. If you need to highlight specific data points (like a root cause, a sentiment shift, or a specific date), include them in the "cards" array.
      3. Suggest 2-3 relevant follow-up questions.
      
      RETURN STRICT JSON:
      {
        "answer": "Your detailed response here",
        "cards": [
          { "title": "Card Title", "content": "Key insight", "icon": "Target|MessageSquare|Zap|ShieldAlert|Info", "status": "info|critical" }
        ],
        "followUps": ["Question 1", "Question 2"]
      }
    `;

    // 3. Call Gemini 2.5 Flash
    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { 
          response_mime_type: "application/json",
          temperature: 0.2
        }
      }),
    });

    if (!geminiRes.ok) throw new Error(`AI Service Error: ${await geminiRes.text()}`);

    const aiData = await geminiRes.json();
    const rawText = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const result = JSON.parse(rawText.replace(/```json/g, '').replace(/```/g, '').trim());

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("[ticket-chat] Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});