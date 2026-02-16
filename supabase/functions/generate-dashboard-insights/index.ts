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
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
      global: { headers: { Authorization: req.headers.get('Authorization')! } },
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // 1. Check Cache (6 hour TTL)
    const { data: cached } = await supabase
      .from('ai_dashboard_summary')
      .select('*')
      .eq('org_id', user.id)
      .single();

    if (cached) {
      const lastUpdated = new Date(cached.updated_at);
      const hoursSinceUpdate = (new Date().getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
      if (hoursSinceUpdate < 6) {
        return new Response(JSON.stringify(cached), { status: 200, headers: corsHeaders });
      }
    }

    // 2. If stale, generate new insights (using aggregated data, not 10k rows)
    // For now, we'll return a structured response that mimics AI output
    const newInsight = {
      org_id: user.id,
      summary: "Operations are stable. Volume is trending slightly up for key accounts. SLA adherence remains high at 85%.",
      risk_level: "Medium",
      confidence: 92,
      key_drivers: ["Volume Spike in Tech Support", "3 Urgent Escalations"],
      executive_action: "Review resource allocation for the Tech Support module.",
      updated_at: new Date().toISOString(),
      insights: [
        { message: "SLA adherence is stable at 85%.", severity: "info", type: "trend" }
      ]
    };

    await supabase.from('ai_dashboard_summary').upsert(newInsight);

    return new Response(JSON.stringify(newInsight), {
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