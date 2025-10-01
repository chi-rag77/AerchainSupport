// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

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
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return new Response(JSON.stringify({ error: 'Supabase URL or Service Role Key not set in environment variables.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const requestBody = await req.json();
    const { freshdesk_ticket_id } = requestBody;

    if (!freshdesk_ticket_id) {
      return new Response(JSON.stringify({ error: 'freshdesk_ticket_id is required.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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

    let allConversations: any[] = [];
    let page = 1;
    const perPage = 100; // Max per_page for Freshdesk API

    console.log(`Fetching conversations for Freshdesk Ticket ID: ${freshdesk_ticket_id}`);

    while (true) {
      const freshdeskApiUrl = `https://${freshdeskDomain}.freshdesk.com/api/v2/tickets/${freshdesk_ticket_id}/conversations?page=${page}&per_page=${perPage}`;
      const freshdeskResponse = await fetch(freshdeskApiUrl, { headers });

      if (!freshdeskResponse.ok) {
        const errorText = await freshdeskResponse.text();
        console.error(`Freshdesk API error fetching conversations (page ${page}): ${freshdeskResponse.status} - ${errorText}`);
        throw new Error(`Freshdesk API error: ${freshdeskResponse.status} - ${errorText}`);
      }

      const conversationsPage = await freshdeskResponse.json();
      if (!conversationsPage || conversationsPage.length === 0) {
        break;
      }

      allConversations = allConversations.concat(conversationsPage);
      page++;
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    const transformedMessages = allConversations.map((conv: any) => ({
      id: String(conv.id),
      ticket_id: String(freshdesk_ticket_id),
      sender: conv.from_email || conv.agent_name || 'Unknown', // Use from_email or agent_name
      body_html: conv.body_html || conv.body || '',
      created_at: conv.created_at || new Date().toISOString(),
      is_agent: conv.incoming === false, // Freshdesk 'incoming: false' means it's an outgoing reply (agent)
    }));

    const { data: upsertData, error: upsertError } = await supabase
      .from('ticket_messages')
      .upsert(transformedMessages, { onConflict: 'id' });

    if (upsertError) {
      console.error('Supabase Upsert Error for conversations:', upsertError);
      throw new Error(`Failed to upsert conversations to Supabase: ${upsertError.message}`);
    }

    console.log(`Successfully upserted ${transformedMessages.length} conversations for ticket ${freshdesk_ticket_id}.`);

    return new Response(JSON.stringify({ message: `Successfully synced ${transformedMessages.length} conversations.` }), {
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