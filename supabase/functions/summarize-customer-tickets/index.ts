// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

    if (!supabaseUrl || !supabaseAnonKey || !geminiApiKey) {
      return new Response(JSON.stringify({ error: 'Environment variables for Supabase or Gemini API key not set.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Error getting user from JWT:', userError);
      return new Response(JSON.stringify({ error: 'Unauthorized: Could not get user from token.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let requestBody;
    if (req.headers.get('content-type')?.includes('application/json')) {
      requestBody = await req.json();
    } else {
      return new Response(JSON.stringify({ error: 'Invalid Content-Type. Expected application/json.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { customerName, ticketsData } = requestBody;

    if (!customerName || !ticketsData || !Array.isArray(ticketsData)) {
      return new Response(JSON.stringify({ error: 'Missing customerName or ticketsData in request body.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const formattedTickets = ticketsData.map((ticket: any) => ({
      id: ticket.id,
      subject: ticket.subject,
      status: ticket.status,
      priority: ticket.priority,
      type: ticket.type,
      createdAt: ticket.created_at,
      updatedAt: ticket.updated_at,
      assignee: ticket.assignee,
      company: ticket.cf_company,
      module: ticket.cf_module,
      dependency: ticket.cf_dependency,
      recurrence: ticket.cf_recurrence,
    }));

    const prompt = `As an experienced customer success manager, analyze the following ticket metadata for customer "${customerName}". Identify common themes, recurring issues, overall sentiment (e.g., "frequently reports bugs," "generally smooth interactions," "escalated issues"), and any noticeable trends (e.g., "increased activity in the last month"). Provide a concise, paragraph-style summary (3-5 sentences). Do not invent information or refer to specific conversation details not present in the metadata.

Customer: ${customerName}
Tickets:
${JSON.stringify(formattedTickets, null, 2)}

Summary:`;

    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }],
        }],
      }),
    });

    if (!geminiResponse.ok) {
      const errorBody = await geminiResponse.json();
      console.error('Gemini API Error:', errorBody);
      return new Response(JSON.stringify({ error: `Gemini API error: ${geminiResponse.status} - ${JSON.stringify(errorBody)}` }), {
        status: geminiResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const geminiData = await geminiResponse.json();
    const summary = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "No summary could be generated.";

    return new Response(JSON.stringify({ summary }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in Edge Function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});