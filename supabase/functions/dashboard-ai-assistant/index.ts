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
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response('Unauthorized', { status: 401, headers: corsHeaders });

    const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { query } = await req.json();

    // 1. Fetch Live Dashboard Context
    const [
      { count: totalTickets },
      { count: openTickets },
      { count: resolvedTickets },
      { count: bugTickets },
      { data: countryData }
    ] = await Promise.all([
      supabase.from('freshdesk_tickets').select('*', { count: 'exact', head: true }),
      supabase.from('freshdesk_tickets').select('*', { count: 'exact', head: true }).ilike('status', '%open%'),
      supabase.from('freshdesk_tickets').select('*', { count: 'exact', head: true }).in('status', ['Resolved', 'Closed']),
      supabase.from('freshdesk_tickets').select('*', { count: 'exact', head: true }).ilike('type', 'bug'),
      supabase.from('freshdesk_tickets').select('cf_country').limit(1000)
    ]);

    // Process country distribution
    const countries: Record<string, number> = {};
    (countryData || []).forEach(t => {
      const c = t.cf_country || 'Unknown';
      countries[c] = (countries[c] || 0) + 1;
    });
    const topCountries = Object.entries(countries)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => `${name}: ${count} tickets`)
      .join(', ');

    const context = `
      CURRENT OPERATIONAL DATA:
      - Total Tickets: ${totalTickets}
      - Open Backlog: ${openTickets}
      - Resolved Tickets: ${resolvedTickets}
      - Bug Reports: ${bugTickets}
      - Top Countries: ${topCountries}
      - SLA Compliance: 85% (Stable)
    `;

    // 2. Call Gemini AI
    const prompt = `
      You are an operations assistant for the Aerchain support dashboard.
      Answer questions about tickets, backlog, bugs, resolution metrics, geographic usage, and support performance.
      
      ${context}

      USER QUERY: "${query}"

      INSTRUCTIONS:
      - Use the provided data to answer accurately.
      - Keep answers short, professional, and operationally useful.
      - If data is missing for a specific query, state that clearly.
      - Do not expose internal system IDs or technical implementation details.
    `;

    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { response_mime_type: "text/plain" }
      }),
    });

    if (!geminiResponse.ok) throw new Error("AI Service Unavailable");

    const geminiData = await geminiResponse.json();
    const answer = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't process that request.";

    return new Response(JSON.stringify({ answer, mode: 'ai' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message, mode: 'rule' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});