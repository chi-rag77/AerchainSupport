// v1.0 - Agent Intelligence Engine
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

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // 1. Fetch Agent's Tickets
    const { data: tickets } = await supabase
      .from('freshdesk_tickets')
      .select('*')
      .eq('assignee', user.user_metadata?.full_name || user.email?.split('@')[0]);

    const activeTickets = (tickets || []).filter(t => !['resolved', 'closed'].includes(t.status.toLowerCase()));
    const resolvedToday = (tickets || []).filter(t => 
      ['resolved', 'closed'].includes(t.status.toLowerCase()) && 
      dateFns.isToday(new Date(t.updated_at))
    );

    // 2. Calculate Deterministic Metrics
    const now = new Date();
    const urgentCount = activeTickets.filter(t => {
      const hoursOpen = dateFns.differenceInHours(now, new Date(t.created_at));
      return t.priority === 'Urgent' || hoursOpen > 4;
    }).length;

    const pendingCount = activeTickets.filter(t => t.status.includes('Pending') || t.status.includes('Waiting')).length;
    const readyCount = activeTickets.filter(t => t.status.includes('Resolved') || t.status.includes('Ready')).length;
    const inProgressCount = activeTickets.length - urgentCount - pendingCount - readyCount;

    const healthScore = Math.round(((readyCount + inProgressCount) / (activeTickets.length || 1)) * 100);

    // 3. AI Synthesis (Gemini 2.5 Flash)
    const context = {
      agent_name: user.user_metadata?.full_name || user.email?.split('@')[0],
      open_count: activeTickets.length,
      urgent_count: urgentCount,
      pending_count: pendingCount,
      ready_count: readyCount,
      resolved_today: resolvedToday.length,
      oldest_ticket: activeTickets.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0]
    };

    const prompt = `
      You are an AI assistant helping a support agent plan their day.
      Data: ${JSON.stringify(context)}

      Generate a 2-3 sentence briefing. Assess workload (light/moderate/busy), highlight the most urgent issue, and give a recommendation.
      Also suggest 3 prioritized actions.

      Return STRICT JSON:
      {
        "briefing": {
          "text": "string",
          "mood": "emoji",
          "recommendation": "string"
        },
        "actions": [
          { "action": "string", "why": "string", "priority": "urgent|high|medium|low", "impactMinutes": number }
        ]
      }
    `;

    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { response_mime_type: "application/json", temperature: 0.2 }
      }),
    });

    const aiData = await geminiRes.json();
    const result = JSON.parse(aiData.candidates[0].content.parts[0].text);

    return new Response(JSON.stringify({
      ...result,
      stats: {
        handledToday: resolvedToday.length,
        avgResTime: "2.4h",
        csat: 94,
        sla: 98,
        trends: { handled: 12, resTime: -5, csat: 2, sla: 0 }
      },
      queue: {
        total: activeTickets.length,
        urgent: urgentCount,
        pending: pendingCount,
        readyToClose: readyCount,
        inProgress: inProgressCount,
        healthScore
      }
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