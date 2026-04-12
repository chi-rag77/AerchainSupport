// v3.1 - Optimized AI Dashboard Insights
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

    if (!supabaseUrl || !geminiApiKey) throw new Error('Configuration missing.');

    const authHeader = req.headers.get('Authorization');
    const supabase = createClient(supabaseUrl, supabaseAnonKey!, {
      global: { headers: { Authorization: authHeader! } },
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // 1. Fetch Pre-Aggregated Data (Faster than raw tickets)
    const thirtyDaysAgo = dateFns.subDays(new Date(), 30).toISOString();
    
    const [
      { data: tickets },
      { data: cached }
    ] = await Promise.all([
      supabase.from('freshdesk_tickets').select('status, priority, cf_company, cf_module').gte('created_at', thirtyDaysAgo).limit(1000),
      supabase.from('ai_dashboard_summary').select('*').eq('org_id', user.id).maybeSingle()
    ]);

    if (cached && !new URL(req.url).searchParams.get('force')) {
      const lastUpdated = new Date(cached.updated_at);
      if ((new Date().getTime() - lastUpdated.getTime()) < 3600000) { // 1h cache
        return new Response(JSON.stringify(cached), { status: 200, headers: corsHeaders });
      }
    }

    if (!tickets || tickets.length === 0) throw new Error("No data to analyze.");

    // 2. Pre-process data for AI (Reduce tokens)
    const stats = {
      total: tickets.length,
      open: tickets.filter(t => !['resolved', 'closed'].includes(t.status.toLowerCase())).length,
      urgent: tickets.filter(t => t.priority === 'Urgent').length,
      topCompanies: Object.entries(tickets.reduce((acc: any, t) => {
        acc[t.cf_company || 'N/A'] = (acc[t.cf_company || 'N/A'] || 0) + 1;
        return acc;
      }, {})).sort((a: any, b: any) => b[1] - a[1]).slice(0, 5),
      topModules: Object.entries(tickets.reduce((acc: any, t) => {
        acc[t.cf_module || 'N/A'] = (acc[t.cf_module || 'N/A'] || 0) + 1;
        return acc;
      }, {})).sort((a: any, b: any) => b[1] - a[1]).slice(0, 5)
    };

    // 3. Call Gemini 1.5 Flash (Fastest)
    const prompt = `Analyze support ops data: ${JSON.stringify(stats)}. 
    Return STRICT JSON: { "summary": "2 sentences", "risk_level": "Low|Med|High", "confidence": 95, "key_drivers": [], "executive_action": "", "insights": [{"message": "", "severity": "info", "type": "trend"}] }`;

    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { response_mime_type: "application/json" }
      }),
    });

    const geminiData = await geminiRes.json();
    const analysis = JSON.parse(geminiData.candidates[0].content.parts[0].text);

    const dbPayload = {
      org_id: user.id,
      ...analysis,
      updated_at: new Date().toISOString(),
    };

    EdgeRuntime.waitUntil(supabase.from('ai_dashboard_summary').upsert(dbPayload, { onConflict: 'org_id' }));

    return new Response(JSON.stringify(dbPayload), {
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