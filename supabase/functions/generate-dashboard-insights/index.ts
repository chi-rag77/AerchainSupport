// v2.1 - AI Dashboard Insights
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
      return new Response(JSON.stringify({ error: 'Environment variables for Supabase or Gemini API key not set.' }), {
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

    // 1. Check Cache (6 hour TTL)
    const { data: cached } = await supabase
      .from('ai_dashboard_summary')
      .select('*')
      .eq('org_id', user.id)
      .single();

    if (cached) {
      const lastUpdated = new Date(cached.updated_at);
      const hoursSinceUpdate = (new Date().getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
      if (hoursSinceUpdate < 6) {
        const responsePayload = {
          ...cached,
          insights: [{ message: "SLA adherence is stable.", severity: "info", type: "trend" }]
        };
        return new Response(JSON.stringify(responsePayload), { status: 200, headers: corsHeaders });
      }
    }

    // 2. If stale, fetch data and generate new insights
    const thirtyDaysAgo = dateFns.subDays(new Date(), 30).toISOString();
    const { data: tickets, error: ticketsError } = await supabase
      .from('freshdesk_tickets')
      .select('subject, status, priority, created_at, due_by, cf_company')
      .gte('created_at', thirtyDaysAgo);

    if (ticketsError) throw ticketsError;

    const totalTickets = tickets.length;
    const openTickets = tickets.filter(t => !['resolved', 'closed'].includes(t.status.toLowerCase())).length;
    const urgentTickets = tickets.filter(t => t.priority.toLowerCase() === 'urgent').length;
    const slaBreached = tickets.filter(t => t.due_by && dateFns.isPast(new Date(t.due_by)) && !['resolved', 'closed'].includes(t.status.toLowerCase())).length;

    const context = `
      Here is a summary of support operations for the last 30 days:
      - Total Tickets: ${totalTickets}
      - Currently Open Tickets: ${openTickets}
      - Urgent Tickets: ${urgentTickets}
      - Active SLA Breached Tickets: ${slaBreached}
      - A sample of recent ticket subjects: ${JSON.stringify(tickets.slice(0, 10).map(t => t.subject))}
    `;

    const prompt = `
      You are an AI operations analyst for a support dashboard. Based on the following data, generate a concise, executive-level summary.

      ${context}

      Return a STRICT JSON object with the following structure:
      {
        "summary": "A 2-3 sentence summary of the current operational state. Mention key trends or risks.",
        "risk_level": "Low | Medium | High | Critical",
        "confidence": 90-98,
        "key_drivers": ["A short phrase for the primary driver of ticket volume", "A short phrase for the primary risk factor"],
        "executive_action": "A single, actionable recommendation for a support leader.",
        "insights": [
          { "message": "A short, insightful observation about the data.", "severity": "info | warning | critical", "type": "trend | anomaly | risk" }
        ]
      }
    `;

    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { response_mime_type: "application/json" }
      }),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      throw new Error(`Gemini API error: ${geminiResponse.status} - ${errorText}`);
    }

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

    const responsePayload = {
      ...dbPayload,
      insights: analysis.insights,
    };

    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('[generate-dashboard-insights] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});