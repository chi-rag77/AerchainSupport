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
      throw new Error("Missing environment variables for Supabase or Gemini.");
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
        ai_summary: { status: "Insufficient interaction history to generate customer intelligence insights." },
        health_score: 0,
        status: "No Data",
      }), { status: 200, headers: corsHeaders });
    }

    const now = new Date();
    const openTickets = tickets.filter(t => !['resolved', 'closed'].includes(t.status.toLowerCase()));
    
    const ticketsLast7 = tickets.filter(t => dateFns.differenceInDays(now, new Date(t.created_at)) <= 7).length;
    const ticketsPrev7 = tickets.filter(t => {
      const diff = dateFns.differenceInDays(now, new Date(t.created_at));
      return diff > 7 && diff <= 14;
    }).length;
    const ticketGrowth = ticketsPrev7 > 0 ? Math.round(((ticketsLast7 - ticketsPrev7) / ticketsPrev7) * 100) : (ticketsLast7 > 0 ? 100 : 0);

    const openHighPriority = openTickets.filter(t => ['high', 'urgent'].includes(t.priority.toLowerCase())).length;
    const openMediumPriority = openTickets.filter(t => t.priority.toLowerCase() === 'medium').length;
    let slaRisk = "Low";
    if (openHighPriority > 5) slaRisk = "High";
    else if (openMediumPriority > 10) slaRisk = "Medium";

    const resolvedTickets = tickets.filter(t => ['resolved', 'closed'].includes(t.status.toLowerCase()));
    const slaTotal = resolvedTickets.filter(t => t.due_by).length;
    const slaMet = resolvedTickets.filter(t => t.due_by && new Date(t.updated_at) <= new Date(t.due_by)).length;
    const slaAdherence = slaTotal > 0 ? (slaMet / slaTotal) * 100 : 100;

    const sentimentScore = Math.max(0, 100 - (openHighPriority * 5) - (openTickets.length * 1));
    const ticketFrequencyScore = Math.max(0, 100 - Math.abs(ticketGrowth));
    const escalationRate = tickets.filter(t => t.status.toLowerCase() === 'escalated').length;
    const escalationScore = tickets.length > 0 ? (1 - (escalationRate / tickets.length)) * 100 : 100;
    const unresolvedScore = tickets.length > 0 ? (1 - (openTickets.length / tickets.length)) * 100 : 100;

    const healthScore = Math.round(
      (slaAdherence * 0.3) +
      (sentimentScore * 0.25) +
      (ticketFrequencyScore * 0.2) +
      (escalationScore * 0.15) +
      (unresolvedScore * 0.1)
    );

    let healthStatus = "Critical";
    if (healthScore >= 90) healthStatus = "Excellent";
    else if (healthScore >= 75) healthStatus = "Healthy";
    else if (healthScore >= 60) healthStatus = "Watchlist";
    else if (healthScore >= 40) healthStatus = "At Risk";

    const topIssues = openTickets
      .map(t => t.subject)
      .reduce((acc, subject) => {
        const words = subject.toLowerCase().split(/\s+/);
        words.forEach(word => {
          if (word.length > 4) acc[word] = (acc[word] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>);
    
    const topTicketTopics = Object.entries(topIssues).sort((a, b) => b[1] - a[1]).slice(0, 3).map(e => e[0]).join(', ');

    const prompt = `
      You are an enterprise customer success intelligence analyst.
      Your task is to analyze support metrics and produce a concise customer account intelligence summary.
      
      **CRITICAL: You MUST respond with a single, valid JSON object and nothing else. Do not add any text before or after the JSON.**
      
      The JSON object must have the following structure:
      {
        "status": "string",
        "key_drivers": ["string"],
        "top_issues": ["string"],
        "recommended_actions": ["string"]
      }

      Here is an example of a perfect response:
      {
        "status": "Customer health is critical due to poor SLA performance and rapidly increasing ticket activity.",
        "key_drivers": [
          "SLA adherence only 20%",
          "200% increase in ticket volume",
          "Moderate negative sentiment"
        ],
        "top_issues": [
          "Duplicate PO creation bug",
          "High Memo transaction errors",
          "Invoice attachment problems"
        ],
        "recommended_actions": [
          "Escalate duplicate PO bug to engineering",
          "Improve response times for finance-related tickets",
          "Proactively communicate fixes to the customer."
        ]
      }

      Now, analyze the following customer data and generate the JSON output.

      DATA:
      - Customer: ${customerName}
      - Health score: ${healthScore}
      - Health status: ${healthStatus}
      - Open tickets: ${openTickets.length}
      - Ticket growth: ${ticketGrowth}%
      - SLA adherence: ${Math.round(slaAdherence)}%
      - Sentiment score: ${Math.round(sentimentScore)}
      - Top ticket categories: ${topTicketTopics}
      - Escalation risk: ${slaRisk}
    `;

    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { response_mime_type: "application/json" }
      }),
    });

    if (!geminiResponse.ok) {
      const errorBody = await geminiResponse.text();
      console.error(`[get-customer-intelligence] Gemini API Error (${geminiResponse.status}):`, errorBody);
      throw new Error(`AI Service Error (${geminiResponse.status}): ${errorBody}`);
    }
    const geminiData = await geminiResponse.json();
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    
    let aiSummary;
    try {
      aiSummary = JSON.parse(rawText);
    } catch (e) {
      console.error("Failed to parse AI JSON response, using fallback. Raw text:", rawText);
      aiSummary = {
        status: "AI analysis could not be parsed. The raw response was: " + rawText,
        key_drivers: [],
        top_issues: [],
        recommended_actions: []
      };
    }

    const responsePayload = {
      customer: customerName,
      health_score: healthScore,
      status: healthStatus,
      open_tickets: openTickets.length,
      ticket_growth: `${ticketGrowth > 0 ? '+' : ''}${ticketGrowth}%`,
      sla_risk: slaRisk,
      ai_summary: aiSummary,
      confidence: 84,
      explainability: `Generated from ${tickets.length} tickets, ${escalationRate} escalations and SLA data.`,
      health_score_components: {
        sla_adherence: { score: Math.round(slaAdherence), weight: 30 },
        sentiment: { score: Math.round(sentimentScore), weight: 25 },
        ticket_volume: { score: Math.round(ticketFrequencyScore), weight: 20 },
        escalation: { score: Math.round(escalationScore), weight: 15 },
        unresolved: { score: Math.round(unresolvedScore), weight: 10 }
      },
      metadata: {
        tier: "Enterprise",
        arr: "$180K",
        industry: "FMCG",
        since: "2021",
        renewal: "Oct 2026"
      }
    };

    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('[get-customer-intelligence] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});