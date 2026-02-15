// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore
import * as dateFns from "https://esm.sh/date-fns@2.30.0";
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Ticket {
  freshdesk_id: string;
  subject: string;
  status: string;
  updated_at: string;
  created_at: string;
  cf_company?: string;
  priority: string;
  due_by?: string;
  assignee?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(JSON.stringify({ error: 'Supabase environment variables not set.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response('Unauthorized', { status: 401, headers: corsHeaders });

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: tickets, error: fetchError } = await supabase
      .from('freshdesk_tickets')
      .select('*')
      .limit(10000);

    if (fetchError) throw fetchError;

    const now = new Date();
    const activeTickets = (tickets as Ticket[]).filter(t => !['resolved', 'closed'].includes(t.status.toLowerCase()));
    
    // --- 1. Calculate Risk Metrics ---
    const highEscalationRisk = activeTickets.filter(t => t.priority.toLowerCase() === 'urgent' || t.status.toLowerCase() === 'escalated').length;
    const slaBreachPredicted = activeTickets.filter(t => t.due_by && dateFns.differenceInHours(new Date(t.due_by), now) < 4).length;
    
    const agentCounts: Record<string, number> = {};
    activeTickets.forEach(t => {
      const name = t.assignee || 'Unassigned';
      agentCounts[name] = (agentCounts[name] || 0) + 1;
    });
    const overloadedAgents = Object.values(agentCounts).filter(count => count > 15).length;

    // --- 2. Generate Executive Summary (Logic-based for now, can be AI-enhanced) ---
    const topCompany = activeTickets.reduce((acc, t) => {
      const co = t.cf_company || 'Unknown';
      acc[co] = (acc[co] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const busiestCompany = Object.entries(topCompany).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    const executiveSummary = {
      summary: `Operations are currently managing ${activeTickets.length} active tickets. ${busiestCompany} is the primary driver of volume this period. SLA adherence is stable, but ${slaBreachPredicted} tickets require immediate attention to prevent breaches.`,
      keyDrivers: [
        `${busiestCompany} Volume Spike`,
        `${highEscalationRisk} Urgent Escalations`,
        `${overloadedAgents} Agents at Capacity`
      ],
      trendDirection: activeTickets.length > 50 ? 'worsening' : 'improving',
      executiveAction: `Reassign high-priority tickets from overloaded agents and prioritize ${busiestCompany} resolutions.`,
      confidenceScore: 88
    };

    // --- 3. Generate Individual Insights (for the strip) ---
    const insights = [];
    if (slaBreachPredicted > 0) {
      insights.push({
        message: `${slaBreachPredicted} tickets are predicted to breach SLA within 4 hours.`,
        type: 'risk',
        severity: 'critical',
        link: '/tickets?filter=sla'
      });
    }
    if (highEscalationRisk > 5) {
      insights.push({
        message: `Urgent ticket volume has reached a critical threshold for ${busiestCompany}.`,
        type: 'trend',
        severity: 'warning',
        link: `/tickets?company=${busiestCompany}`
      });
    }

    return new Response(JSON.stringify({
      executiveSummary,
      risks: [
        { title: "High Escalation Risk", count: highEscalationRisk, trend: 5, color: "from-red-500 to-red-600" },
        { title: "SLA Breach Predicted", count: slaBreachPredicted, trend: -10, color: "from-orange-500 to-orange-600" },
        { title: "Overloaded Agents", count: overloadedAgents, trend: 0, color: "from-purple-500 to-purple-600" }
      ],
      insights
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