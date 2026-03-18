// v1.0 - Dynamic Ticket Monitor Data Aggregator
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

    const { ticketId } = await req.json();
    if (!ticketId) throw new Error("ticketId is required.");

    // 1. Fetch Target Ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('freshdesk_tickets')
      .select('*')
      .eq('freshdesk_id', ticketId)
      .single();

    if (ticketError || !ticket) throw new Error("Ticket not found.");

    const now = new Date();
    const created = new Date(ticket.created_at);

    // --- 2. SLA & Risk Calculation ---
    let slaConsumedPercent = 0;
    let slaStatus = 'Healthy';
    if (ticket.due_by) {
      const due = new Date(ticket.due_by);
      const totalWindow = due.getTime() - created.getTime();
      const elapsed = now.getTime() - created.getTime();
      slaConsumedPercent = Math.min(100, Math.max(0, Math.round((elapsed / totalWindow) * 100)));
      
      if (dateFns.isPast(due)) slaStatus = 'Breached';
      else if (slaConsumedPercent > 80) slaStatus = 'At Risk';
      else if (slaConsumedPercent > 50) slaStatus = 'Warning';
    }

    // --- 3. Team Performance (Assignee Load) ---
    const assignee = ticket.assignee || 'Unassigned';
    const { count: activeLoad } = await supabase
      .from('freshdesk_tickets')
      .select('*', { count: 'exact', head: true })
      .eq('assignee', assignee)
      .not('status', 'in', '("Resolved","Closed")');

    // --- 4. Similar Issues Cluster (AI-like logic) ---
    // Find tickets in the same module for the same company in the last 30 days
    const thirtyDaysAgo = dateFns.subDays(now, 30).toISOString();
    const { data: similarTickets } = await supabase
      .from('freshdesk_tickets')
      .select('freshdesk_id, subject')
      .eq('cf_module', ticket.cf_module)
      .eq('cf_company', ticket.cf_company)
      .gte('created_at', thirtyDaysAgo)
      .neq('freshdesk_id', ticketId)
      .limit(10);

    // --- 5. Escalation Insights ---
    // Calculate escalation rate for this company in last 30 days vs previous 30
    const sixtyDaysAgo = dateFns.subDays(now, 60).toISOString();
    const { data: companyHistory } = await supabase
      .from('freshdesk_tickets')
      .select('status, created_at')
      .eq('cf_company', ticket.cf_company)
      .gte('created_at', sixtyDaysAgo);

    const recentEscalations = (companyHistory || []).filter(t => 
      new Date(t.created_at) >= new Date(thirtyDaysAgo) && 
      t.status.toLowerCase() === 'escalated'
    ).length;

    const prevEscalations = (companyHistory || []).filter(t => 
      new Date(t.created_at) < new Date(thirtyDaysAgo) && 
      t.status.toLowerCase() === 'escalated'
    ).length;

    const escalationTrend = prevEscalations === 0 ? (recentEscalations > 0 ? 100 : 0) : Math.round(((recentEscalations - prevEscalations) / prevEscalations) * 100);

    return new Response(JSON.stringify({
      sla: {
        consumedPercent: slaConsumedPercent,
        status: slaStatus,
        dueBy: ticket.due_by,
        ageDays: dateFns.differenceInDays(now, created)
      },
      team: {
        assignee,
        activeLoad: activeLoad || 0,
        avgResolutionTime: "4.2h" // Placeholder for complex calculation
      },
      clusters: {
        count: similarTickets?.length || 0,
        tickets: similarTickets || []
      },
      escalation: {
        trend: escalationTrend,
        recentCount: recentEscalations
      }
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