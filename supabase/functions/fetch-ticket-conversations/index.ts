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
    // @ts-ignore
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseServiceRoleKey || !supabaseAnonKey) {
      console.error('Environment variables: Supabase URL or Keys not set.');
      return new Response(JSON.stringify({ error: 'Supabase environment variables not set.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
    const org_id = user.id;

    // 2. Initialize Supabase client with Service Role Key to fetch secrets (org_settings)
    const serviceSupabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { data: settings, error: settingsError } = await serviceSupabase
      .from("org_settings")
      .select("freshdesk_domain, freshdesk_api_key")
      .eq("org_id", org_id)
      .single();

    if (settingsError || !settings) {
      console.error('Freshdesk settings not configured:', settingsError);
      return new Response(JSON.stringify({ error: 'Freshdesk settings not configured for this organization.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const freshdeskApiKey = settings.freshdesk_api_key;
    const freshdeskDomain = settings.freshdesk_domain;

    const requestBody = await req.json();
    const { freshdesk_ticket_id } = requestBody;

    if (!freshdesk_ticket_id) {
      console.error('Request Error: freshdesk_ticket_id is required.');
      return new Response(JSON.stringify({ error: 'freshdesk_ticket_id is required.' }), {
        status: 400,
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
    const perPage = 100;

    console.log(`[fetch-ticket-conversations] Starting fetch for Freshdesk Ticket ID: ${freshdesk_ticket_id}`);

    while (true) {
      const freshdeskApiUrl = `https://${freshdeskDomain}.freshdesk.com/api/v2/tickets/${freshdesk_ticket_id}/conversations?page=${page}&per_page=${perPage}`;
      console.log(`[fetch-ticket-conversations] Fetching page ${page} from Freshdesk API: ${freshdeskApiUrl}`);
      const freshdeskResponse = await fetch(freshdeskApiUrl, { headers });

      if (!freshdeskResponse.ok) {
        const errorText = await freshdeskResponse.text();
        console.error(`[fetch-ticket-conversations] Freshdesk API error fetching conversations (page ${page}): ${freshdeskResponse.status} - ${errorText}`);
        
        // Specific handling for 404 (Ticket not found in Freshdesk)
        if (freshdeskResponse.status === 404) {
          return new Response(JSON.stringify({ error: `Freshdesk API error: Ticket ID ${freshdesk_ticket_id} not found in Freshdesk.` }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Generic non-2xx error handling
        return new Response(JSON.stringify({ error: `Freshdesk API error: ${freshdeskResponse.status} - ${errorText}` }), {
          status: freshdeskResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const conversationsPage = await freshdeskResponse.json();
      console.log(`[fetch-ticket-conversations] Fetched ${conversationsPage.length} conversations from Freshdesk page ${page}`);

      if (!conversationsPage || conversationsPage.length === 0) {
        console.log("[fetch-ticket-conversations] No more conversations from Freshdesk. Breaking pagination loop.");
        break;
      }

      allConversations = allConversations.concat(conversationsPage);
      page++;
      await new Promise(resolve => setTimeout(resolve, 200)); // Small delay to respect Freshdesk rate limits
    }

    console.log(`[fetch-ticket-conversations] Total conversations fetched from Freshdesk: ${allConversations.length}`);

    const transformedMessages = allConversations.map((conv: any) => ({
      id: String(conv.id),
      ticket_id: String(freshdesk_ticket_id),
      sender: conv.from_email || conv.agent_name || 'Unknown',
      body_html: conv.body_html || conv.body || '',
      created_at: conv.created_at || new Date().toISOString(),
      is_agent: conv.incoming === false,
    }));

    console.log(`[fetch-ticket-conversations] Attempting to upsert ${transformedMessages.length} messages to Supabase.`);
    const { data: upsertData, error: upsertError } = await userSupabase // Use userSupabase for RLS-protected tables
      .from('ticket_messages')
      .upsert(transformedMessages, { onConflict: 'id' });

    if (upsertError) {
      console.error('[fetch-ticket-conversations] Supabase Upsert Error for conversations:', upsertError);
      throw new Error(`Failed to upsert conversations to Supabase: ${upsertError.message}`);
    }

    console.log(`[fetch-ticket-conversations] Successfully upserted ${transformedMessages.length} conversations for ticket ${freshdesk_ticket_id}.`);

    return new Response(JSON.stringify({ message: `Successfully synced ${transformedMessages.length} conversations.` }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('[fetch-ticket-conversations] Error in Edge Function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});