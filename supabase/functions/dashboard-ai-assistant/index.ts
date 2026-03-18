// v2.9 - AI Assistant with Gemini 2.5 Flash
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

    const [
      { count: totalTickets },
      { count: openTickets },
      { count: resolvedTickets },
      { count: bugTickets }
    ] = await Promise.all([
      supabase.from('freshdesk_tickets').select('*', { count: 'exact', head: true }),
      supabase.from('freshdesk_tickets').select('*', { count: 'exact', head: true }).ilike('status', '%open%'),
      supabase.from('freshdesk_tickets').select('*', { count: 'exact', head: true }).in('status', ['Resolved', 'Closed']),
      supabase.from('freshdesk_tickets').select('*', { count: 'exact', head: true }).ilike('type', 'bug')
    ]);

    const context = `Data: Total: ${totalTickets}, Open: ${openTickets}, Resolved: ${resolvedTickets}, Bugs: ${bugTickets}`;
    const prompt = `You are an operations assistant. Answer accurately based on this data: ${context}. Query: "${query}"`;

    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { response_mime_type: "text/plain" }
      }),
    });

    if (!geminiResponse.ok) throw new Error("AI Service Error");

    const geminiData = await geminiResponse.json();
    const answer = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't process that.";

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