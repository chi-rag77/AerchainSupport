// v1.0 - AI Recurring Issue Radar Engine with Gemini 2.5 Flash
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

    if (!geminiApiKey) throw new Error("GEMINI_API_KEY is not configured.");

    const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
      global: { headers: { Authorization: req.headers.get('Authorization')! } },
    });

    const { customerName } = await req.json();

    // 1. Fetch Tickets (Last 90 days for pattern detection)
    const ninetyDaysAgo = dateFns.subDays(new Date(), 90).toISOString();
    let query = supabase
      .from('freshdesk_tickets')
      .select('freshdesk_id, subject, description_text, cf_module, created_at, priority, status')
      .gte('created_at', ninetyDaysAgo);

    if (customerName && customerName !== 'All') {
      query = query.eq('cf_company', customerName);
    }

    const { data: tickets, error: fetchError } = await query.limit(1000);

    if (fetchError) throw fetchError;
    if (!tickets || tickets.length < 5) {
      return new Response(JSON.stringify({ empty: true }), { status: 200, headers: corsHeaders });
    }

    // 2. Pre-process for AI (Group by module to reduce token usage and improve clustering)
    const moduleGroups: Record<string, any[]> = {};
    tickets.forEach(t => {
      const mod = t.cf_module || 'General';
      if (!moduleGroups[mod]) moduleGroups[mod] = [];
      moduleGroups[mod].push({ id: t.freshdesk_id, s: t.subject, d: t.created_at });
    });

    // 3. AI Clustering & Analysis
    const prompt = `
      You are a Support Operations AI. Analyze these ${tickets.length} support tickets and identify RECURRING product issues.
      
      Data (Sampled):
      ${JSON.stringify(Object.entries(moduleGroups).map(([mod, tks]) => ({ module: mod, tickets: tks.slice(0, 50) })))}

      Return STRICT JSON with this structure:
      {
        "clusters": [
          {
            "id": "unique-slug",
            "title": "Concise Issue Name (e.g. PR Approval Timeout)",
            "occurrences": number (total estimated across data),
            "modules": ["Module Name"],
            "trend": "increasing|stable|decreasing",
            "impact": "High|Medium|Low",
            "rootCause": "1-2 sentence technical root cause inference",
            "suggestedFix": "Specific product or operational fix",
            "confidence": 0-100,
            "history": [{"month": "Jan", "count": 10}],
            "requiresEscalation": boolean (true if occurrences > 50 or impact is High),
            "sampleTickets": ["ID1", "ID2"]
          }
        ],
        "moduleDistribution": [{"module": "Name", "percentage": number}],
        "globalTrend": number (percentage change vs previous period)
      }

      Focus on patterns, not individual tickets. Group similar subjects like "Sync Error" and "Sync Timeout" into one cluster.
    `;

    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { response_mime_type: "application/json", temperature: 0.2 }
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      throw new Error(`AI Service Error: ${geminiRes.status} - ${errText}`);
    }

    const aiData = await geminiRes.json();
    const rawText = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const result = JSON.parse(rawText.replace(/```json/g, '').replace(/```/g, '').trim());

    return new Response(JSON.stringify({
      ...result,
      totalRecurringTickets: result.clusters.reduce((acc: number, c: any) => acc + c.occurrences, 0),
      generatedAt: new Date().toISOString()
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("[recurring-issue-radar] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});