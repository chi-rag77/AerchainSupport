// v2.9 - Ticket AI Analyzer with Gemini 1.5 Flash
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
      return new Response(JSON.stringify({ error: 'AI Configuration missing (API Key or Supabase URL).' }), {
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
      try {
        const { data: cached } = await supabase
          .from('ai_ticket_analysis')
          .select('*')
          .eq('ticket_id', ticketId)
          .single();

        if (cached) {
          const lastUpdated = new Date(cached.updated_at);
          const hoursSinceUpdate = (new Date().getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
          if (hoursSinceUpdate < 24) {
            return new Response(JSON.stringify(cached), { status: 200, headers: corsHeaders });
          }
        }
      } catch (e) {
        console.warn("[analyze-ticket-ai] Cache check failed:", e.message);
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

    // 3. Call Gemini (Using 1.5-flash via v1beta)
    const prompt = getAnalysisPrompt(customerName || 'Unknown', messages.reverse());
    
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { 
          response_mime_type: "application/json",
          temperature: 0.1
        }
      }),
    });

    if (!geminiResponse.ok) {
      const errorBody = await geminiResponse.text();
      throw new Error(`AI Service Error: ${geminiResponse.status} - ${errorBody}`);
    }

    const geminiData = await geminiResponse.json();
    let rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const analysis = JSON.parse(rawText);

    const dbPayload = {
      ticket_id: ticketId,
      summary: analysis.summary,
      customer_tone: analysis.customer_tone,
      agent_tone: analysis.agent_tone,
      escalation_risk: analysis.escalation_risk,
      is_escalating: !!analysis.is_escalating,
      sentiment_score: analysis.sentiment_score || 0,
      sentiment_trend: analysis.sentiment_trend || 'stable',
      suggested_action: Array.isArray(analysis.suggested_action) 
        ? analysis.suggested_action.join('\n') 
        : analysis.suggested_action,
      confidence_score: analysis.confidence_score || 80,
      updated_at: new Date().toISOString(),
    };

    try {
      await supabase.from('ai_ticket_analysis').upsert(dbPayload, { onConflict: 'ticket_id' });
    } catch (dbErr) {
      console.error("[analyze-ticket-ai] DB save failed:", dbErr.message);
    }

    return new Response(JSON.stringify(dbPayload), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('[analyze-ticket-ai] Fatal Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});