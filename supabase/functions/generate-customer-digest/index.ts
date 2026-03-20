// v1.0 - Weekly Customer Digest Engine with Gemini 2.5 Flash
// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
// @ts-ignore
import * as dateFns from "https://esm.sh/date-fns@2.30.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

    const authHeader = req.headers.get('Authorization');
    const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
      global: { headers: { Authorization: authHeader! } },
    });

    const { customerName, weekOffset = 0 } = await req.json();

    const now = new Date();
    const startOfThisWeek = dateFns.startOfWeek(dateFns.subWeeks(now, weekOffset), { weekStartsOn: 1 });
    const endOfThisWeek = dateFns.endOfWeek(startOfThisWeek, { weekStartsOn: 1 });
    const startOfLastWeek = dateFns.startOfWeek(dateFns.subWeeks(startOfThisWeek, 1), { weekStartsOn: 1 });

    // 1. Fetch Tickets for Comparison
    const { data: tickets } = await supabase
      .from('freshdesk_tickets')
      .select('*')
      .eq('cf_company', customerName)
      .gte('created_at', startOfLastWeek.toISOString())
      .lte('created_at', endOfThisWeek.toISOString());

    const allTickets = tickets || [];
    const thisWeek = allTickets.filter(t => new Date(t.created_at) >= startOfThisWeek);
    const lastWeek = allTickets.filter(t => new Date(t.created_at) < startOfThisWeek);

    // 2. Compute Metrics
    const totalThisWeek = thisWeek.length;
    const totalLastWeek = lastWeek.length;
    const wowChange = totalLastWeek === 0 ? 100 : Math.round(((totalThisWeek - totalLastWeek) / totalLastWeek) * 100);

    const classification = {
      bugs: thisWeek.filter(t => (t.type || '').toLowerCase().includes('bug')).length,
      queries: thisWeek.filter(t => (t.type || '').toLowerCase().includes('query')).length,
      tasks: thisWeek.filter(t => (t.type || '').toLowerCase().includes('task')).length,
      features: thisWeek.filter(t => (t.type || '').toLowerCase().includes('feature')).length,
    };

    const status = {
      closed: thisWeek.filter(t => ['resolved', 'closed'].includes(t.status.toLowerCase())).length,
      open: thisWeek.filter(t => !['resolved', 'closed'].includes(t.status.toLowerCase())).length,
      backlog: allTickets.filter(t => !['resolved', 'closed'].includes(t.status.toLowerCase()) && new Date(t.created_at) < startOfThisWeek).length
    };

    // SLA & Recurring (Simplified for v1)
    const slaMet = thisWeek.filter(t => t.due_by && ['resolved', 'closed'].includes(t.status.toLowerCase()) && new Date(t.updated_at) <= new Date(t.due_by)).length;
    const slaTotal = thisWeek.filter(t => t.due_by && ['resolved', 'closed'].includes(t.status.toLowerCase())).length;

    const metrics = {
      volume: { total: totalThisWeek, wow: wowChange },
      classification,
      status,
      sla: { adherence: slaTotal > 0 ? Math.round((slaMet / slaTotal) * 100) : 100 },
      critical: {
        urgent: thisWeek.filter(t => t.priority === 'Urgent').length,
        escalated: thisWeek.filter(t => t.status === 'Escalated').length
      }
    };

    // 3. AI Summary Generation
    let aiSummary = "Weekly data aggregated successfully.";
    if (geminiApiKey && totalThisWeek > 0) {
      const prompt = `
        Generate a professional, customer-facing weekly support summary for "${customerName}".
        
        METRICS:
        - Total Tickets: ${totalThisWeek} (${wowChange}% WoW)
        - Classification: Bugs: ${classification.bugs}, Queries: ${classification.queries}, Tasks: ${classification.tasks}
        - Status: Closed: ${status.closed}, Open: ${status.open}, Backlog: ${status.backlog}
        - SLA Adherence: ${metrics.sla.adherence}%
        - Critical: ${metrics.critical.urgent} Urgent, ${metrics.critical.escalated} Escalated
        
        TONE: Professional, proactive, and intelligent.
        FORMAT: 2-3 concise sentences. Highlight trends or risks.
      `;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { response_mime_type: "text/plain", temperature: 0.2 }
        }),
      });

      if (res.ok) {
        const aiData = await res.json();
        aiSummary = aiData.candidates[0].content.parts[0].text;
      }
    }

    return new Response(JSON.stringify({
      customerName,
      weekLabel: `${dateFns.format(startOfThisWeek, 'MMM dd')} – ${dateFns.format(endOfThisWeek, 'MMM dd, yyyy')}`,
      metrics,
      aiSummary
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