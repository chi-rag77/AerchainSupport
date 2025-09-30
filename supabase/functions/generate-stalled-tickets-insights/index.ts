// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import * as dateFns from "https://esm.sh/date-fns@2.30.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'; // Changed to esm.sh

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Define the Insight type (should match your client-side types/index.ts)
interface Insight {
  id: string;
  type: 'stalledOnTech' | 'highPriority' | 'info';
  message: string;
  severity: 'info' | 'warning' | 'critical';
  icon?: string; // Using string for icon name as Lucide icons are not directly available in Edge Functions
}

// Define the Ticket type (should match your client-side types/index.ts)
interface Ticket {
  id: string;
  freshdesk_id: string;
  subject: string;
  status: string;
  updated_at: string;
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
      .select('freshdesk_id, subject, status, updated_at, cf_company')
      .limit(10000); // Fetch a reasonable number of tickets

    if (fetchError) {
      console.error('Supabase Fetch Error:', fetchError);
      return new Response(JSON.stringify({ error: `Failed to fetch tickets from Supabase: ${fetchError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const insights: Insight[] = [];
    const now = new Date();

    // Define statuses considered "active" and potentially stalled
    const activeStatuses = [
      'Open (Being Processed)',
      'Pending (Awaiting your Reply)',
      'Waiting on Customer',
      'On Tech',
      'On Product',
      'Escalated',
    ].map(s => s.toLowerCase());

    // Threshold for considering a ticket "stalled" (e.g., 3 days without update)
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
          severity: daysSinceUpdate >= 5 ? 'critical' : 'warning', // More critical if stalled longer
          icon: 'Clock', // Use string name for icon
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