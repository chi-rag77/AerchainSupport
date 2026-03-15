// v2.1 - Customer Intelligence
// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
// @ts-ignore
import { differenceInDays } from "https://esm.sh/date-fns@2.30.0";

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
      throw new Error("Missing environment variables.");
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: req.headers.get('Authorization')! } },
    });

    const { customerName } = await req.json();
    if (!customerName) throw new Error("customerName is required.");

    const { data: tickets, error } = await supabase
      .from('freshdesk_tickets')
      .select('*')
      .eq('cf_company', customerName);

    if (error) throw error;

    if (!tickets || tickets.length < 5) {
      return new Response(JSON.stringify({
        ai_summary: { status: "Insufficient history." },
        health_score: 0,
        status: "No Data",
      }), { status: 200, headers: corsHeaders });
    }

    const now = new Date();
    const openTickets = tickets.filter(t => !['resolved', 'closed'].includes(t.status.toLowerCase()));
    const ticketsLast7 = tickets.filter(t => differenceInDays(now, new Date(t.created_at)) <= 7).length;
    const ticketsPrev7 = tickets.filter(t => {
      const diff = differenceInDays(now, new Date(t.created_at));
      return diff > 7 && diff <= 14;
    }).length;
    const ticketGrowth = ticketsPrev7 > 0 ? Math.round(((ticketsLast7 - ticketsPrev7) / ticketsPrev7) * 100) : 0;

    const slaTotal = tickets.filter(t => t.due_by && ['resolved', 'closed'].includes(t.status.toLowerCase())).length;
    const slaMet = tickets.filter(t => t.due_by && ['resolved', 'closed'].includes(t.status.toLowerCase()) && new Date(t.updated_at) <= new Date(t.due_by)).length;
    const slaAdherence = slaTotal > 0 ? (slaMet / slaTotal) * 100 : 100;

    const healthScore = Math.round(slaAdherence * 0.6 + (100 - Math.min(100, openTickets.length * 5)) * 0.4);

    const prompt = `
      You are an enterprise customer success intelligence analyst.
      Analyze this data for ${customerName}:
      - Health score: ${healthScore}
      - Open tickets: ${openTickets.length}
      - Ticket growth: ${ticketGrowth}%
      - SLA adherence: ${Math.round(slaAdherence)}%
      
      Return STRICT JSON:
      {
        "status": "string",
        "key_drivers": ["string"],
        "top_issues": ["string"],
        "recommended_actions": ["string"]
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
      const errorBody = await geminiResponse.text();
      throw new Error(`AI Service Error (${geminiResponse.status}): ${errorBody}`);
    }
    const geminiData = await geminiResponse.json();
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const aiSummary = JSON.parse(rawText);

    const responsePayload = {
      customer: customerName,
      health_score: healthScore,
      status: healthScore > 80 ? "Healthy" : "At Risk",
      open_tickets: openTickets.length,
      ticket_growth: `${ticketGrowth}%`,
      sla_risk: slaAdherence < 80 ? "High" : "Low",
      ai_summary: aiSummary,
      confidence: 84,
      explainability: `Generated from ${tickets.length} tickets.`,
      health_score_components: {
        sla_adherence: { score: Math.round(slaAdherence), weight: 60 },
        sentiment: { score: 80, weight: 0 },
        ticket_volume: { score: 80, weight: 0 },
        escalation: { score: 80, weight: 0 },
        unresolved: { score: 80, weight: 40 }
      },
      metadata: { tier: "Enterprise", arr: "$180K", industry: "FMCG", since: "2021", renewal: "Oct 2026" }
    };

    return new Response(JSON.stringify(responsePayload), {
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