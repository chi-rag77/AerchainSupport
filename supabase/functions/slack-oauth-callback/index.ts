// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state'); // This should be the orgId/userId

    if (!code) throw new Error("No code provided from Slack.");

    const slackClientId = Deno.env.get('SLACK_CLIENT_ID');
    const slackClientSecret = Deno.env.get('SLACK_CLIENT_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    // 1. Exchange code for token
    const slackRes = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: slackClientId!,
        client_secret: slackClientSecret!,
        code,
      }),
    });

    const slackData = await slackRes.json();
    if (!slackData.ok) throw new Error(`Slack OAuth failed: ${slackData.error}`);

    // 2. Store in Supabase
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    
    // Note: In a real flow, 'state' would contain the orgId. 
    // For this demo, we'll need to ensure the user is authenticated or pass orgId in state.
    const orgId = state; 

    const { error: upsertError } = await supabase
      .from('slack_integrations')
      .upsert({
        org_id: orgId,
        workspace_name: slackData.team.name,
        workspace_id: slackData.team.id,
        bot_token_encrypted: slackData.access_token, // Should be encrypted in production
        default_channel_id: slackData.incoming_webhook?.channel_id,
        is_active: true,
      }, { onConflict: 'org_id' });

    if (upsertError) throw upsertError;

    // 3. Redirect back to app
    return new Response(null, {
      status: 302,
      headers: { Location: `${Deno.env.get('APP_URL')}/settings?tab=slack&status=success` },
    });

  } catch (error: any) {
    console.error("[slack-oauth] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});