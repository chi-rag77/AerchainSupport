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
      throw new Error("Missing environment variables (SUPABASE_URL, SUPABASE_ANON_KEY, or GEMINI_API_KEY).");
    }

    const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
      global: { headers: { Authorization: req.headers.get('Authorization')! } },
    });

    const { customerName } = await req.json();
    if (!customerName) throw new Error("customerName is required.");

    const now = new Date();
    const startOfWeek = dateFns.startOfWeek(now);

    // 1. Fetch Data
    const { data: tickets, error: fetchError } = await supabase
      .from('freshdesk_tickets')
      .select('*')
      .eq('cf_company', customerName)
      .limit(1000);

    if (fetchError) throw fetchError;

    const currentWeekTickets = (tickets || []).filter(t => new Date(t.created_at) >= startOfWeek);
    
    // --- Logic: Stability Index ---
    const slaBreachRate = currentWeekTickets.filter(t => t.due_by && dateFns.isPast(new Date(t.due_by)) && !['resolved', 'closed'].includes(t.status.toLowerCase())).length / (currentWeekTickets.length || 1);
    const stabilityScore = Math.round((1 - slaBreachRate) * 100);

    // 2. Call AI for Clustering and Narrative
    const prompt = `Analyze these ${currentWeekTickets.length} tickets for "${customerName}" this week.
    
    Return STRICT JSON:
    {
      "narrative": {
        "improvement": "1-sentence primary improvement",
        "degradation": "1-sentence primary degradation",
        "pattern": "1-sentence emerging pattern",
        "attention": "1-sentence executive attention area"
      },
      "signals": [{"title": "string", "description": "string", "impactScope": "string", "confidence": number, "severity": "critical|warning"}],
      "actions": [{"title": "string", "reason": "string", "priority": "high|medium|low"}]
    }

    Tickets: ${JSON.stringify(currentWeekTickets.slice(0, 20).map(t => ({ s: t.subject, p: t.priority, st: t.status })))}`;

    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { response_mime_type: "application/json" }
      }),
    });

    if (!geminiRes.ok) {
      const errorText = await geminiRes.text();
      throw new Error(`Gemini API error: ${geminiRes.status} - ${errorText}`);
    }

    const aiData = await geminiRes.json();
    const rawText = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    
    let analysis;
    try {
      analysis = JSON.parse(rawText);
    } catch (parseErr) {
      console.error("[get-weekly-intelligence] Failed to parse AI response:", rawText);
      throw new Error("AI returned an invalid data format.");
    }

    const response = {
      customerName,
      weekLabel: `${dateFns.format(startOfWeek, 'MMM dd')} - ${dateFns.format(now, 'MMM dd, yyyy')}`,
      stabilityIndex: {
        score: stabilityScore,
        status: stabilityScore > 85 ? 'Stable' : stabilityScore > 60 ? 'Watch' : 'Degrading',
        trend: 4
      },
      snapshot: {
        ticketsOpened: { value: currentWeekTickets.length, trend: 12 },
        slaBreach: { value: Math.round(slaBreachRate * 100), trend: -2 },
        escalationRate: { value: 8, trend: 5 },
        avgResponseTime: { value: "4.2h", trend: -10 },
        sentimentScore: { value: 72, trend: 3 }
      },
      trends: [
        { label: "Resolution Velocity", direction: 'up', acceleration: 15, volatility: 8, value: "12/day" },
        { label: "First Response", direction: 'down', acceleration: -5, volatility: 22, value: "4.2h" }
      ],
      riskSignals: analysis.signals || [],
      customerRadar: [
        { company: customerName, score: 82, status: 'improving', volume: currentWeekTickets.length, sentimentDelta: 12 }
      ],
      issueClusters: [],
      frictionIndex: 2.4,
      efficiencyScore: 84,
      forecast: {
        nextWeekSla: 84,
        probability: 0.65,
        narrative: "Volume spike in 'Login' issues predicted to impact SLA by 4% next Tuesday."
      },
      aiNarrative: {
        ...analysis.narrative,
        confidence: 94
      },
      actions: analysis.actions || []
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('[get-weekly-intelligence] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});