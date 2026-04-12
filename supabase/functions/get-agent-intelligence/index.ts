// v1.1 - Real-time Agent Intelligence Engine
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

    const { agentName } = await req.json();
    if (!agentName) throw new Error("agentName is required.");

    // 1. Fetch Agent's Tickets
    const { data: tickets } = await supabase
      .from('freshdesk_tickets')
      .select('*')
      .eq('assignee', agentName);

    const allTickets = tickets || [];
    const activeTickets = allTickets.filter(t => !['resolved', 'closed'].includes(t.status.toLowerCase()));
    const resolvedToday = allTickets.filter(t => 
      ['resolved', 'closed'].includes(t.status.toLowerCase()) && 
      dateFns.isToday(new Date(t.updated_at))
    );

    // 2. Calculate Real-time Metrics
    const now = new Date();
    
    // Avg Resolution Time (Today)
    let avgResTimeStr = "0h";
    if (resolvedToday.length > 0) {
      const totalHours = resolvedToday.reduce((acc, t) => {
        return acc + dateFns.differenceInHours(new Date(t.updated_at), new Date(t.created_at));
      }, 0);
      avgResTimeStr = (totalHours / resolvedToday.length).toFixed(1) + "h";
    }

    // SLA Adherence (Today's Resolved)
    let slaAdherence = 100;
    const ticketsWithSla = resolvedToday.filter(t => t.due_by);
    if (ticketsWithSla.length > 0) {
      const metSla = ticketsWithSla.filter(t => new Date(t.updated_at) <= new Date(t.due_by)).length;
      slaAdherence = Math.round((metSla / ticketsWithSla.length) * 100);
    }

    const urgentCount = activeTickets.filter(t => {
      const hoursOpen = dateFns.differenceInHours(now, new Date(t.created_at));
      return t.priority === 'Urgent' || hoursOpen > 24; 
    }).length;

    const pendingCount = activeTickets.filter(t => t.status.toLowerCase().includes('pending') || t.status.toLowerCase().includes('waiting')).length;
    const readyCount = activeTickets.filter(t => t.status.toLowerCase().includes('resolved') || t.status.toLowerCase().includes('ready')).length;
    const inProgressCount = activeTickets.length - urgentCount - pendingCount - readyCount;

    const healthScore = Math.round(((readyCount + inProgressCount) / (activeTickets.length || 1)) * 100);

    // Category Breakdown
    const categoryMap: Record<string, number> = {};
    activeTickets.forEach(t => {
      const cat = t.type || 'Other';
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });
    const categories = Object.entries(categoryMap).map(([label, count]) => ({
      label,
      count,
      percent: Math.round((count / (activeTickets.length || 1)) * 100),
      color: label === 'Bug' ? 'bg-rose-500' : label === 'Task' ? 'bg-blue-500' : 'bg-indigo-500'
    })).sort((a, b) => b.count - a.count);

    // 3. AI Synthesis
    let aiResult = {
      briefing: { text: "Data aggregated successfully.", mood: "📊", recommendation: "Review your queue." },
      actions: []
    };

    if (geminiApiKey && allTickets.length > 0) {
      const context = {
        agent_name: agentName,
        open_count: activeTickets.length,
        urgent_count: urgentCount,
        pending_count: pendingCount,
        resolved_today: resolvedToday.length,
        avg_res_time: avgResTimeStr,
        sla_adherence: slaAdherence,
        categories: categories.slice(0, 3)
      };

      const prompt = `
        You are an AI assistant helping a support agent plan their day.
        Data: ${JSON.stringify(context)}

        Generate a 2-3 sentence briefing. Assess workload, highlight the most urgent issue, and give a recommendation.
        Also suggest 3-5 prioritized actions.

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

      if (geminiRes.ok) {
        const aiData = await geminiRes.json();
        aiResult = JSON.parse(aiData.candidates[0].content.parts[0].text);
      }
    }

    return new Response(JSON.stringify({
      ...aiResult,
      stats: {
        handledToday: resolvedToday.length,
        avgResTime: avgResTimeStr,
        sla: slaAdherence,
        trends: { handled: 12, resTime: -5, sla: 0 }
      },
      queue: {
        total: activeTickets.length,
        urgent: urgentCount,
        pending: pendingCount,
        readyToClose: readyCount,
        inProgress: inProgressCount,
        healthScore
      },
      urgentTickets: activeTickets
        .filter(t => t.priority === 'Urgent' || dateFns.differenceInHours(now, new Date(t.created_at)) > 24)
        .map(t => ({
          id: t.freshdesk_id,
          subject: t.subject,
          customer: t.cf_company || 'N/A',
          hoursOpen: dateFns.differenceInHours(now, new Date(t.created_at)),
          category: t.type || 'General'
        }))
        .slice(0, 5),
      categories,
      pendingResponses: activeTickets
        .filter(t => t.status.toLowerCase().includes('waiting') || t.status.toLowerCase().includes('pending'))
        .map(t => ({
          id: t.freshdesk_id,
          subject: t.subject,
          customer: t.cf_company || 'N/A',
          waitDuration: `${dateFns.differenceInHours(now, new Date(t.updated_at))}h`,
          priority: t.priority,
          needsFollowUp: dateFns.differenceInHours(now, new Date(t.updated_at)) > 12
        }))
        .slice(0, 5)
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