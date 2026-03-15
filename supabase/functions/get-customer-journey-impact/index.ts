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

    // 1. Fetch all historical tickets for this customer
    const { data: tickets, error: fetchError } = await supabase
      .from('freshdesk_tickets')
      .select('*')
      .eq('cf_company', customerName)
      .order('created_at', { ascending: true });

    if (fetchError) throw fetchError;
    if (!tickets || tickets.length === 0) {
      return new Response(JSON.stringify({ empty: true }), { status: 200, headers: corsHeaders });
    }

    // 2. Aggregate by Month
    const monthlyData: Record<string, any> = {};
    const allModules = new Set<string>();

    tickets.forEach(t => {
      const date = new Date(t.created_at);
      const monthKey = dateFns.format(date, 'yyyy-MM');
      const module = t.cf_module || 'Uncategorized';
      allModules.add(module);

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          label: dateFns.format(date, 'MMM yyyy'),
          tickets: 0,
          resolved: 0,
          fastResolved: 0,
          escalated: 0,
          unresolved: 0,
          reopened: 0, // Inferred if updated_at >> created_at and status is open
          modules: {},
          avgResolutionHours: 0,
          totalResHours: 0,
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
    });

    // 3. Calculate Impact Scores
    const timeline = Object.values(monthlyData).map((m: any) => {
      // Formula: (+2 × fast) - (2 × escalated) - (1 × unresolved)
      const score = (m.fastResolved * 2) - (m.escalated * 2) - (m.unresolved * 1);
      m.impactScore = score;
      m.avgResolutionHours = m.resolved > 0 ? Math.round(m.totalResHours / m.resolved) : 0;
      return m;
    }).sort((a, b) => a.month.localeCompare(b.month));

    // 4. AI Synthesis
    let aiAnalysis = null;
    if (geminiApiKey) {
      const context = JSON.stringify(timeline.map(t => ({
        month: t.label,
        score: t.impactScore,
        tickets: t.tickets,
        topModules: Object.entries(t.modules).sort((a: any, b: any) => b[1] - a[1]).slice(0, 2)
      })));

      const prompt = `
        Analyze this customer support journey for "${customerName}".
        Timeline Data: ${context}

        Return STRICT JSON:
        {
          "journeyInsight": "2-sentence summary of the experience trend.",
          "patterns": ["List of detected patterns like spikes after releases"],
          "riskTrend": {
            "trajectory": "Improving | Stable | Declining",
            "reason": "Brief explanation"
          },
          "forecast": {
            "nextMonthScore": number,
            "drivers": ["List of risk/benefit drivers"]
          }
        }
      `;

      const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
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
      aiAnalysis,
      modules: Array.from(allModules),
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