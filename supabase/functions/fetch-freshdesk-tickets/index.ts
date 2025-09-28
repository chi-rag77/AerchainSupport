// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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

interface FreshdeskConversation {
  id: number;
  body: string; // HTML content
  body_text: string; // Plain text content
  created_at: string;
  updated_at: string;
  ticket_id: number;
  user_id: number | null; // Agent ID if from agent, null if from requester
  support_email: string | null;
  incoming: boolean; // true if from customer, false if from agent
  private: boolean;
  // ... other fields
}

interface FormattedConversationMessage {
  id: string;
  sender: string; // Name of sender (Agent or Requester)
  body_html: string; // The actual message content
  created_at: string;
  is_agent: boolean;
}

async function fetchTicketConversations(ticketId: number, requesterEmail: string, apiKey: string, domain: string): Promise<FormattedConversationMessage[]> {
  const url = `https://${domain}.freshdesk.com/api/v2/tickets/${ticketId}/conversations`;
  const options = {
    method: "GET",
    headers: {
      "Authorization": "Basic " + btoa(apiKey + ":X")
    }
  };

  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      console.error(`Failed to fetch conversations for ticket ${ticketId}: ${res.status} ${await res.text()}`);
      return [];
    }
    const convos: FreshdeskConversation[] = await res.json();

    const formattedConvos: FormattedConversationMessage[] = [];

    for (const convo of convos) {
      let senderName: string;
      let isAgentMessage: boolean;

      if (convo.user_id) { // It's an agent
        senderName = await getAgentName(convo.user_id, apiKey, domain);
        isAgentMessage = true;
      } else { // It's the requester (customer)
        senderName = requesterEmail; // Use requester email as name for now
        isAgentMessage = false;
      }

      formattedConvos.push({
        id: convo.id.toString(),
        sender: senderName,
        body_html: convo.body || convo.body_text || "No content", // Prefer HTML, fallback to text
        created_at: convo.created_at,
        is_agent: isAgentMessage,
      });
    }
    return formattedConvos.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()); // Sort by date
  } catch (error) {
    console.error(`Error fetching conversations for ticket ${ticketId}:`, error);
    return [];
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

    if (!freshdeskApiKey || !freshdeskDomain) {
      return new Response(JSON.stringify({ error: 'Freshdesk API key or domain not set in environment variables.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    // Parse the request body to determine the action
    let requestBody;
    if (req.headers.get('content-type')?.includes('application/json')) {
      requestBody = await req.json();
    } else {
      return new Response(JSON.stringify({ error: 'Invalid Content-Type. Expected application/json.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action, ticketId, requesterEmail } = requestBody; // Added requesterEmail

    switch (action) {
      case 'getTickets': {
        const today = new Date();
        const day = today.getDay();
        const diffToMonday = (day === 0 ? 6 : day - 1);
        const monday = new Date(today);
        monday.setDate(today.getDate() - diffToMonday);
        monday.setHours(0, 0, 0, 0);
        const updatedSince = monday.toISOString();

        const fdOptions = {
          method: "GET",
          headers: {
            "Authorization": "Basic " + btoa(freshdeskApiKey + ":X"),
          },
        };

        let page = 1;
        let hasMore = true;
        const allTickets = [];

        while (hasMore) {
          // Updated 'include' parameter to match Freshdesk's expected values
          const url = `https://${freshdeskDomain}.freshdesk.com/api/v2/tickets?include=requester,stats,company,description&updated_since=${encodeURIComponent(updatedSince)}&page=${page}&per_page=100`;
          
          const response = await fetch(url, fdOptions);
          
          if (!response.ok) {
            console.error(`Freshdesk API Error (Code: ${response.status}): ${await response.text()}`);
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

            allTickets.push({
              id: ticket.id?.toString(),
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
            });
          }

          page++;
          await new Promise(resolve => setTimeout(resolve, 1000)); 
        }

        return new Response(JSON.stringify(allTickets), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'getConversationSummary': { // Renamed to fetchTicketConversations in the function, but action name remains for backward compatibility
        if (!ticketId || !requesterEmail) {
          return new Response(JSON.stringify({ error: 'Ticket ID and Requester Email are required for conversation summary.' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        const conversations = await fetchTicketConversations(Number(ticketId), requesterEmail, freshdeskApiKey, freshdeskDomain);
        return new Response(JSON.stringify(conversations), {
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