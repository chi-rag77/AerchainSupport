// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import * as dateFns from "https://esm.sh/date-fns@2.30.0/deno"; // Using Deno-compatible import path

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

    let dateParam: string | null = null;
    let customerParam: string | null = null;
    let requestBody: any = {}; // Initialize requestBody

    const contentType = req.headers.get('content-type');
    console.log('Incoming request Content-Type:', contentType); // Log Content-Type

    if (req.method === 'POST') {
      if (contentType?.includes('application/json')) {
        let rawBodyText = '';
        try {
          rawBodyText = await req.text(); // Read raw body as text
          console.log('Received raw request body:', rawBodyText); // Log raw body
          
          // Handle empty body gracefully
          if (rawBodyText.trim() === '') {
            requestBody = {}; // Default to empty object if body is empty
            console.log('Raw body was empty, defaulting requestBody to {}.');
          } else {
            requestBody = JSON.parse(rawBodyText); // Attempt to parse as JSON
          }
          
          console.log('Parsed requestBody:', JSON.stringify(requestBody)); // Log parsed body
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
    } else { // Fallback for GET, though frontend will use POST
      const url = new URL(req.url);
      dateParam = url.searchParams.get('date');
      customerParam = url.searchParams.get('customer');
    }

    console.log(`Date parameter after parsing: ${dateParam}`); // New log
    console.log(`Customer parameter after parsing: ${customerParam}`); // New log

    if (!dateParam) {
      console.log(`No date provided. Defaulting to today's date: ${dateFns.format(new Date(), 'yyyy-MM-dd')}\n`);
      dateParam = dateFns.format(new Date(), 'yyyy-MM-dd'); // Default to today if not provided
    }

    const startDate = new Date(dateParam);
    startDate.setUTCHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setUTCDate(startDate.getUTCDate() + 1); // End of the day

    const createdSince = startDate.toISOString();
    const createdUntil = endDate.toISOString();

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
      const freshdeskUrl = `https://${freshdeskDomain}.freshdesk.com/api/v2/tickets?include=requester,stats,company,description&created_since=${encodeURIComponent(createdSince)}&created_until=${encodeURIComponent(createdUntil)}&page=${page}&per_page=100`;
      
      const response = await fetch(freshdeskUrl, fdOptions);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Freshdesk API Error (Code: ${response.status}): ${errorText}`);
        // Immediately return an error response from the Edge Function
        return new Response(JSON.stringify({ 
          error: `Freshdesk API Error: ${response.status} - ${errorText}` 
        }), {
          status: response.status, // Propagate Freshdesk's status code
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
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
        const companyName = ticket.custom_fields?.cf_company || 'Unknown Company';

        allTickets.push({
          id: ticket.id?.toString(),
          subject: ticket.subject || "",
          priority: priorityString,
          status: statusString,
          type: ticket.type || "Unknown Type",
          requester_email: requesterEmail,
          created_at: ticket.created_at || "",
          updated_at: ticket.updated_at || "",
          description_text: ticket.description_text || "",
          description_html: ticket.description_html || "",
          assignee: await getAgentName(ticket.responder_id, freshdeskApiKey, freshdeskDomain),
          cf_company: companyName,
          cf_country: ticket.custom_fields?.cf_country || "",
          cf_module: ticket.custom_fields?.cf_module || "",
          cf_dependency: ticket.custom_fields?.cf_dependency || "",
          cf_recurrence: ticket.custom_fields?.cf_recurrence || "",
        });
      }

      page++;
      await new Promise(resolve => setTimeout(resolve, 1000)); // Delay to respect rate limits
    }

    // --- Aggregation Logic ---
    let filteredTickets = allTickets;
    if (customerParam && customerParam !== "All") {
      filteredTickets = allTickets.filter(ticket => ticket.cf_company === customerParam);
    }

    const totalTicketsToday = filteredTickets.length;
    const resolvedToday = filteredTickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;
    const openCount = filteredTickets.filter(t => t.status === 'Open (Being Processed)').length;
    const pendingOnTech = filteredTickets.filter(t => t.status === 'On Tech').length;

    const typeBreakdown: { [key: string]: number } = {};
    filteredTickets.forEach(t => {
      typeBreakdown[t.type] = (typeBreakdown[t.type] || 0) + 1;
    });

    const statusBreakdown: { [key: string]: number } = {};
    filteredTickets.forEach(t => {
      statusBreakdown[t.status] = (statusBreakdown[t.status] || 0) + 1;
    });

    const customerBreakdown: { [key: string]: { totalToday: number; resolvedToday: number; open: number; pendingTech: number; bugs: number; tasks: number; queries: number; } } = {};
    allTickets.forEach(ticket => { // Use allTickets here to get breakdown for all customers
      const company = ticket.cf_company || 'Unknown Company';
      if (!customerBreakdown[company]) {
        customerBreakdown[company] = { totalToday: 0, resolvedToday: 0, open: 0, pendingTech: 0, bugs: 0, tasks: 0, queries: 0 };
      }
      customerBreakdown[company].totalToday++;
      if (ticket.status === 'Resolved' || ticket.status === 'Closed') customerBreakdown[company].resolvedToday++;
      if (ticket.status === 'Open (Being Processed)') customerBreakdown[company].open++;
      if (ticket.status === 'On Tech') customerBreakdown[company].pendingTech++;
      if (ticket.type === 'Bug') customerBreakdown[company].bugs++;
      if (ticket.type === 'Task') customerBreakdown[company].tasks++;
      if (ticket.type === 'Query') customerBreakdown[company].queries++;
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
      rawTickets: filteredTickets, // Include raw tickets for charts
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