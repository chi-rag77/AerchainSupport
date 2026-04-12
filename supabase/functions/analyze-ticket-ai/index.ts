// v3.2 - Optimized Ticket AI Analyzer
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
      return new Response(JSON.stringify({ error: 'AI Configuration missing.' }), {
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

    // 1. Fast Cache Check
    if (!forceRefresh) {
      const { data: cached } = await supabase
        .from('ai_ticket_analysis')
        .select('*')
        .eq('ticket_id', ticketId)
        .maybeSingle();

      if (cached) {
        const lastUpdated = new Date(cached.updated_at);
        const minutesSinceUpdate = (new Date().getTime() - lastUpdated.getTime()) / (1000 * 60);
        if (minutesSinceUpdate < 1440) { // 24h cache
          return new Response(JSON.stringify(cached), { status: 200, headers: corsHeaders });
        }
      }
    }

    // 2. Fetch only essential messages (last 10 for speed)
    const { data: messages, error: msgError } = await supabase
      .from('ticket_messages')
      .select('body_html, is_agent, created_at')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (msgError) throw msgError;
    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'No conversation found.' }), { status: 404, headers: corsHeaders });
    }

    // 3. Call Gemini with optimized prompt
    const prompt = getAnalysisPrompt(customerName || 'Unknown', messages.reverse());
    
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { 
          response_mime_type: "application/json",
          temperature: 0.1,
          max_output_tokens: 800
        }
      }),
    });

    if (!geminiResponse.ok) throw new Error(`AI Service Error: ${geminiResponse.status}`);

    const geminiData = await geminiResponse.json();
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const analysis = JSON.parse(rawText.replace(/```json/g, '').replace(/```/g, '').trim());

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

    // Background save to not block response
    EdgeRuntime.waitUntil(supabase.from('ai_ticket_analysis').upsert(dbPayload, { onConflict: 'ticket_id' }));

    return new Response(JSON.stringify(dbPayload), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('[analyze-ticket-ai] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});