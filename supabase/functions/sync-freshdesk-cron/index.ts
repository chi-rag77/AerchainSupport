// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { syncTicketsForOrg } from "../_shared/syncTickets.ts";
import * as dateFns from "https://esm.sh/date-fns@2.30.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // 1. Get all orgs with sync enabled
    const { data: orgs } = await supabase
      .from('org_settings')
      .select('org_id, last_sync_at')
      .eq('sync_enabled', true);

    if (!orgs) return new Response(JSON.stringify({ message: "No orgs to sync" }), { status: 200, headers: corsHeaders });

    const results = [];
    for (const org of orgs) {
      // Concurrency Guard: Check if a job is already running
      const { data: runningJob } = await supabase
        .from('sync_jobs')
        .select('id')
        .eq('org_id', org.org_id)
        .eq('status', 'running')
        .gt('started_at', dateFns.subMinutes(new Date(), 10).toISOString())
        .maybeSingle();

      if (runningJob) {
        console.warn(`[sync-cron] Skipping org ${org.org_id} - sync already in progress.`);
        continue;
      }

      // Calculate window with 5-minute buffer
      const since = org.last_sync_at 
        ? dateFns.subMinutes(new Date(org.last_sync_at), 5).toISOString()
        : dateFns.subMinutes(new Date(), 30).toISOString();

      try {
        const res = await syncTicketsForOrg(supabase, org.org_id, { 
          updatedSince: since, 
          trigger: 'cron' 
        });
        results.push({ orgId: org.org_id, ...res });
      } catch (err) {
        console.error(`[sync-cron] Failed for org ${org.org_id}:`, err.message);
        results.push({ orgId: org.org_id, success: false, error: err.message });
      }
    }

    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});