// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// -----------------------------------------------------------------------------------
// --- MAPPING CONSTANTS (Updated with your custom status names) ---
// -----------------------------------------------------------------------------------

const PRIORITY_MAP: { [key: number]: string } = {
  1: "Low",
  2: "Medium",
  3: "High",
  4: "Urgent"
};

const STATUS_MAP: { [key: number]: string } = {
  // Standard Freshdesk Statuses (Default IDs)
  2: "Open (Being Processed)",
  3: "Pending (Awaiting your Reply)",
  4: "Resolved",
  5: "Closed",
  // Standard or Common Custom Statuses
  8: "Waiting on Customer",
  
  // Custom Statuses - REPLACE THESE PLACEHOLDERS (e.g., 1000000001) with your actual IDs
  7: "On Tech",
  9: "On Product",
  
  // Add any other custom status IDs you have here
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // @ts-ignore
    const freshdeskApiKey = Deno.env.get('FRESHDESK_API_KEY');
    // @ts-ignore
    const freshdeskDomain = Deno.env.get('FRESHDESK_DOMAIN');

    console.log('Freshdesk API Key (first 5 chars):', freshdeskApiKey ? freshdeskApiKey.substring(0, 5) + '...' : 'Not set');
    console.log('Freshdesk Domain:', freshdeskDomain || 'Not set');

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

    // Date filter: from this week's Monday till today
    const today = new Date();
    const day = today.getDay(); // Sunday = 0, Monday = 1, ...
    const diffToMonday = (day === 0 ? 6 : day - 1); 
    const monday = new Date(today);
    monday.setDate(today.getDate() - diffToMonday);
    monday.setHours(0, 0, 0, 0); // Set Monday’s time to start of the day
    const updatedSince = monday.toISOString();

    const fdOptions = {
      method: "GET",
      headers: {
        "Authorization": "Basic " + btoa(freshdeskApiKey + ":X"),
        "Content-Type": "application/json",
      },
    };

    let page = 1;
    let hasMore = true;
    const allTickets = [];

    while (hasMore) {
      const url = `https://${freshdeskDomain}.freshdesk.com/api/v2/tickets?include=requester&updated_since=${encodeURIComponent(updatedSince)}&page=${page}&per_page=100`;
      
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
        
        // Map priority and status
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
          assignee: ticket.agent?.first_name && ticket.agent?.last_name 
                      ? `${ticket.agent.first_name} ${ticket.agent.last_name}` 
                      : ticket.agent?.email || "Unassigned",
          cf_company: ticket.custom_fields?.cf_company || "",
          cf_country: ticket.custom_fields?.cf_country || "",
          cf_module: ticket.custom_fields?.cf_module || "",
          cf_dependency: ticket.custom_fields?.cf_dependency || "",
          cf_recurrence: ticket.custom_fields?.cf_recurrence || "",
          // Add other fields as needed
        });
      }

      page++;
      // Add a brief sleep to avoid immediately hitting rate limits
      await new Promise(resolve => setTimeout(resolve, 1000)); 
    }

    return new Response(JSON.stringify(allTickets), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error fetching Freshdesk tickets:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});