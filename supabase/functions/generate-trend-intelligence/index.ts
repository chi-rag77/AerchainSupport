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
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY not set in Supabase secrets.");
    }

    const { signals, orgId } = await req.json();

    const prompt = `You are an enterprise support intelligence AI.
Analyze the operational trend for the selected period.

Inputs:
- Average ticket volume: ${signals.avgVolume}
- Volume change: ${signals.volumeChangePercent > 0 ? '+' : ''}${signals.volumeChangePercent}%
- Average SLA: ${signals.avgSLA}%
- SLA change: ${signals.slaChangePercent > 0 ? '+' : ''}${signals.slaChangePercent}%
- Risk classification: ${signals.riskLevel}

Provide:
1. Executive summary (2–3 lines)
2. Root cause hypothesis
3. Recommended action
4. Confidence score (0–100)

Return strict JSON with keys: summary, rootCause, recommendedAction, confidenceScore.`;

    console.log("[generate-trend-intelligence] Calling Gemini API...");
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[generate-trend-intelligence] Gemini API Error:", errorText);
      throw new Error(`Gemini API failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error("[generate-trend-intelligence] Invalid API Response:", data);
      throw new Error("AI returned an empty or invalid response.");
    }

    const text = data.candidates[0].content.parts[0].text;
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const intelligence = JSON.parse(jsonStr);

    return new Response(JSON.stringify(intelligence), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error: any) {
    console.error("[generate-trend-intelligence] Internal Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});