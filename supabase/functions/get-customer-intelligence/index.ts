// v3.0 - AI Operational Intelligence with Gemini 2.5 Flash
// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
// @ts-ignore
import { differenceInDays } from "https://esm.sh/date-fns@2.30.0";

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

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase environment variables are not configured.");
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { customerName } = await req.json();
    if (!customerName) {
      return new Response(JSON.stringify({ error: 'customerName is required' }), { status: 400, headers: corsHeaders });
    }

    // 1. Fetch Data
    const { data: tickets, error: fetchError } = await supabase
      .from('freshdesk_tickets')
      .select('*')
      .eq('cf_company', customerName);

    if (fetchError) throw fetchError;

    if (!tickets || tickets.length < 3) {
      return new Response(JSON.stringify({
        customer: customerName,
        status: "No Data",
      }), { status: 200, headers: corsHeaders });
    }

    // 2. Calculate Deterministic Metrics for AI Input
    const now = new Date();
    const openTickets = tickets.filter(t => !['resolved', 'closed'].includes(t.status.toLowerCase()));
    
    // Module Stats
    const moduleMap: Record<string, number> = {};
    tickets.forEach(t => {
      const mod = t.cf_module || 'General';
      moduleMap[mod] = (moduleMap[mod] || 0) + 1;
    });
    const topModule = Object.entries(moduleMap).sort((a, b) => b[1] - a[1])[0];
    const modulePercent = Math.round((topModule[1] / tickets.length) * 100);

    // Type Stats
    const typeMap = { bug: 0, query: 0, config: 0 };
    tickets.forEach(t => {
      const type = (t.type || '').toLowerCase();
      if (type.includes('bug')) typeMap.bug++;
      else if (type.includes('query')) typeMap.query++;
      else typeMap.config++;
    });
    const total = tickets.length;
    const typePercents = {
      bug: Math.round((typeMap.bug / total) * 100),
      query: Math.round((typeMap.query / total) * 100),
      config: Math.round((typeMap.config / total) * 100),
    };

    // SLA Stats
    const slaTotal = tickets.filter(t => t.due_by && ['resolved', 'closed'].includes(t.status.toLowerCase())).length;
    const slaMet = tickets.filter(t => t.due_by && ['resolved', 'closed'].includes(t.status.toLowerCase()) && new Date(t.updated_at) <= new Date(t.due_by)).length;
    const slaAdherence = slaTotal > 0 ? Math.round((slaMet / slaTotal) * 100) : 100;

    const healthScore = Math.round(slaAdherence * 0.6 + (100 - Math.min(100, openTickets.length * 5)) * 0.4);

    // 3. AI Layer (Using 2.5-flash)
    let aiSummary = null;

    if (geminiApiKey) {
      const prompt = `
        Analyze support data for ${customerName}:
        - Top Module: ${topModule[0]} (${modulePercent}% of load)
        - Ticket Mix: ${typePercents.bug}% Bugs, ${typePercents.query}% Queries, ${typePercents.config}% Config
        - SLA Adherence: ${slaAdherence}%
        - Open Backlog: ${openTickets.length} tickets
        
        Return STRICT JSON for an "AI Operational Intelligence" panel:
        {
          "root_issue": {
            "module": "string",
            "percentage": number,
            "description": "2 sentence summary of what's driving load",
            "insight": "1 sentence structural vs isolated insight"
          },
          "composition": {
            "bugs": number,
            "queries": number,
            "config": number,
            "insight": "1 sentence insight on user struggle vs system failure"
          },
          "suggested_actions": [
            {
              "type": "engineering|education|risk",
              "title": "string",
              "description": "string",
              "items": ["bullet point 1", "bullet point 2"]
            }
          ],
          "operational_risk": {
            "level": "Low|Medium|High",
            "metric": "e.g. 19 hours avg resolution",
            "target": "e.g. 8 hours target",
            "description": "risk of backlog accumulation"
          },
          "reasoning": ["data point 1", "data point 2"]
        }
      `;

      const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { response_mime_type: "application/json" }
        }),
      });

      if (geminiResponse.ok) {
        const geminiData = await geminiResponse.json();
        const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
        aiSummary = JSON.parse(rawText.replace(/```json/g, '').replace(/```/g, '').trim());
      }
    }

    const responsePayload = {
      customer: customerName,
      health_score: healthScore,
      status: healthScore > 80 ? "Healthy" : healthScore > 60 ? "Watchlist" : "At Risk",
      open_tickets: openTickets.length,
      ticket_growth: "0%",
      sla_risk: slaAdherence < 80 ? "High" : "Low",
      ai_summary: aiSummary,
      confidence: 84,
      explainability: `Generated from ${tickets.length} tickets using AI synthesis.`,
      health_score_components: {
        sla_adherence: { score: Math.round(slaAdherence), weight: 60 },
        sentiment: { score: 80, weight: 0 },
        ticket_volume: { score: 80, weight: 0 },
        escalation: { score: 80, weight: 0 },
        unresolved: { score: 80, weight: 40 }
      },
      metadata: { tier: "Enterprise", arr: "$180K", industry: "FMCG", since: "2021", renewal: "Oct 2026" }
    };

    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("Edge Function Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});