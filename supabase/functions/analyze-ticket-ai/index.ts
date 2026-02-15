// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { getAnalysisPrompt } from "./prompt.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

    if (!supabaseUrl || !supabaseAnonKey || !geminiApiKey) {
      return new Response(JSON.stringify({ error: 'Environment variables (SUPABASE_URL, SUPABASE_ANON_KEY, or GEMINI_API_KEY) not set in Supabase secrets.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response('Unauthorized', { status: 401, headers: corsHeaders });

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { ticketId, customerName, forceRefresh } = await req.json();

    if (!ticketId) {
      return new Response(JSON.stringify({ error: 'ticketId is required' }), { status: 400, headers: corsHeaders });
    }

    // 1. Check Cache
    if (!forceRefresh) {
      const { data: cached } = await supabase
        .from('ai_ticket_analysis')
        .select('*')
        .eq('ticket_id', ticketId)
        .single();

      if (cached) {
        const lastUpdated = new Date(cached.updated_at);
        const hoursSinceUpdate = (new Date().getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceUpdate < 24) {
          console.log(`[analyze-ticket-ai] Returning cached analysis for ${ticketId}`);
          return new Response(JSON.stringify(cached), { status: 200, headers: corsHeaders });
        }
      }
    }

    // 2. Fetch Messages
    const { data: messages, error: msgError } = await supabase
      .from('ticket_messages')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (msgError) throw msgError;

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'No conversation found to analyze. Please sync messages first.' }), { status: 404, headers: corsHeaders });
    }

    // 3. Call AI (Using v1 endpoint for gemini-1.5-flash)
    const prompt = getAnalysisPrompt(customerName || 'Unknown', messages.reverse());
    
    console.log(`[analyze-ticket-ai] Calling Gemini API for ticket ${ticketId}...`);
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    if (!geminiResponse.ok) {
      const errorBody = await geminiResponse.text();
      console.error(`[analyze-ticket-ai] Gemini API Error (${geminiResponse.status}):`, errorBody);
      return new Response(JSON.stringify({ error: `Gemini API failed with status ${geminiResponse.status}. Check Supabase logs for details.` }), {
        status: geminiResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const geminiData = await geminiResponse.json();
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    
    // Clean JSON response (sometimes AI wraps in markdown)
    const jsonStr = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    let analysis;
    try {
      analysis = JSON.parse(jsonStr);
    } catch (parseErr) {
      console.error("[analyze-ticket-ai] Failed to parse AI response:", rawText);
      throw new Error("AI returned an invalid data format.");
    }

    // 4. Save to DB
    const dbPayload = {
      ticket_id: ticketId,
      summary: analysis.summary,
      customer_tone: analysis.customer_tone,
      agent_tone: analysis.agent_tone,
      escalation_risk: analysis.escalation_risk,
      is_escalating: analysis.is_escalating,
      sentiment_score: analysis.sentiment_score,
      sentiment_trend: analysis.sentiment_trend,
      suggested_action: analysis.suggested_action,
      confidence_score: analysis.confidence_score,
      updated_at: new Date().toISOString(),
    };

    const { data: savedData, error: upsertError } = await supabase
      .from('ai_ticket_analysis')
      .upsert(dbPayload, { onConflict: 'ticket_id' })
      .select()
      .single();

    if (upsertError) console.error('[analyze-ticket-ai] DB Upsert error:', upsertError);

    return new Response(JSON.stringify(savedData || dbPayload), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('[analyze-ticket-ai] Internal Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});