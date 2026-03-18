// v1.0 - AI Queue Alert Generator
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

    if (!geminiApiKey) throw new Error("GEMINI_API_KEY is not set.");

    const authHeader = req.headers.get('Authorization');
    const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
      global: { headers: { Authorization: authHeader! } },
    });

    // 1. Fetch Data (Last 72 hours for trend analysis)
    const seventyTwoHoursAgo = dateFns.subHours(new Date(), 72).toISOString();
    const { data: tickets, error: fetchError } = await supabase
      .from('freshdesk_tickets')
      .select('*')
      .gte('created_at', seventyTwoHoursAgo);

    if (fetchError) throw fetchError;

    // 2. Prepare Context for AI
    // We'll send a summarized version of the data to stay within token limits
    const now = new Date();
    const activeTickets = (tickets || []).filter(t => !['resolved', 'closed'].includes(t.status.toLowerCase()));
    
    const context = {
      total_active: activeTickets.length,
      sla_risks: activeTickets.filter(t => t.due_by && dateFns.isPast(dateFns.subMinutes(new Date(t.due_by), 120))).length,
      urgent_count: activeTickets.filter(t => t.priority === 'Urgent').length,
      module_distribution: activeTickets.reduce((acc: any, t) => {
        const mod = t.cf_module || 'General';
        acc[mod] = (acc[mod] || 0) + 1;
        return acc;
      }, {}),
      recent_history: tickets?.slice(0, 50).map(t => ({
        id: t.freshdesk_id,
        status: t.status,
        priority: t.priority,
        created_at: t.created_at,
        due_by: t.due_by,
        module: t.cf_module,
        company: t.cf_company
      }))
    };

    // 3. Call Gemini with the user's specific prompt
    const prompt = `
      You are an AI operations analyst for a support ticketing system.
      Analyze the current ticket queue and generate 3–5 high-value, real-time alerts for a "Live Intelligence Bar".

      INPUT DATA:
      ${JSON.stringify(context)}

      OBJECTIVE:
      Identify the most important operational signals that require attention RIGHT NOW.

      OUTPUT:
      Return a list of 3–5 alerts in JSON format.
      Each alert must follow this structure:
      {
        "type": "sla_risk | escalation | spike | backlog | anomaly | agent_overload",
        "title": "Short, scannable headline (max 8 words)",
        "description": "1-line explanation",
        "value": "key metric (e.g., 12 tickets, +27%)",
        "priority": "low | medium | high | critical",
        "confidence": "low | medium | high",
        "action": "Recommended action (short)",
        "cta_label": "Button label",
        "filter_query": "Query string"
      }

      RULES:
      1. SLA RISK: Identify tickets due within 2h or breached.
      2. ESCALATIONS: Detect urgent/escalated patterns.
      3. ISSUE SPIKES: Flag if a module volume is high relative to total.
      4. BACKLOG: Growing queue size.

      Output ONLY valid JSON.
    `;

    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { response_mime_type: "application/json", temperature: 0.1 }
      }),
    });

    if (!geminiRes.ok) throw new Error("AI Service Error");

    const aiData = await geminiRes.json();
    const rawText = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    const alerts = JSON.parse(rawText.replace(/```json/g, '').replace(/```/g, '').trim());

    return new Response(JSON.stringify(alerts), {
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