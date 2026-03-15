// v1.2 - Performance Optimized AI Recurring Issue Radar
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
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    const { customerName } = await req.json();
    
    // 1. Fetch Tickets (Last 90 days) - Fetching ONLY required columns for speed
    const ninetyDaysAgo = dateFns.subDays(new Date(), 90).toISOString();
    let query = supabase
      .from('freshdesk_tickets')
      .select('freshdesk_id, subject, cf_module')
      .gte('created_at', ninetyDaysAgo);

    if (customerName && customerName !== 'All') {
      query = query.eq('cf_company', customerName);
    }

    const { data: tickets, error: fetchError } = await query.limit(800); // Reduced limit for faster processing

    if (fetchError) throw fetchError;
    if (!tickets || tickets.length < 3) {
      return new Response(JSON.stringify({ empty: true }), { status: 200, headers: corsHeaders });
    }

    // 2. Aggressive Data Compression for AI
    // Grouping by module and taking a representative sample to stay within token limits and speed up Gemini
    const moduleGroups: Record<string, string[]> = {};
    tickets.forEach(t => {
      const mod = t.cf_module || 'General';
      if (!moduleGroups[mod]) moduleGroups[mod] = [];
      if (moduleGroups[mod].length < 15) { // Only send top 15 subjects per module to AI
        moduleGroups[mod].push(t.subject);
      }
    });

    // 3. AI Clustering (Gemini 2.5 Flash is very fast)
    const prompt = `
      Analyze these ticket subjects grouped by module and identify the top 5 RECURRING product issues.
      Data: ${JSON.stringify(moduleGroups)}

      Return STRICT JSON:
      {
        "clusters": [
          {
            "id": "slug",
            "title": "Issue Name",
            "occurrences": number,
            "modules": ["Module"],
            "trend": "increasing|stable|decreasing",
            "impact": "High|Medium|Low",
            "rootCause": "Technical reason",
            "suggestedFix": "Product fix",
            "confidence": 90,
            "history": [{"month": "Current", "count": 5}],
            "requiresEscalation": boolean,
            "sampleTickets": []
          }
        ],
        "moduleDistribution": [{"module": "Name", "percentage": number}],
        "globalTrend": -5
      }
    `;

    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { response_mime_type: "application/json", temperature: 0.1 }
      }),
    });

    if (!geminiRes.ok) throw new Error("AI Service Busy");

    const aiData = await geminiRes.json();
    const rawText = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const result = JSON.parse(rawText.replace(/```json/g, '').replace(/```/g, '').trim());

    return new Response(JSON.stringify({
      ...result,
      totalRecurringTickets: tickets.length,
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