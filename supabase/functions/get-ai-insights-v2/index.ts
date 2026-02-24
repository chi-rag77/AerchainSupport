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
    const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
      global: { headers: { Authorization: req.headers.get('Authorization')! } },
    });

    const { data: tickets } = await supabase.from('freshdesk_tickets').select('*').limit(2000);
    const now = new Date();

    // --- 1. AI Root Cause Clustering (Simulated NLP) ---
    const clusters = [
      {
        id: "c1",
        topic: "Login & Authentication Failures",
        count: 42,
        trend: 48,
        rootCauseProbability: 82,
        linkedEvent: "New Mobile App Release (v2.4)",
        severity: "critical"
      },
      {
        id: "c2",
        topic: "API Timeout Errors",
        count: 18,
        trend: 12,
        rootCauseProbability: 65,
        linkedEvent: "Infrastructure Maintenance",
        severity: "warning"
      }
    ];

    // --- 2. Predictive Forecasting (Simulated Time-Series) ---
    const forecastPoints = [];
    for (let i = -7; i <= 7; i++) {
      const date = dateFns.addDays(now, i);
      forecastPoints.push({
        date: date.toISOString(),
        actual: i <= 0 ? 40 + Math.random() * 20 : undefined,
        predicted: 50 + (i * 2) + Math.random() * 10,
        upperBound: 70 + (i * 2),
        lowerBound: 30 + (i * 2)
      });
    }

    // --- 3. Automation ROI ---
    const automation = {
      potentialAutomationRate: 31,
      estimatedSavings: 420000,
      topCategories: [
        { name: "Password Reset", deflectionPotential: 92, avgResolutionTime: 4.5 },
        { name: "Invoice Requests", deflectionPotential: 78, avgResolutionTime: 12.2 },
        { name: "Feature Inquiries", deflectionPotential: 45, avgResolutionTime: 28.4 }
      ]
    };

    // --- 4. Sentiment & Risk ---
    const accountRisks = [
      {
        company: "GlobalTech Industries",
        healthScore: 42,
        sentimentTrend: "worsening",
        churnProbability: 68,
        signals: ["3 Urgent Escalations", "SLA Breach on critical bug"]
      },
      {
        company: "Nexus Systems",
        healthScore: 58,
        sentimentTrend: "stable",
        churnProbability: 24,
        signals: ["High volume of 'How-to' queries"]
      }
    ];

    // --- 5. Agent Intelligence ---
    const agentIntelligence = [
      {
        name: "Rahul S.",
        complexityLoad: 88,
        burnoutRisk: "high",
        skillMatch: 94,
        recommendation: "Handling 35% complex tickets. Suggest redistributing Tier-2 backlog."
      },
      {
        name: "Sarah J.",
        complexityLoad: 42,
        burnoutRisk: "low",
        skillMatch: 65,
        recommendation: "Underutilized on technical tasks. Potential for Tier-2 promotion training."
      }
    ];

    const response = {
      summary: {
        narrative: "Operations are facing pressure from a 48% spike in Login Failures linked to the recent mobile release. While overall SLA is stable, 2 enterprise accounts are at high churn risk due to worsening sentiment.",
        highlights: [
          { label: "Ticket Volume", value: "+12%", trend: 12, type: "negative" },
          { label: "Automation Potential", value: "31%", trend: 5, type: "positive" },
          { label: "High Risk Accounts", value: "12", trend: 2, type: "negative" }
        ]
      },
      clusters,
      forecast: {
        points: forecastPoints,
        recommendation: "Expected 23% increase in billing tickets next week. Recommend adding 2 agents during peak hours (10 AM - 2 PM)."
      },
      automation,
      accountRisks,
      agentIntelligence,
      businessImpact: {
        retentionImpact: 6,
        annualRevenueImpact: 12000000,
        costPerAccount: [
          { name: "GlobalTech", cost: 45000 },
          { name: "Nexus", cost: 12000 }
        ]
      }
    };

    return new Response(JSON.stringify(response), {
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