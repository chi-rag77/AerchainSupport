// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0?dts'; // Import Supabase client

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PRIORITY_MAP: { [key: number]: string } = {
  1: "Low",
  2: "Medium",
  3: "High",
  4: "Urgent"
};

const STATUS_MAP: { [key: number]: string } = {
  2: "Open (Being Processed)",
  3: "Pending (Awaiting your Reply)",
  4: "Resolved",
  5: "Closed",
  8: "Waiting on Customer",
  7: "On Tech",
  9: "On Product",
};

const agentCache = new Map();

async function getAgentName(agentId: number, apiKey: string, domain: string): Promise<string> {
  if (!agentId) return "Unassigned";
  if (agentCache.has(agentId)) return agentCache.get(agentId);

  const url = `https://${domain}.freshdesk.com/api/v2/agents/${agentId}`;
  const options = {
    method: "GET",
    headers: {
      "Authorization": "Basic " + btoa(apiKey + ":X")
    }
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      console.error(`Failed to fetch agent ${agentId}: ${response.status} ${await response.text()}`);
      return "Unassigned";
    }
    const agent = await response.json();
    const name = agent.contact?.name || agent.contact?.email || "Unassigned";
    agentCache.set(agentId, name);
    return name;
  } catch (error) {
    console.error(`Error fetching agent ${agentId}:`, error);
    return "Unassigned";
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // @ts-ignore
    const freshdeskApiKey = Deno.env.get('FRESHDESK_API_KEY');
    // @ts-ignore
    const freshdeskDomain = Deno.env.get('FRESHDESK_DOMAIN');
    // @ts-ignore
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    // @ts-ignore
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY'); // Use anon key for client-invoked functions

    if (!freshdeskApiKey || !freshdeskDomain || !supabaseUrl || !supabaseAnonKey) {
      return new Response(JSON.stringify({ error: 'Environment variables for Freshdesk or Supabase not set.' }), {
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

    let requestBody;
    if (req.headers.get('content-type')?.includes('application/json')) {
      requestBody = await req.json();
    } else {
      return new Response(JSON.stringify({ error: 'Invalid Content-Type. Expected application/json.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action } = requestBody;

    switch (action) {
      case 'syncTickets': { // Renamed action to 'syncTickets'
        const today = new Date();
        // Fetch tickets updated in the last 24 hours for daily sync
        const twentyFourHoursAgo = new Date(today.getTime() - (24 * 60 * 60 * 1000));
        const updatedSince = twentyFourHoursAgo.toISOString();

        const fdOptions = {
          method: "GET",
          headers: {
            "Authorization": "Basic " + btoa(freshdeskApiKey + ":X"),
          },
        };

        let page = 1;
        let hasMore = true;
        const ticketsToUpsert = [];

        while (hasMore) {
          const url = `https://${freshdeskDomain}.freshdesk.com/api/v2/tickets?include=requester,stats,company,description&updated_since=${encodeURIComponent(updatedSince)}&page=${page}&per_page=100`;
          
          const response = await fetch(url, fdOptions);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Freshdesk API Error (Code: ${response.status}): ${errorText}`);
            if (response.status === 429) {
              console.warn("Rate limit hit. Stopping sync.");
            }
            hasMore = false;
            break;
          }

          const tickets = await response.json();

          if (!tickets || tickets.length === 0) {
            hasMore = false;
            break;
          }

          for (const ticket of tickets) {
            const requesterEmail = ticket.requester?.email || "";
            const priorityString = PRIORITY_MAP[ticket.priority] || `Unknown (${ticket.priority})`;
            const statusString = STATUS_MAP[ticket.status] || `Unknown (${ticket.status})`;

            ticketsToUpsert.push({
              freshdesk_id: ticket.id?.toString(), // Use freshdesk_id for upsert key
              subject: ticket.subject || "",
              priority: priorityString,
              status: statusString,
              type: ticket.type || "",
              requester_email: requesterEmail,
              created_at: ticket.created_at || "",
              updated_at: ticket.updated_at || "",
              description_text: ticket.description_text || "",
              description_html: ticket.description_html || "",
              assignee: await getAgentName(ticket.responder_id, freshdeskApiKey, freshdeskDomain),
              cf_company: ticket.custom_fields?.cf_company || "",
              cf_country: ticket.custom_fields?.cf_country || "",
              cf_module: ticket.custom_fields?.cf_module || "",
              cf_dependency: ticket.custom_fields?.cf_dependency || "",
              cf_recurrence: ticket.custom_fields?.cf_recurrence || "",
              custom_fields: ticket.custom_fields || {},
            });
          }

          page++;
          await new Promise(resolve => setTimeout(resolve, 1000)); 
        }

        // Upsert tickets into Supabase
        const { data: upsertedData, error: upsertError } = await supabase
          .from('freshdesk_tickets')
          .upsert(ticketsToUpsert, { onConflict: 'freshdesk_id' }); // Use freshdesk_id for conflict resolution

        if (upsertError) {
          console.error('Supabase Upsert Error:', upsertError);
          return new Response(JSON.stringify({ error: `Failed to upsert tickets to Supabase: ${upsertError.message}` }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ message: `Successfully synced ${ticketsToUpsert.length} tickets.`, upsertedData }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid action specified.' }), {
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