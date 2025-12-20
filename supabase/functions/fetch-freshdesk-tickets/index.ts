// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'; // Import Supabase client
// @ts-ignore
import * as dateFns from "https://esm.sh/date-fns@2.30.0"; // Import dateFns

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
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
  9: "On Product"
};

const agentCache = new Map<number, string>();

async function getAgentName(agentId: number | null | undefined, apiKey: string, domain: string): Promise<string> {
  if (!agentId) return "Unassigned";
  if (agentCache.has(agentId)) return agentCache.get(agentId)!;

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    // @ts-ignore
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    // @ts-ignore
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseServiceRoleKey || !supabaseAnonKey) {
      return new Response(JSON.stringify({ error: 'Supabase environment variables not set.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    // 1. Initialize Supabase client with user's JWT to get user info
    const userSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });
    
    const { data: { user }, error: userError } = await userSupabase.auth.getUser();
    if (userError || !user) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }
    const client_user_id = user.id; // This is also our org_id

    // 2. Initialize Supabase client with Service Role Key to fetch secrets (org_settings)
    const serviceSupabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { data: settings, error: settingsError } = await serviceSupabase
      .from("org_settings")
      .select("freshdesk_domain, freshdesk_api_key")
      .eq("org_id", client_user_id)
      .single();

    if (settingsError || !settings) {
      console.error('Freshdesk settings not configured:', settingsError);
      return new Response(JSON.stringify({ error: 'Freshdesk settings not configured for this organization.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const freshdeskApiKey = settings.freshdesk_api_key;
    const freshdeskDomain = settings.freshdesk_domain;

    let requestBody;
    if (req.headers.get('content-type')?.includes('application/json')) {
      requestBody = await req.json();
    } else {
      return new Response(JSON.stringify({ error: 'Invalid Content-Type. Expected application/json.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { action } = requestBody;

    switch (action) {
      case 'syncTickets': {
        const today = new Date();
        const twentyFourHoursAgo = dateFns.subHours(today, 24);
        const updatedSince = twentyFourHoursAgo.toISOString();

        const fdOptions = {
          method: "GET",
          headers: {
            "Authorization": "Basic " + btoa(freshdeskApiKey + ":X")
          }
        };

        let page = 1;
        let hasMore = true;
        const ticketsToUpsert: any[] = [];
        const notificationsToInsert: any[] = [];

        while (hasMore) {
          const url = `https://${freshdeskDomain}.freshdesk.com/api/v2/tickets?include=requester,stats,company,description&updated_since=${encodeURIComponent(updatedSince)}&page=${page}&per_page=100`;
          const response = await fetch(url, fdOptions);

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Freshdesk API Error (Code: ${response.status}): ${errorText}`);
            return new Response(JSON.stringify({ error: `Freshdesk API error: ${response.status} - ${errorText}` }), {
              status: response.status,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }

          const tickets = await response.json();

          if (!tickets || tickets.length === 0) {
            hasMore = false;
            break;
          }

          for (const ticket of tickets) {
            const requesterEmail = ticket.requester?.email || "unknown@freshdesk.com";
            const priorityString = PRIORITY_MAP[ticket.priority] || `Unknown (${ticket.priority || 'N/A'})`;
            const statusString = STATUS_MAP[ticket.status] || `Unknown (${ticket.status || 'N/A'})`;
            const assigneeName = await getAgentName(ticket.responder_id, freshdeskApiKey, freshdeskDomain);

            const newTicketData = {
              freshdesk_id: ticket.id?.toString() || `unknown-${Date.now()}`,
              subject: ticket.subject || "No Subject Provided",
              priority: priorityString,
              status: statusString,
              type: ticket.type || null,
              requester_email: requesterEmail,
              created_at: ticket.created_at || new Date().toISOString(),
              updated_at: ticket.updated_at || new Date().toISOString(),
              due_by: ticket.due_by || null,
              fr_due_by: ticket.fr_due_by || null,
              description_text: ticket.description_text || null,
              description_html: ticket.description_html || null,
              assignee: assigneeName,
              cf_company: ticket.custom_fields?.cf_company || null,
              cf_country: ticket.custom_fields?.cf_country || null,
              cf_module: ticket.custom_fields?.cf_module || null,
              cf_dependency: ticket.custom_fields?.cf_dependency || null,
              cf_recurrence: ticket.custom_fields?.cf_recurrence || null,
              custom_fields: ticket.custom_fields || {}
            };
            ticketsToUpsert.push(newTicketData);

            // Check if this is a new ticket or a critical update for notification
            const { data: existingTicket, error: fetchExistingError } = await userSupabase // Use userSupabase for RLS-protected tables
              .from('freshdesk_tickets')
              .select('status, priority')
              .eq('freshdesk_id', newTicketData.freshdesk_id)
              .single();

            if (fetchExistingError && fetchExistingError.code !== 'PGRST116') { // PGRST116 means "no rows found"
              console.error(`Error fetching existing ticket ${newTicketData.freshdesk_id}:`, fetchExistingError);
            }

            if (!existingTicket) {
              // New ticket created
              if (client_user_id) {
                notificationsToInsert.push({
                  user_id: client_user_id,
                  message: `New ticket #${newTicketData.freshdesk_id} created: ${newTicketData.subject}`,
                  type: 'info',
                  link: `/tickets?search=${newTicketData.freshdesk_id}`,
                });
              }
            } else {
              // Existing ticket updated - check for critical changes
              if (existingTicket.status !== newTicketData.status && (newTicketData.status === 'Urgent' || newTicketData.status === 'Escalated')) {
                if (client_user_id) {
                  notificationsToInsert.push({
                    user_id: client_user_id,
                    message: `Ticket #${newTicketData.freshdesk_id} status changed to ${newTicketData.status}: ${newTicketData.subject}`,
                    type: 'critical',
                    link: `/tickets?search=${newTicketData.freshdesk_id}`,
                  });
                }
              } else if (existingTicket.priority !== newTicketData.priority && newTicketData.priority === 'Urgent') {
                if (client_user_id) {
                  notificationsToInsert.push({
                    user_id: client_user_id,
                    message: `Ticket #${newTicketData.freshdesk_id} priority changed to ${newTicketData.priority}: ${newTicketData.subject}`,
                    type: 'critical',
                    link: `/tickets?search=${newTicketData.freshdesk_id}`,
                  });
                }
              }
            }
          }
          page++;
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Delay to respect rate limits
        }

        // Upsert tickets into Supabase
        const { data: upsertedData, error: upsertError } = await userSupabase.from('freshdesk_tickets').upsert(ticketsToUpsert, { onConflict: 'freshdesk_id' });

        if (upsertError) {
          console.error('Supabase Upsert Error:', upsertError);
          return new Response(JSON.stringify({ error: `Failed to upsert tickets to Supabase: ${upsertError.message}` }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Insert notifications
        if (notificationsToInsert.length > 0) {
          const { error: notificationError } = await userSupabase.from('user_notifications').insert(notificationsToInsert);
          if (notificationError) {
            console.error('Supabase Notification Insert Error:', notificationError);
          } else {
            console.log(`Inserted ${notificationsToInsert.length} notifications.`);
          }
        }

        return new Response(JSON.stringify({ message: `Successfully synced ${ticketsToUpsert.length} tickets.`, upsertedData }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      default:
        return new Response(JSON.stringify({ error: 'Invalid action specified.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
  } catch (error: any) {
    console.error('Error in Edge Function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});