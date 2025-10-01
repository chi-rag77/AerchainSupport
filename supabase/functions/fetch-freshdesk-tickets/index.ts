// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
// @ts-ignore
import * as dateFns from "https://esm.sh/date-fns@2.30.0"; // Import dateFns for date calculations

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
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'); // Use service role key for server-side operations

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return new Response(JSON.stringify({ error: 'Supabase URL or Service Role Key not set in environment variables.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client with service role key for full access
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const requestBody = await req.json();
    const { action } = requestBody;

    if (action === 'syncTickets') {
      // @ts-ignore
      const freshdeskDomain = Deno.env.get('FRESHDESK_DOMAIN');
      // @ts-ignore
      const freshdeskApiKey = Deno.env.get('FRESHDESK_API_KEY');

      if (!freshdeskDomain || !freshdeskApiKey) {
        return new Response(JSON.stringify({ error: 'Freshdesk API key or domain not set.' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const authString = btoa(`${freshdeskApiKey}:X`);
      const headers = {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
      };

      let allFreshdeskTickets: any[] = [];
      let page = 1;
      const perPage = 100; // Max per_page for Freshdesk API

      // Calculate timestamp for last 24 hours
      const now = new Date();
      const twentyFourHoursAgo = dateFns.subHours(now, 24);
      const updatedSince = dateFns.formatISO(twentyFourHoursAgo, { representation: 'complete' });

      console.log(`Starting Freshdesk ticket sync for tickets updated since: ${updatedSince}`);

      while (true) {
        const freshdeskApiUrl = `https://${freshdeskDomain}.freshdesk.com/api/v2/tickets?updated_since=${updatedSince}&page=${page}&per_page=${perPage}`;
        console.log(`Fetching Freshdesk tickets from: ${freshdeskApiUrl}`);
        const freshdeskResponse = await fetch(freshdeskApiUrl, { headers });

        if (!freshdeskResponse.ok) {
          const errorText = await freshdeskResponse.text();
          console.error(`Freshdesk API error (page ${page}): ${freshdeskResponse.status} - ${errorText}`);
          throw new Error(`Freshdesk API error: ${freshdeskResponse.status} - ${errorText}`);
        }

        const ticketsPage = await freshdeskResponse.json();
        console.log(`Fetched ${ticketsPage.length} tickets from Freshdesk page ${page}`);

        if (!ticketsPage || ticketsPage.length === 0) {
          console.log("No more tickets from Freshdesk. Breaking pagination loop.");
          break; // No more tickets
        }

        allFreshdeskTickets = allFreshdeskTickets.concat(ticketsPage);
        page++;

        // Add a small delay to avoid hitting rate limits (Freshdesk has 600 req/min for most plans)
        await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay = 5 requests/sec, well within limits
      }

      console.log(`Total tickets fetched from Freshdesk: ${allFreshdeskTickets.length}`);

      // Transform Freshdesk ticket data to match Supabase table schema
      const transformedTickets = allFreshdeskTickets.map((ticket: any) => ({
        freshdesk_id: String(ticket.id), // Ensure ID is string. Assuming Freshdesk always provides an ID.
        subject: ticket.subject || 'No Subject Provided', // Fallback for subject
        priority: ticket.priority_name || `Unknown (${ticket.priority || 'N/A'})`, // Fallback for priority
        status: ticket.status_name || `Unknown (${ticket.status || 'N/A'})`,     // Fallback for status
        type: ticket.type, // Nullable
        requester_email: ticket.requester_email || 'unknown@freshdesk.com', // Fallback for requester_email
        created_at: ticket.created_at || new Date().toISOString(), // Fallback for created_at
        updated_at: ticket.updated_at || new Date().toISOString(), // Fallback for updated_at
        due_by: ticket.due_by, // Nullable
        fr_due_by: ticket.fr_due_by, // Nullable
        description_text: ticket.description_text, // Nullable
        description_html: ticket.description_html, // Nullable
        assignee: ticket.responder_id ? String(ticket.responder_id) : 'Unassigned', // Fallback for assignee
        cf_company: ticket.custom_fields?.cf_company, // Nullable
        cf_country: ticket.custom_fields?.cf_country, // Nullable
        cf_module: ticket.custom_fields?.cf_module, // Nullable
        cf_dependency: ticket.custom_fields?.cf_dependency, // Nullable
        cf_recurrence: ticket.custom_fields?.cf_recurrence, // Nullable
        custom_fields: ticket.custom_fields || {}, // Store all custom fields as JSONB, default to empty object
      }));

      // Upsert into Supabase
      const { data: upsertData, error: upsertError } = await supabase
        .from('freshdesk_tickets')
        .upsert(transformedTickets, { onConflict: 'freshdesk_id' });

      if (upsertError) {
        console.error('Supabase Upsert Error:', upsertError);
        throw new Error(`Failed to upsert tickets to Supabase: ${upsertError.message}`);
      }

      console.log(`Successfully upserted ${transformedTickets.length} tickets to Supabase.`);

      return new Response(JSON.stringify({ message: `Successfully synced ${transformedTickets.length} tickets from Freshdesk.` }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(JSON.stringify({ error: 'Invalid action.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in Edge Function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});