// v1.6 - Lean Agent Performance logic
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

    const { customerName, weekOffset = 0 } = await req.json();

    const now = new Date();
    const startOfThisWeek = dateFns.startOfWeek(dateFns.subWeeks(now, weekOffset), { weekStartsOn: 1 });
    const endOfThisWeek = dateFns.endOfWeek(startOfThisWeek, { weekStartsOn: 1 });
    const startOfLastWeek = dateFns.startOfWeek(dateFns.subWeeks(startOfThisWeek, 1), { weekStartsOn: 1 });

    const { data: tickets } = await supabase
      .from('freshdesk_tickets')
      .select('*')
      .eq('cf_company', customerName)
      .gte('created_at', startOfLastWeek.toISOString())
      .lte('created_at', endOfThisWeek.toISOString());

    const thisWeekTickets = (tickets || []).filter(t => new Date(t.created_at) >= startOfThisWeek);
    
    // --- 1. Agent Performance Logic ---
    const agentMap: Record<string, any> = {};
    thisWeekTickets.forEach(t => {
      const name = t.assignee || 'Unassigned';
      if (!agentMap[name]) agentMap[name] = { name, total: 0, resolved: 0, totalResHours: 0, slaMet: 0, slaTotal: 0, types: {} };
      const a = agentMap[name];
      a.total++;
      const isResolved = ['resolved', 'closed'].includes(t.status.toLowerCase());
      if (isResolved) {
        a.resolved++;
        a.totalResHours += dateFns.differenceInHours(new Date(t.updated_at), new Date(t.created_at));
      }
      if (t.due_by) {
        a.slaTotal++;
        if (isResolved && new Date(t.updated_at) <= new Date(t.due_by)) a.slaMet++;
      }
      const type = t.type || 'Query';
      a.types[type] = (a.types[type] || 0) + 1;
    });

    const sortedAgents = Object.values(agentMap).sort((a, b) => b.total - a.total);
    const primaryAgentRaw = sortedAgents[0] || { name: 'None', total: 0, resolved: 0, totalResHours: 0, slaMet: 0, slaTotal: 0, types: {} };
    
    const teamDistribution = sortedAgents.map(a => ({
      name: a.name,
      tickets: a.total,
      percent: Math.round((a.total / (thisWeekTickets.length || 1)) * 100)
    }));

    // Task Mix for Primary Agent
    const taskMix = Object.entries(primaryAgentRaw.types).map(([label, count]: [string, any]) => ({
      label,
      percent: Math.round((count / primaryAgentRaw.total) * 100)
    })).sort((a, b) => b.percent - a.percent);

    // --- 2. AI Intelligence Layer (Concise) ---
    let agentAI = { strength: "N/A", concern: "N/A", signal: "Strong" };

    if (geminiApiKey && thisWeekTickets.length > 0) {
      const prompt = `
        Analyze agent performance for "${customerName}":
        Primary Agent: ${JSON.stringify(primaryAgentRaw)}

        Generate:
        1. Strength (1 short phrase, max 5 words)
        2. Concern (1 short phrase, max 5 words)
        3. Signal (Strong | Attention | Risk)

        Return STRICT JSON:
        {
          "strength": "",
          "concern": "",
          "signal": "Strong|Attention|Risk"
        }
      `;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { response_mime_type: "application/json" }
        }),
      });

      if (res.ok) {
        const aiData = await res.json();
        agentAI = JSON.parse(aiData.candidates[0].content.parts[0].text);
      }
    }

    const primaryAgent: any = {
      name: primaryAgentRaw.name,
      tickets: primaryAgentRaw.total,
      efficiency: primaryAgentRaw.total > 0 ? Math.round((primaryAgentRaw.resolved / primaryAgentRaw.total) * 100) : 0,
      avg_time: primaryAgentRaw.resolved > 0 ? (primaryAgentRaw.totalResHours / primaryAgentRaw.resolved).toFixed(1) + "h" : "0h",
      sla: primaryAgentRaw.slaTotal > 0 ? Math.round((primaryAgentRaw.slaMet / primaryAgentRaw.slaTotal) * 100) : 100,
      strength: agentAI.strength,
      concern: agentAI.concern,
      signal: agentAI.signal,
      workload: primaryAgentRaw.total > 20 ? 'Overloaded' : primaryAgentRaw.total > 10 ? 'High' : 'Balanced',
      taskMix
    };

    return new Response(JSON.stringify({
      customer: customerName,
      weekRange: `${dateFns.format(startOfThisWeek, 'MMM dd')} – ${dateFns.format(endOfThisWeek, 'MMM dd')}`,
      status: primaryAgent.efficiency > 80 ? 'Healthy' : primaryAgent.efficiency > 60 ? 'Watch' : 'Critical',
      healthScore: primaryAgent.efficiency,
      confidenceScore: 92,
      metrics: {
        total: thisWeekTickets.length,
        resolved: thisWeekTickets.filter(t => ['resolved', 'closed'].includes(t.status.toLowerCase())).length,
        rate: Math.round((thisWeekTickets.filter(t => ['resolved', 'closed'].includes(t.status.toLowerCase())).length / (thisWeekTickets.length || 1)) * 100),
        rateTrend: 5,
        primaryIssue: "General Queries",
        primaryIssuePercent: 0
      },
      agentPerformance: {
        primary: primaryAgent,
        team: teamDistribution
      },
      efficiency: {
        avg_resolution_time: primaryAgent.avg_time,
        sla_compliance: primaryAgent.sla,
        first_response_time: "1.4",
        efficiency_score: primaryAgent.efficiency,
        bottlenecks: [],
        insights: { summary: "Activity is normal." }
      },
      timeline: [],
      aiInsights: { keyPoints: [], rootCause: "", recommendations: [] },
      recurringIssues: []
    }), {
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