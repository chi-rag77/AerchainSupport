// v1.5 - Customer Journey Impact with Gemini 1.5 Flash
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

    const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
      global: { headers: { Authorization: req.headers.get('Authorization')! } },
    });

    const { customerName } = await req.json();
    if (!customerName) throw new Error("customerName is required.");

    const { data: tickets, error: fetchError } = await supabase
      .from('freshdesk_tickets')
      .select('*')
      .eq('cf_company', customerName)
      .order('created_at', { ascending: true });

    if (fetchError) throw fetchError;
    if (!tickets || tickets.length === 0) {
      return new Response(JSON.stringify({ empty: true }), { status: 200, headers: corsHeaders });
    }

    const monthlyData: Record<string, any> = {};
    const moduleStats: Record<string, any> = {};
    const severityCounts = { Critical: 0, High: 0, Medium: 0, Low: 0 };

    tickets.forEach(t => {
      const date = new Date(t.created_at);
      const monthKey = dateFns.format(date, 'yyyy-MM');
      const module = t.cf_module || 'General';
      const priority = t.priority || 'Medium';
      
      if (priority === 'Urgent') severityCounts.Critical++;
      else if (priority === 'High') severityCounts.High++;
      else if (priority === 'Medium') severityCounts.Medium++;
      else severityCounts.Low++;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          label: dateFns.format(date, 'MMM yyyy'),
          tickets: 0,
          resolved: 0,
          fastResolved: 0,
          escalated: 0,
          unresolved: 0,
          totalResHours: 0,
          modules: {},
        };
      }

      const m = monthlyData[monthKey];
      m.tickets++;
      
      const statusLower = t.status.toLowerCase();
      const isResolved = statusLower === 'resolved' || statusLower === 'closed';
      
      if (isResolved) {
        m.resolved++;
        const resHours = dateFns.differenceInHours(new Date(t.updated_at), new Date(t.created_at));
        m.totalResHours += resHours;
        if (resHours <= 24) m.fastResolved++;
      } else {
        m.unresolved++;
      }

      if (t.priority.toLowerCase() === 'urgent' || statusLower === 'escalated') {
        m.escalated++;
      }

      m.modules[module] = (m.modules[module] || 0) + 1;

      if (!moduleStats[module]) {
        moduleStats[module] = { name: module, total: 0, resolved: 0, totalResHours: 0, escalated: 0, history: [] };
      }
      const ms = moduleStats[module];
      ms.total++;
      if (isResolved) {
        ms.resolved++;
        ms.totalResHours += dateFns.differenceInHours(new Date(t.updated_at), new Date(t.created_at));
      }
      if (t.priority.toLowerCase() === 'urgent' || statusLower === 'escalated') ms.escalated++;
    });

    const timeline = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
    const modules = Object.keys(moduleStats);

    const processedModuleStats = modules.map(name => {
      const stats = moduleStats[name];
      const history = timeline.map(m => m.modules[name] || 0);
      const lastMonth = history[history.length - 1] || 0;
      const prevMonth = history[history.length - 2] || 0;
      const trend = prevMonth === 0 ? (lastMonth > 0 ? 100 : 0) : Math.round(((lastMonth - prevMonth) / prevMonth) * 100);

      return {
        ...stats,
        avgResolution: stats.resolved > 0 ? Math.round(stats.totalResHours / stats.resolved) : 0,
        trend,
        history
      };
    }).sort((a, b) => b.total - a.total);

    let aiAnalysis = null;
    if (geminiApiKey) {
      const context = {
        topModules: processedModuleStats.slice(0, 3),
        severity: severityCounts,
        recentTimeline: timeline.slice(-3)
      };

      const prompt = `
        Analyze this customer support intelligence for "${customerName}".
        Data: ${JSON.stringify(context)}

        Return STRICT JSON:
        {
          "executiveInsight": "1-2 sentence summary of the most critical issue.",
          "majorCause": "Identify the likely root cause for the top problematic module.",
          "patterns": ["List of detected patterns"],
          "recommendation": "One specific executive action."
        }
      `;

      const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { response_mime_type: "application/json" }
        }),
      });

      if (geminiRes.ok) {
        const aiData = await geminiRes.json();
        aiAnalysis = JSON.parse(aiData.candidates?.[0]?.content?.parts?.[0]?.text || "{}");
      }
    }

    return new Response(JSON.stringify({
      timeline,
      moduleStats: processedModuleStats,
      severityCounts,
      aiAnalysis,
      generatedAt: new Date().toISOString()
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