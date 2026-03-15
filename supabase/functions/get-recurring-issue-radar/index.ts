// v1.1 - Optimized AI Recurring Issue Radar with Caching
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
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    const { customerName, forceRefresh } = await req.json();
    const cacheKey = customerName || 'All';

    // 1. Check Cache (unless forceRefresh is true)
    if (!forceRefresh) {
      const { data: cached } = await supabase
        .from('ai_recurring_issues_cache')
        .select('*')
        .eq('customer_name', cacheKey)
        .single();

      if (cached) {
        const hoursOld = dateFns.differenceInHours(new Date(), new Date(cached.updated_at));
        if (hoursOld < 12) {
          console.log(`[radar] Returning cached data for ${cacheKey} (${hoursOld}h old)`);
          return new Response(JSON.stringify(cached.data), { status: 200, headers: corsHeaders });
        }
      }
    }

    // 2. Fetch Tickets (Last 90 days)
    const ninetyDaysAgo = dateFns.subDays(new Date(), 90).toISOString();
    let query = supabase
      .from('freshdesk_tickets')
      .select('freshdesk_id, subject, cf_module, created_at')
      .gte('created_at', ninetyDaysAgo);

    if (customerName && customerName !== 'All') {
      query = query.eq('cf_company', customerName);
    }

    const { data: tickets, error: fetchError } = await query.limit(1000);

    if (fetchError) throw fetchError;
    if (!tickets || tickets.length < 5) {
      return new Response(JSON.stringify({ empty: true }), { status: 200, headers: corsHeaders });
    }

    // 3. Data Deduplication for AI Efficiency
    // Group by module and deduplicate similar subjects to save tokens and speed up AI
    const moduleGroups: Record<string, any[]> = {};
    tickets.forEach(t => {
      const mod = t.cf_module || 'General';
      if (!moduleGroups[mod]) moduleGroups[mod] = [];
      // Only add if subject is somewhat unique in this module sample
      if (moduleGroups[mod].length < 30) {
        moduleGroups[mod].push({ id: t.freshdesk_id, s: t.subject });
      }
    });

    // 4. AI Clustering & Analysis
    const prompt = `
      Analyze these ${tickets.length} tickets and identify RECURRING product issues.
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
            "confidence": 0-100,
            "history": [{"month": "Jan", "count": 5}],
            "requiresEscalation": boolean,
            "sampleTickets": ["ID"]
          }
        ],
        "moduleDistribution": [{"module": "Name", "percentage": number}],
        "globalTrend": number
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

    if (!geminiRes.ok) throw new Error("AI Service Error");

    const aiData = await geminiRes.json();
    const rawText = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const result = JSON.parse(rawText.replace(/```json/g, '').replace(/```/g, '').trim());

    const finalData = {
      ...result,
      totalRecurringTickets: result.clusters.reduce((acc: number, c: any) => acc + c.occurrences, 0),
      generatedAt: new Date().toISOString()
    };

    // 5. Update Cache
    await supabase
      .from('ai_recurring_issues_cache')
      .upsert({
        customer_name: cacheKey,
        data: finalData,
        updated_at: new Date().toISOString()
      }, { onConflict: 'customer_name' });

    return new Response(JSON.stringify(finalData), {
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