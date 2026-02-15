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
    const { orgId, eventType, payload } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // 1. Fetch Integration
    const { data: integration, error: fetchError } = await supabase
      .from('slack_integrations')
      .select('*')
      .eq('org_id', orgId)
      .single();

    if (fetchError || !integration) throw new Error("Slack not integrated for this organization.");

    // 2. Construct Blocks based on Event Type
    let blocks = [];
    const channel = payload.channelId || integration.default_channel_id;

    switch (eventType) {
      case 'SLA_BREACH':
        blocks = [
          {
            type: "header",
            text: { type: "plain_text", text: "🚨 SLA Breach Risk Alert" }
          },
          {
            type: "section",
            text: { type: "mrkdwn", text: `*${payload.count} tickets* predicted to breach SLA within 4 hours.` }
          },
          {
            type: "section",
            fields: [
              { type: "mrkdwn", text: "*Risk Level:*\nHigh" },
              { type: "mrkdwn", text: `*Confidence:*\n${payload.confidence || '88'}%` }
            ]
          }
        ];
        break;
      case 'TEST':
      default:
        blocks = [
          {
            type: "header",
            text: { type: "plain_text", text: "⚡ Aerchain Integration Test" }
          },
          {
            type: "section",
            text: { type: "mrkdwn", text: payload.message || "Connection successful! Your dashboard is now linked to Slack." }
          }
        ];
    }

    // Add Action Button
    blocks.push({
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "View Dashboard" },
          url: Deno.env.get('APP_URL') || "https://aerchain.io",
          style: "primary"
        }
      ]
    });

    // 3. Send to Slack
    const slackRes = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${integration.bot_token_encrypted}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ channel, blocks }),
    });

    const slackData = await slackRes.json();
    if (!slackData.ok) throw new Error(`Slack API Error: ${slackData.error}`);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("[send-slack] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});