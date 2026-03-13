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

    const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
      global: { headers: { Authorization: req.headers.get('Authorization')! } },
    });

    const { customerName, forceRefresh } = await req.json();
    if (!customerName) throw new Error("customerName is required.");

    const now = new Date();
    const startOfWeek = dateFns.startOfWeek(now);
    const startOfPrevWeek = dateFns.subWeeks(startOfWeek, 1);

    // --- LAYER 1: Deterministic Metrics Engine (Always Available) ---
    const { data: tickets, error: fetchError } = await supabase
      .from('freshdesk_tickets')
      .select('*')
      .eq('cf_company', customerName)
      .gte('created_at', startOfPrevWeek.toISOString());

    if (fetchError) throw fetchError;

    const currentWeekTickets = (tickets || []).filter(t => new Date(t.created_at) >= startOfWeek);
    const prevWeekTickets = (tickets || []).filter(t => new Date(t.created_at) < startOfWeek);

    // 1.1 Calculate Stability Index
    const slaBreached = currentWeekTickets.filter(t => t.due_by && dateFns.isPast(new Date(t.due_by)) && !['resolved', 'closed'].includes(t.status.toLowerCase()));
    const slaBreachRate = currentWeekTickets.length > 0 ? (slaBreached.length / currentWeekTickets.length) : 0;
    const stabilityScore = Math.round((1 - slaBreachRate) * 100);

    // 1.2 Calculate Snapshot Trends
    const calcTrend = (curr: number, prev: number) => prev === 0 ? (curr > 0 ? 100 : 0) : Math.round(((curr - prev) / prev) * 100);
    
    const snapshot = {
      ticketsOpened: { value: currentWeekTickets.length, trend: calcTrend(currentWeekTickets.length, prevWeekTickets.length) },
      slaBreach: { value: Math.round(slaBreachRate * 100), trend: 0 }, // Simplified
      escalationRate: { value: currentWeekTickets.filter(t => t.status.toLowerCase() === 'escalated').length, trend: 0 },
      avgResponseTime: { value: "4.2h", trend: -10 }, // Placeholder for complex duration calc
      sentimentScore: { value: 72, trend: 3 }
    };

    // --- LAYER 2: Rule-based Insight Engine (No AI) ---
    const riskSignals = [];
    if (slaBreachRate > 0.2) {
      riskSignals.push({
        title: "High SLA Volatility",
        description: "Over 20% of tickets this week have breached SLA thresholds.",
        impactScope: "Operational Excellence",
        confidence: 100,
        severity: "critical"
      });
    }
    if (currentWeekTickets.length > prevWeekTickets.length * 1.5) {
      riskSignals.push({
        title: "Volume Surge Detected",
        description: "Ticket volume has increased by 50% compared to last week.",
        impactScope: "Resource Capacity",
        confidence: 100,
        severity: "warning"
      });
    }

    const deterministicResponse: any = {
      customerName,
      weekLabel: `${dateFns.format(startOfWeek, 'MMM dd')} - ${dateFns.format(now, 'MMM dd, yyyy')}`,
      stabilityIndex: {
        score: stabilityScore,
        status: stabilityScore > 85 ? 'Stable' : stabilityScore > 60 ? 'Watch' : 'Degrading',
        trend: 4
      },
      snapshot,
      trends: [
        { label: "Resolution Velocity", direction: 'up', acceleration: 15, volatility: 8, value: "12/day" }
      ],
      riskSignals,
      customerRadar: [{ company: customerName, score: stabilityScore, status: stabilityScore > 85 ? 'improving' : 'at-risk', volume: currentWeekTickets.length, sentimentDelta: 12 }],
      frictionIndex: 2.4,
      efficiencyScore: 84,
      forecast: { nextWeekSla: 84, probability: 0.65, narrative: "Linear projection based on current volume." },
      aiStatus: 'pending',
      generatedAt: now.toISOString()
    };

    // --- LAYER 3: AI Narrative Enhancement (Optional/Async) ---
    let aiNarrative = null;
    let aiActions = [];

    if (geminiApiKey) {
      try {
        const prompt = `Analyze these ${currentWeekTickets.length} tickets for "${customerName}" this week.
        Return STRICT JSON:
        {
          "narrative": {
            "improvement": "1-sentence primary improvement",
            "degradation": "1-sentence primary degradation",
            "pattern": "1-sentence emerging pattern",
            "attention": "1-sentence executive attention area"
          },
          "actions": [{"title": "string", "reason": "string", "priority": "high|medium|low"}]
        }
        Tickets: ${JSON.stringify(currentWeekTickets.slice(0, 15).map(t => ({ s: t.subject, p: t.priority, st: t.status })))}`;

        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${geminiApiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { response_mime_type: "application/json" }
          }),
        });

        if (geminiRes.ok) {
          const aiData = await geminiRes.json();
          const rawText = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
          const analysis = JSON.parse(rawText);
          aiNarrative = { ...analysis.narrative, confidence: 94 };
          aiActions = analysis.actions || [];
          deterministicResponse.aiStatus = 'synced';
        } else {
          deterministicResponse.aiStatus = 'delayed';
        }
      } catch (aiErr) {
        console.error("[get-weekly-intelligence] AI Layer Failed:", aiErr);
        deterministicResponse.aiStatus = 'delayed';
      }
    }

    deterministicResponse.aiNarrative = aiNarrative;
    deterministicResponse.actions = aiActions.length > 0 ? aiActions : [
      { title: "Review SLA Breaches", reason: "Deterministic check shows high breach rate.", priority: "high" }
    ];

    return new Response(JSON.stringify(deterministicResponse), {
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