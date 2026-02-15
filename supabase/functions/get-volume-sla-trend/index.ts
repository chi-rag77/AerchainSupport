// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore
import * as dateFns from "https://esm.sh/date-fns@2.30.0";
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
    const authHeader = req.headers.get('Authorization');

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { startDate, endDate } = await req.json();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Calculate previous period for trend comparison
    const duration = dateFns.differenceInDays(end, start) + 1;
    const prevStart = dateFns.subDays(start, duration);
    const prevEnd = dateFns.subDays(end, duration);

    const { data: tickets, error } = await supabase
      .from('freshdesk_tickets')
      .select('created_at, updated_at, status, due_by')
      .gte('created_at', prevStart.toISOString())
      .lte('created_at', end.toISOString());

    if (error) throw error;

    // Helper to aggregate data
    const aggregate = (tks: any[], s: Date, e: Date) => {
      const interval = dateFns.eachDayOfInterval({ start: s, end: e });
      const map = new Map();
      interval.forEach(d => map.set(dateFns.format(d, 'yyyy-MM-dd'), { ticketsCreated: 0, slaMet: 0, slaTotal: 0 }));

      tks.forEach(t => {
        const d = dateFns.format(new Date(t.created_at), 'yyyy-MM-dd');
        if (map.has(d)) {
          const entry = map.get(d);
          entry.ticketsCreated++;
          if (t.due_by) {
            entry.slaTotal++;
            if (new Date(t.updated_at) <= new Date(t.due_by)) entry.slaMet++;
          }
        }
      });

      return Array.from(map.entries()).map(([date, val]) => ({
        date,
        ticketsCreated: val.ticketsCreated,
        slaCompliance: val.slaTotal > 0 ? (val.slaMet / val.slaTotal) * 100 : 100
      }));
    };

    const currentTrend = aggregate(tickets.filter(t => new Date(t.created_at) >= start), start, end);
    const previousTrend = aggregate(tickets.filter(t => new Date(t.created_at) < start), prevStart, prevEnd);

    // Compute Signals
    const avgVol = currentTrend.reduce((a, b) => a + b.ticketsCreated, 0) / currentTrend.length;
    const prevAvgVol = previousTrend.reduce((a, b) => a + b.ticketsCreated, 0) / previousTrend.length;
    const volChange = prevAvgVol === 0 ? 0 : ((avgVol - prevAvgVol) / prevAvgVol) * 100;

    const avgSla = currentTrend.reduce((a, b) => a + b.slaCompliance, 0) / currentTrend.length;
    const prevAvgSla = previousTrend.reduce((a, b) => a + b.slaCompliance, 0) / previousTrend.length;
    const slaChange = avgSla - prevAvgSla;

    // Risk Engine
    let riskLevel = 'LOW';
    if (avgSla < 80 || volChange > 25) riskLevel = 'HIGH';
    else if (avgSla < 90 || volChange > 15) riskLevel = 'MEDIUM';

    return new Response(JSON.stringify({
      trendData: currentTrend,
      signals: {
        startDate,
        endDate,
        avgVolume: parseFloat(avgVol.toFixed(1)),
        volumeChangePercent: parseFloat(volChange.toFixed(1)),
        avgSLA: parseFloat(avgSla.toFixed(1)),
        slaChangePercent: parseFloat(slaChange.toFixed(1)),
        riskLevel
      }
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});