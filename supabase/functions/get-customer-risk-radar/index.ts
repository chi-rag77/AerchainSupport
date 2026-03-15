// v1.0 - Customer Risk & Opportunity Radar Engine
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
    const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
      global: { headers: { Authorization: req.headers.get('Authorization')! } },
    });

    const { customerName } = await req.json();
    if (!customerName) throw new Error("customerName is required.");

    // 1. Fetch historical data (last 6 months)
    const sixMonthsAgo = dateFns.subMonths(new Date(), 6).toISOString();
    const { data: tickets, error: fetchError } = await supabase
      .from('freshdesk_tickets')
      .select('*')
      .eq('cf_company', customerName)
      .gte('created_at', sixMonthsAgo);

    if (fetchError) throw fetchError;
    if (!tickets || tickets.length === 0) {
      return new Response(JSON.stringify({ empty: true }), { status: 200, headers: corsHeaders });
    }

    const now = new Date();
    const currentMonthStart = dateFns.startOfMonth(now);
    const prevMonthStart = dateFns.startOfMonth(dateFns.subMonths(now, 1));

    // --- 2. Calculate Current Month Metrics ---
    const currentTickets = tickets.filter(t => new Date(t.created_at) >= currentMonthStart);
    const prevTickets = tickets.filter(t => {
      const d = new Date(t.created_at);
      return d >= prevMonthStart && d < currentMonthStart;
    });

    const criticalCount = currentTickets.filter(t => t.priority === 'Urgent').length;
    const slaBreaches = currentTickets.filter(t => t.due_by && dateFns.isPast(new Date(t.due_by)) && !['resolved', 'closed'].includes(t.status.toLowerCase())).length;
    
    // Mocking reopened and fast resolutions as they aren't explicitly in the schema yet
    const reopenedCount = Math.floor(currentTickets.length * 0.1); 
    const fastResolutions = currentTickets.filter(t => {
      const isResolved = ['resolved', 'closed'].includes(t.status.toLowerCase());
      if (!isResolved) return false;
      const hours = dateFns.differenceInHours(new Date(t.updated_at), new Date(t.created_at));
      return hours <= 24;
    }).length;

    const growthRate = prevTickets.length === 0 ? 0 : (currentTickets.length - prevTickets.length) / prevTickets.length;

    // --- 3. Health Score Formula ---
    // Health Score = 100 - (critical*5) - (reopened*3) - (sla_breaches*4) + (fast_resolutions*2) - (growth_rate*10)
    let healthScore = 100 
      - (criticalCount * 5) 
      - (reopenedCount * 3) 
      - (slaBreaches * 4) 
      + (fastResolutions * 2) 
      - (Math.max(0, growthRate) * 10);

    healthScore = Math.min(100, Math.max(0, Math.round(healthScore)));

    const getStatus = (score: number) => {
      if (score >= 80) return 'Healthy';
      if (score >= 60) return 'Stable';
      if (score >= 40) return 'At Risk';
      return 'Critical';
    };

    // --- 4. Signal Detection ---
    const riskSignals = [];
    const opportunitySignals = [];
    const actions = [];

    // Risk Rules
    if (growthRate > 0.5) {
      riskSignals.push({ id: '1', title: 'Ticket Volume Spike', severity: 'Medium', type: 'risk' });
      actions.push({ id: 'a1', title: 'Schedule proactive check-in', description: 'Volume has increased significantly this month.' });
    }
    if (criticalCount > 3) {
      riskSignals.push({ id: '2', title: 'Critical Incident Surge', severity: 'High', type: 'risk' });
      actions.push({ id: 'a2', title: 'Engineering Escalation', description: 'High frequency of urgent tickets detected.' });
    }
    
    // Module specific risk
    const moduleCounts: Record<string, number> = {};
    currentTickets.forEach(t => { if(t.cf_module) moduleCounts[t.cf_module] = (moduleCounts[t.cf_module] || 0) + 1; });
    const topModule = Object.entries(moduleCounts).sort((a,b) => b[1] - a[1])[0];
    if (topModule && topModule[1] > currentTickets.length * 0.4) {
      riskSignals.push({ id: '3', title: `Repeated ${topModule[0]} Module Issues`, severity: 'High', type: 'risk' });
      actions.push({ id: 'a3', title: 'Product Workflow Review', description: `Concentrated issues in ${topModule[0]} module.` });
    }

    // Opportunity Rules
    if (growthRate < -0.3) {
      opportunitySignals.push({ id: 'o1', title: 'Ticket volume decreased by 30%+', severity: 'Low', type: 'opportunity' });
    }
    if (criticalCount === 0 && currentTickets.length > 5) {
      opportunitySignals.push({ id: 'o2', title: 'No critical incidents in 30 days', severity: 'Low', type: 'opportunity' });
    }
    if (fastResolutions > currentTickets.length * 0.5) {
      opportunitySignals.push({ id: 'o3', title: 'Efficiency improvement detected', severity: 'Low', type: 'opportunity' });
    }

    // --- 5. Trend Timeline ---
    const trendTimeline = [];
    for (let i = 2; i >= 0; i--) {
      const mDate = dateFns.subMonths(now, i);
      const mLabel = dateFns.format(mDate, 'MMM');
      // Simplified historical score for demo
      const mScore = i === 0 ? healthScore : Math.round(healthScore * (0.9 + Math.random() * 0.2));
      trendTimeline.push({
        month: dateFns.format(mDate, 'yyyy-MM'),
        label: mLabel,
        score: mScore,
        status: getStatus(mScore)
      });
    }

    return new Response(JSON.stringify({
      healthScore,
      status: getStatus(healthScore),
      riskSignals,
      opportunitySignals,
      recommendedActions: actions.length > 0 ? actions : [{ id: 'default', title: 'Continue Monitoring', description: 'No immediate actions required.' }],
      trendTimeline
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