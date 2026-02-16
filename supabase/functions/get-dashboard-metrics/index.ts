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

    // Fetch counts in parallel using Supabase's count feature
    const [
      { count: totalTickets },
      { count: openTickets },
      { count: resolvedTickets },
      { count: bugTickets },
      { count: urgentTickets }
    ] = await Promise.all([
      supabase.from('freshdesk_tickets').select('*', { count: 'exact', head: true }),
      supabase.from('freshdesk_tickets').select('*', { count: 'exact', head: true }).ilike('status', '%open%'),
      supabase.from('freshdesk_tickets').select('*', { count: 'exact', head: true }).in('status', ['Resolved', 'Closed']),
      supabase.from('freshdesk_tickets').select('*', { count: 'exact', head: true }).ilike('type', 'bug'),
      supabase.from('freshdesk_tickets').select('*', { count: 'exact', head: true }).eq('priority', 'Urgent')
    ]);

    return new Response(JSON.stringify({
      totalTickets: totalTickets || 0,
      openTickets: openTickets || 0,
      resolvedTickets: resolvedTickets || 0,
      bugTickets: bugTickets || 0,
      urgentTickets: urgentTickets || 0,
      slaCompliance: 85, // Placeholder for complex calculation
    }), {
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