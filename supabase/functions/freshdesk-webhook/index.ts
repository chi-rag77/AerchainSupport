// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { syncTicketsForOrg } from "../_shared/syncTickets.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-freshdesk-signature',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    const payload = await req.json();
    const freshdeskId = payload.ticket_id || payload.id;
    const domain = payload.domain || req.headers.get('x-freshdesk-domain');

    // 1. Identify Org
    const { data: settings } = await supabase
      .from('org_settings')
      .select('org_id, webhook_secret')
      .eq('freshdesk_domain', domain)
      .maybeSingle();

    if (!settings) {
      console.warn(`[webhook] Unknown domain: ${domain}`);
      return new Response(JSON.stringify({ error: "Unknown domain" }), { status: 404, headers: corsHeaders });
    }

    // 2. Log Event
    await supabase.from('webhook_events').insert({
      org_id: settings.org_id,
      freshdesk_id: freshdeskId?.toString(),
      event_type: payload.event || 'ticket_updated',
      payload: payload
    });

    // 3. Return 200 immediately to Freshdesk
    // We process in the background (Deno Edge Functions continue running for a short time after response)
    EdgeRuntime.waitUntil((async () => {
      try {
        await syncTicketsForOrg(supabase, settings.org_id, { 
          ticketId: freshdeskId, 
          trigger: 'webhook' 
        });
        console.log(`[webhook] Successfully processed ticket ${freshdeskId}`);
      } catch (err) {
        console.error(`[webhook] Background processing failed for ${freshdeskId}:`, err.message);
      }
    })());

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("[webhook] Fatal Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});