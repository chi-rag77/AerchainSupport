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

// Define the Insight type (should match your client-side types/index.ts)
interface Insight {
  id: string;
  type: 'stalledOnTech' | 'highPriority' | 'info' | 'highVolumeCustomer'; // Updated type
  message: string;
  severity: 'info' | 'warning' | 'critical';
  icon?: string;
}

// Define the Ticket type (should match your client-side types/index.ts)
interface Ticket {
  id: string;
  freshdesk_id: string;
  subject: string;
  status: string;
  updated_at: string;
  created_at: string; // Added created_at for high volume customer activity
  cf_company?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // @ts-ignore
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    // @ts-ignore
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(JSON.stringify({ error: 'Supabase URL or Anon Key not set in environment variables.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    const { data: tickets, error: fetchError } = await supabase
      .from('freshdesk_tickets')
      .select('freshdesk_id, subject, status, updated_at, created_at, cf_company') // Select created_at
      .limit(10000);

    if (fetchError) {
      console.error('Supabase Fetch Error:', fetchError);
      return new Response(JSON.stringify({ error: `Failed to fetch tickets from Supabase: ${fetchError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const insights: Insight[] = [];
    const now = new Date();

    // --- Stalled Tickets Logic ---
    const activeStatuses = [
      'Open (Being Processed)',
      'Pending (Awaiting your Reply)',
      'Waiting on Customer',
      'On Tech',
      'On Product',
      'Escalated',
    ].map(s => s.toLowerCase());

    const stalledThresholdDays = 3;

    (tickets as Ticket[]).forEach(ticket => {
      const ticketUpdatedAt = new Date(ticket.updated_at);
      const daysSinceUpdate = dateFns.differenceInDays(now, ticketUpdatedAt);
      const companyName = ticket.cf_company || 'Unknown Company';

      if (activeStatuses.includes(ticket.status.toLowerCase()) && daysSinceUpdate >= stalledThresholdDays) {
        insights.push({
          id: `stalled-${ticket.freshdesk_id}`,
          type: 'stalledOnTech',
          message: `Ticket ${ticket.freshdesk_id} for ${companyName} has been stalled '${ticket.status}' for ${daysSinceUpdate} days.`,
          severity: daysSinceUpdate >= 5 ? 'critical' : 'warning',
          icon: 'Clock',
        });
      }
    });

    // --- High Volume Customer Activity Logic ---
    const highVolumeThreshold = 5; // e.g., 5 tickets in 24 hours
    const last24Hours = dateFns.subDays(now, 1);

    const customerTicketCounts = new Map<string, number>();
    (tickets as Ticket[]).forEach(ticket => {
      const ticketCreatedAt = new Date(ticket.created_at);
      const companyName = ticket.cf_company || 'Unknown Company';

      if (dateFns.isAfter(ticketCreatedAt, last24Hours)) {
        customerTicketCounts.set(companyName, (customerTicketCounts.get(companyName) || 0) + 1);
      }
    });

    customerTicketCounts.forEach((count, companyName) => {
      if (count >= highVolumeThreshold) {
        insights.push({
          id: `high-volume-${companyName.replace(/\s/g, '-')}`,
          type: 'highVolumeCustomer',
          message: `${companyName} has opened ${count} new tickets in the last 24 hours. Consider proactive outreach.`,
          severity: count >= 10 ? 'critical' : 'warning', // More critical if even higher volume
          icon: 'Users',
        });
      }
    });

    return new Response(JSON.stringify(insights), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in Edge Function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});