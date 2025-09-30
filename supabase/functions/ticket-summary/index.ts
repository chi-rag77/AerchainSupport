// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import * as dateFns from "npm:date-fns@2.30.0";
import { createClient } from 'npm:@supabase/supabase-js@2.45.0'; // Import Supabase client

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Initialize Supabase client within the Edge Function
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader }, // Pass the user's JWT to Supabase client
      },
    });

    let dateParam: string | null = null;
    let customerParam: string | null = null;
    let requestBody: any = {};

    const contentType = req.headers.get('content-type');

    if (req.method === 'POST') {
      if (contentType?.includes('application/json')) {
        let rawBodyText = '';
        try {
          rawBodyText = await req.text();
          if (rawBodyText.trim() === '') {
            requestBody = {};
          } else {
            requestBody = JSON.parse(rawBodyText);
          }
          dateParam = requestBody.date;
          customerParam = requestBody.customer;
        } catch (jsonError) {
          console.error(`Error parsing JSON body: ${jsonError.message}. Raw body: "${rawBodyText}"`);
          return new Response(JSON.stringify({ error: `Failed to parse JSON body: ${jsonError.message}` }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      } else {
        return new Response(JSON.stringify({ error: 'Invalid Content-Type. Expected application/json.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } else {
      const url = new URL(req.url);
      dateParam = url.searchParams.get('date');
      customerParam = url.searchParams.get('customer');
    }

    if (!dateParam) {
      dateParam = dateFns.format(new Date(), 'yyyy-MM-dd');
    }

    const targetCreationDate = new Date(dateParam);
    targetCreationDate.setUTCHours(0, 0, 0, 0);
    const targetCreationEndDate = new Date(targetCreationDate);
    targetCreationEndDate.setUTCDate(targetCreationDate.getUTCDate() + 1);

    // Fetch tickets from Supabase freshdesk_tickets table
    const { data: allTicketsRaw, error: fetchError } = await supabase
      .from('freshdesk_tickets')
      .select('*')
      .limit(10000); // Explicitly added limit here

    if (fetchError) {
      console.error('Supabase Fetch Error:', fetchError);
      return new Response(JSON.stringify({ error: `Failed to fetch tickets from Supabase: ${fetchError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // --- Post-fetch Filtering and Aggregation Logic ---
    let ticketsCreatedOnSelectedDate = (allTicketsRaw || []).filter(ticket => {
      const ticketCreatedAt = new Date(ticket.created_at);
      return dateFns.isWithinInterval(ticketCreatedAt, { start: targetCreationDate, end: targetCreationEndDate });
    });

    let filteredTickets = ticketsCreatedOnSelectedDate;
    if (customerParam && customerParam !== "All") {
      filteredTickets = ticketsCreatedOnSelectedDate.filter(ticket => ticket.cf_company === customerParam);
    }

    const totalTicketsToday = filteredTickets.length;
    const resolvedToday = filteredTickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;
    const openCount = filteredTickets.filter(t => t.status === 'Open (Being Processed)').length;
    const pendingOnTech = filteredTickets.filter(t => t.status === 'On Tech').length;

    const typeBreakdown: { [key: string]: number } = {};
    filteredTickets.forEach(t => {
      typeBreakdown[t.type || 'Unknown Type'] = (typeBreakdown[t.type || 'Unknown Type'] || 0) + 1;
    });

    const statusBreakdown: { [key: string]: number } = {};
    filteredTickets.forEach(t => {
      statusBreakdown[t.status] = (statusBreakdown[t.status] || 0) + 1;
    });

    const customerBreakdown: { [key: string]: { totalInPeriod: number; resolvedInPeriod: number; open: number; pendingTech: number; bugs: number; tasks: number; queries: number; otherActive: number; } } = {};
    ticketsCreatedOnSelectedDate.forEach(ticket => {
      const company = ticket.cf_company || 'Unknown Company';
      if (!customerBreakdown[company]) {
        customerBreakdown[company] = { totalInPeriod: 0, resolvedInPeriod: 0, open: 0, pendingTech: 0, bugs: 0, tasks: 0, queries: 0, otherActive: 0 };
      }
      customerBreakdown[company].totalInPeriod++;
      if (ticket.status === 'Resolved' || ticket.status === 'Closed') customerBreakdown[company].resolvedInPeriod++;
      if (ticket.status === 'Open (Being Processed)') customerBreakdown[company].open++;
      if (ticket.status === 'On Tech') customerBreakdown[company].pendingTech++;
      if (ticket.type === 'Bug') customerBreakdown[company].bugs++;
      if (ticket.type === 'Task') customerBreakdown[company].tasks++;
      if (ticket.type === 'Query') customerBreakdown[company].queries++;
      // Calculate otherActive for DashboardV2
      const statusLower = ticket.status.toLowerCase();
      if (!['resolved', 'closed', 'open (being processed)', 'on tech'].includes(statusLower)) {
        customerBreakdown[company].otherActive++;
      }
    });

    const responseData = {
      date: dateParam,
      customer: customerParam || "All",
      totalTicketsToday,
      resolvedToday,
      openCount,
      pendingOnTech,
      typeBreakdown,
      statusBreakdown,
      customerBreakdown: Object.entries(customerBreakdown).map(([company, data]) => ({ name: company, ...data })),
      rawTickets: filteredTickets,
    };

    return new Response(JSON.stringify(responseData), {
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