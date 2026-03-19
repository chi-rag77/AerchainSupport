// v1.4 - Fixed Top Delay Drivers logic
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
    
    // --- 1. Behavioral Timeline Logic ---
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const timeline = days.map((day, i) => {
      const dDate = dateFns.addDays(startOfThisWeek, i);
      const dayTickets = thisWeekTickets.filter(t => dateFns.isSameDay(new Date(t.created_at), dDate));
      const dayResolved = thisWeekTickets.filter(t => 
        ['resolved', 'closed'].includes(t.status.toLowerCase()) && 
        dateFns.isSameDay(new Date(t.updated_at), dDate)
      );
      const slaStress = dayTickets.filter(t => t.priority === 'Urgent' || (t.due_by && dateFns.isPast(new Date(t.due_by)))).length;
      
      return {
        day,
        created: dayTickets.length,
        resolved: dayResolved.length,
        sla_risk: slaStress > 2 ? 'high' : slaStress > 0 ? 'medium' : 'low',
        trend: dayTickets.length > (thisWeekTickets.length / 5) * 1.5 ? 'spike' : dayTickets.length < (thisWeekTickets.length / 5) * 0.5 ? 'drop' : 'normal',
        sla_compliance: dayResolved.length > 0 ? Math.round((dayResolved.filter(t => !t.due_by || new Date(t.updated_at) <= new Date(t.due_by)).length / dayResolved.length) * 100) : 100
      };
    });

    // --- 2. Resolution Efficiency Logic ---
    const resolvedThisWeek = thisWeekTickets.filter(t => ['resolved', 'closed'].includes(t.status.toLowerCase()));
    const unresolvedThisWeek = thisWeekTickets.filter(t => !['resolved', 'closed'].includes(t.status.toLowerCase()));
    
    const totalResHours = resolvedThisWeek.reduce((acc, t) => acc + dateFns.differenceInHours(new Date(t.updated_at), new Date(t.created_at)), 0);
    const avgResTime = resolvedThisWeek.length > 0 ? (totalResHours / resolvedThisWeek.length).toFixed(1) : "0";
    const slaMetCount = resolvedThisWeek.filter(t => !t.due_by || new Date(t.updated_at) <= new Date(t.due_by)).length;
    const slaCompliance = resolvedThisWeek.length > 0 ? Math.round((slaMetCount / resolvedThisWeek.length) * 100) : 100;

    const efficiencyScore = Math.round((slaCompliance * 0.6) + (Math.max(0, 100 - (parseFloat(avgResTime) * 2)) * 0.4));

    // Deterministic Bottlenecks (Fallback)
    const bottleneckMap: Record<string, number> = {};
    unresolvedThisWeek.forEach(t => {
      const status = t.status || 'Unknown';
      bottleneckMap[status] = (bottleneckMap[status] || 0) + 1;
    });

    const totalUnresolved = unresolvedThisWeek.length;
    let bottlenecks = Object.entries(bottleneckMap)
      .map(([type, count]) => ({
        type: type.replace(/\(.*\)/, '').trim(), // Clean up status names
        percentage: totalUnresolved > 0 ? Math.round((count / totalUnresolved) * 100) : 0
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 3);

    // --- 3. AI Intelligence Layer ---
    let behavioralInsights = { summary: "Activity is normal.", highlights: [] };
    let recurringIssues = [];

    if (geminiApiKey && thisWeekTickets.length > 0) {
      const prompt = `
        Analyze this support data for "${customerName}":
        Tickets: ${JSON.stringify(thisWeekTickets.map(t => ({ subject: t.subject, module: t.cf_module, priority: t.priority, status: t.status })))}
        Timeline: ${JSON.stringify(timeline)}

        1. Identify recurring issues.
        2. Detect frequency and trends.
        3. Identify the top 3 "Delay Drivers" (why are tickets not being resolved?).

        Return STRICT JSON:
        {
          "behavioral": { "summary": "2 lines", "highlights": [] },
          "recurring": [...],
          "bottlenecks": [
            { "type": "Waiting on Customer", "percentage": 45 },
            { "type": "Technical Review", "percentage": 30 }
          ]
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
        const parsed = JSON.parse(aiData.candidates[0].content.parts[0].text);
        behavioralInsights = parsed.behavioral;
        recurringIssues = parsed.recurring;
        if (parsed.bottlenecks && parsed.bottlenecks.length > 0) {
          bottlenecks = parsed.bottlenecks;
        }
      }
    }

    return new Response(JSON.stringify({
      customer: customerName,
      weekRange: `${dateFns.format(startOfThisWeek, 'MMM dd')} – ${dateFns.format(endOfThisWeek, 'MMM dd')}`,
      status: efficiencyScore > 80 ? 'Healthy' : efficiencyScore > 60 ? 'Watch' : 'Critical',
      healthScore: efficiencyScore,
      confidenceScore: 92,
      metrics: {
        total: thisWeekTickets.length,
        resolved: resolvedThisWeek.length,
        rate: Math.round((resolvedThisWeek.length / (thisWeekTickets.length || 1)) * 100),
        rateTrend: 5,
        primaryIssue: recurringIssues[0]?.title || "General Queries",
        primaryIssuePercent: recurringIssues[0] ? Math.round((recurringIssues[0].count / thisWeekTickets.length) * 100) : 0
      },
      efficiency: {
        avg_resolution_time: avgResTime,
        sla_compliance: slaCompliance,
        first_response_time: "1.4",
        efficiency_score: efficiencyScore,
        bottlenecks: bottlenecks,
        insights: { summary: behavioralInsights.summary }
      },
      timeline,
      aiInsights: behavioralInsights,
      recurringIssues
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