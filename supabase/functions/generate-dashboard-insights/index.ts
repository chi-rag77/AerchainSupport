// v2.7 - AI Dashboard Insights with Gemini 2.0 Flash
// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
// @ts-ignore
import * as dateFns from "https://esm.sh/date-fns@2.30.0";

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

    if (!supabaseUrl || !supabaseAnonKey || !geminiApiKey) {
      return new Response(JSON.stringify({ error: 'Supabase environment variables not set.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response('Unauthorized', { status: 401, headers: corsHeaders });

    const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // 1. Check Cache
    const { data: cached } = await supabase
      .from('ai_dashboard_summary')
      .select('*')
      .eq('org_id', user.id)
      .single();

    if (cached) {
      const lastUpdated = new Date(cached.updated_at);
      const hoursSinceUpdate = (new Date().getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
      const url = new URL(req.url);
      const force = url.searchParams.get('force') === 'true';
      
      if (!force && hoursSinceUpdate < 6) {
        return new Response(JSON.stringify({
          ...cached,
          insights: cached.insights || [{ message: "Operational trends are stable.", severity: "info", type: "trend" }]
        }), { status: 200, headers: corsHeaders });
      }
    }

    // 2. Fetch Data
    const thirtyDaysAgo = dateFns.subDays(new Date(), 30).toISOString();
    const { data: tickets } = await supabase
      .from('freshdesk_tickets')
      .select('subject, status, priority, created_at, due_by, cf_company')
      .gte('created_at', thirtyDaysAgo)
      .limit(500);

    if (!tickets || tickets.length === 0) {
      return new Response(JSON.stringify({ 
        summary: "No ticket data available.",
        risk_level: "Low",
        confidence: 100,
        key_drivers: [],
        executive_action: "Encourage team to log tickets.",
        insights: []
      }), { status: 200, headers: corsHeaders });
    }

    // 3. Call Gemini (Using 2.0-flash via v1beta)
    const context = `Support data (30 days): Total: ${tickets.length}, Open: ${tickets.filter(t => !['resolved', 'closed'].includes(t.status.toLowerCase())).length}`;
    const prompt = `Analyze this support data and return STRICT JSON:
    {
      "summary": "2 sentence summary",
      "risk_level": "Low|Medium|High",
      "confidence": 90-98,
      "key_drivers": ["driver 1"],
      "executive_action": "one recommendation",
      "insights": [{"message": "obs", "severity": "info", "type": "trend"}]
    }
    Data: ${context}`;

    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { response_mime_type: "application/json" }
      }),
    });

    if (geminiResponse.ok) {
      const geminiData = await geminiResponse.json();
      const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      const analysis = JSON.parse(rawText.replace(/```json/g, '').replace(/```/g, '').trim());

      const dbPayload = {
        org_id: user.id,
        summary: analysis.summary,
        risk_level: analysis.risk_level,
        confidence: analysis.confidence,
        key_drivers: analysis.key_drivers,
        executive_action: analysis.executive_action,
        updated_at: new Date().toISOString(),
      };

      await supabase.from('ai_dashboard_summary').upsert(dbPayload, { onConflict: 'org_id' });

      return new Response(JSON.stringify({ ...dbPayload, insights: analysis.insights }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error("AI Service failed to respond correctly.");

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});