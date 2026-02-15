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

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: req.headers.get('Authorization')! } },
    });

    // 1. Fetch Tickets and AI Analysis
    const [{ data: tickets }, { data: aiAnalysis }] = await Promise.all([
      supabase.from('freshdesk_tickets').select('*').limit(1000),
      supabase.from('ai_ticket_analysis').select('*')
    ]);

    const now = new Date();
    const activeTickets = (tickets || []).filter(t => !['resolved', 'closed'].includes(t.status.toLowerCase()));
    const aiMap = new Map((aiAnalysis || []).map(a => [a.ticket_id, a]));

    // --- Logic 1: Escalation Risk ---
    const highEscalationTickets = activeTickets.filter(t => {
      const ai = aiMap.get(t.freshdesk_id);
      return ai?.escalation_risk === 'high' || t.status.toLowerCase() === 'escalated';
    }).map(t => ({
      ...t,
      riskReason: aiMap.get(t.freshdesk_id)?.escalation_reason || "High priority with negative sentiment patterns.",
      suggestedAction: aiMap.get(t.freshdesk_id)?.suggested_action || "Immediate manager intervention required.",
      confidenceScore: aiMap.get(t.freshdesk_id)?.confidence_score || 85
    }));

    // --- Logic 2: SLA Risk ---
    const slaRiskTickets = activeTickets.filter(t => {
      if (!t.due_by) return false;
      const due = new Date(t.due_by);
      const created = new Date(t.created_at);
      const totalWindow = due.getTime() - created.getTime();
      const remaining = due.getTime() - now.getTime();
      const percentRemaining = (remaining / totalWindow) * 100;
      return percentRemaining < 20 || dateFns.isPast(due);
    }).map(t => {
      const due = new Date(t.due_by!);
      const created = new Date(t.created_at);
      const percentRemaining = Math.max(0, ((due.getTime() - now.getTime()) / (due.getTime() - created.getTime())) * 100);
      return {
        ...t,
        slaRemainingPercent: Math.round(percentRemaining),
        riskReason: dateFns.isPast(due) ? "SLA Breached" : `Less than ${Math.round(percentRemaining)}% time remaining.`,
        suggestedAction: "Prioritize resolution or request SLA extension."
      };
    });

    // --- Logic 3: Agent Overload ---
    const agentCounts: Record<string, number> = {};
    activeTickets.forEach(t => {
      const name = t.assignee || 'Unassigned';
      agentCounts[name] = (agentCounts[name] || 0) + 1;
    });
    const overloadedAgents = Object.entries(agentCounts).filter(([_, count]) => count > 12);
    const overloadTickets = activeTickets.filter(t => agentCounts[t.assignee || 'Unassigned'] > 12).map(t => ({
      ...t,
      riskReason: `Assigned to ${t.assignee} who is at ${Math.round((agentCounts[t.assignee!] / 12) * 100)}% capacity.`,
      suggestedAction: "Reassign to available agent."
    }));

    // --- Logic 4: Volume Spike ---
    const last24h = activeTickets.filter(t => dateFns.differenceInHours(now, new Date(t.created_at)) <= 24).length;
    const prev24h = activeTickets.filter(t => {
      const diff = dateFns.differenceInHours(now, new Date(t.created_at));
      return diff > 24 && diff <= 48;
    }).length;
    const volumeTrend = prev24h === 0 ? 0 : Math.round(((last24h - prev24h) / prev24h) * 100);

    const response: any = {
      summary: {
        message: `Escalation risk is ${highEscalationTickets.length > 5 ? 'increasing' : 'stable'}, primarily driven by ${highEscalationTickets[0]?.cf_company || 'recent activity'}.`,
        posture: highEscalationTickets.length > 10 ? 'Critical' : highEscalationTickets.length > 5 ? 'Deteriorating' : 'Stable'
      },
      metrics: {
        escalationRisk: {
          count: highEscalationTickets.length,
          trend: 4,
          riskLevel: highEscalationTickets.length > 8 ? 'HIGH' : 'MEDIUM',
          microInsight: `Concentrated in ${highEscalationTickets[0]?.cf_company || 'N/A'}.`,
          tickets: highEscalationTickets
        },
        slaRisk: {
          count: slaRiskTickets.length,
          trend: -2,
          riskLevel: slaRiskTickets.length > 5 ? 'HIGH' : 'MEDIUM',
          microInsight: `${slaRiskTickets.filter(t => dateFns.isPast(new Date(t.due_by!))).length} tickets already breached.`,
          tickets: slaRiskTickets
        },
        agentOverload: {
          count: overloadedAgents.length,
          trend: 0,
          riskLevel: overloadedAgents.length > 2 ? 'HIGH' : 'LOW',
          microInsight: `${overloadedAgents[0]?.[0] || 'None'} at highest load.`,
          tickets: overloadTickets
        },
        volumeSpike: {
          count: volumeTrend,
          trend: volumeTrend,
          riskLevel: volumeTrend > 20 ? 'HIGH' : 'LOW',
          microInsight: `${activeTickets[0]?.cf_company || 'N/A'} driving volume.`,
          tickets: []
        }
      }
    };

    return new Response(JSON.stringify(response), {
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