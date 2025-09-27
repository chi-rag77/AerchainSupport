// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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

    const { ticket_id } = await req.json();

    if (!ticket_id) {
      return new Response(JSON.stringify({ error: 'Ticket ID is required.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const fdOptions = {
      method: "GET",
      headers: {
        "Authorization": "Basic " + btoa(freshdeskApiKey + ":X"),
        "Content-Type": "application/json",
      },
    };

    const url = `https://${freshdeskDomain}.freshdesk.com/api/v2/tickets/${ticket_id}/conversations`;
    
    const response = await fetch(url, fdOptions);
    
    if (!response.ok) {
      console.error(`Freshdesk API Error (Code: ${response.status}): ${await response.text()}`);
      return new Response(JSON.stringify({ error: `Failed to fetch messages from Freshdesk: ${response.statusText}` }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const conversations = await response.json();

    const messages = conversations.map((conv: any) => ({
      id: conv.id?.toString(),
      ticket_id: ticket_id,
      sender: conv.from_email || conv.user_id?.toString() || "Unknown", // Use from_email or user_id
      body_html: conv.body_html || conv.body || "",
      created_at: conv.created_at || "",
      is_agent: conv.incoming || conv.private || false, // Freshdesk 'incoming' means customer, 'private' means agent note. Adjust as needed.
    }));

    return new Response(JSON.stringify(messages), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error fetching Freshdesk messages:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});