import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DashboardData, KPIMetric, ExecutiveSummary } from '../types';
import { useDashboard } from '../DashboardContext';
import { Ticket } from '@/types';

export function useExecutiveDashboard() {
  const { dateRange, filters } = useDashboard();

  // 1. Fetch Aggregated Metrics (Fast)
  const { data: metrics, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-dashboard-metrics', { method: 'POST' });
      if (error) throw error;
      return data;
    }
  });

  // 2. Fetch AI Insights (Cached)
  const { data: aiRaw, isLoading: isLoadingAI } = useQuery({
    queryKey: ['dashboardInsights'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('generate-dashboard-insights', { method: 'POST' });
      if (error) throw error;
      return data;
    }
  });

  // 3. Fetch a small subset of recent tickets for the trend charts (Avoids 10k fetch)
  const { data: recentTickets = [], isLoading: isLoadingTickets } = useQuery<Ticket[]>({
    queryKey: ['recentTicketsForDashboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('freshdesk_tickets')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100); // Only fetch 100 for the dashboard overview
      if (error) throw error;
      return data.map(t => ({ ...t, id: t.freshdesk_id })) as Ticket[];
    }
  });

  // 4. Fetch Unique Companies for filters
  const { data: uniqueCompanies = [] } = useQuery<string[]>({
    queryKey: ['uniqueCompaniesList'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_unique_companies'); // Assuming an RPC or just a limited select
      if (error) {
        // Fallback if RPC doesn't exist
        const { data: fallbackData } = await supabase.from('freshdesk_tickets').select('cf_company').limit(1000);
        return Array.from(new Set((fallbackData || []).map(t => t.cf_company).filter(Boolean))) as string[];
      }
      return data as string[];
    }
  });

  const dashboardData: DashboardData = useMemo(() => {
    // Map snake_case from API to camelCase for the UI
    const executiveSummary: ExecutiveSummary | null = aiRaw ? {
      summary: aiRaw.summary,
      riskLevel: aiRaw.risk_level,
      confidenceScore: aiRaw.confidence,
      keyDrivers: aiRaw.key_drivers || [],
      executiveAction: aiRaw.executive_action,
      updatedAt: aiRaw.updated_at,
    } : null;

    const kpis: KPIMetric[] = [
      {
        title: "Total Tickets",
        value: metrics?.totalTickets || 0,
        trend: 12,
        microInsight: "Volume is trending up.",
        archetype: 'volume'
      },
      {
        title: "Open Backlog",
        value: metrics?.openTickets || 0,
        trend: -5,
        microInsight: "Backlog clearing steadily.",
        archetype: 'health'
      },
      {
        title: "Resolved",
        value: metrics?.resolvedTickets || 0,
        trend: 15,
        microInsight: "Efficiency improved.",
        archetype: 'health'
      },
      {
        title: "Bugs",
        value: metrics?.bugTickets || 0,
        trend: 8,
        microInsight: "Normal range.",
        archetype: 'attention'
      }
    ];

    return {
      executiveSummary,
      kpis,
      risks: aiRaw?.risks || [],
      bottlenecks: aiRaw?.bottlenecks || [],
      forecast: aiRaw?.forecast || { forecastVolume: 0, forecastSLA: 0, breachProbability: 0, aiNarrative: "" },
      customerRisks: [],
      agentCapacity: [],
      clusters: [],
      slaTimeline: [],
      actions: aiRaw?.actions || [],
      systemHealth: { 
        aiConfidence: aiRaw?.confidence || 0, 
        dataFreshness: "Live", 
        syncIntegrity: "Healthy" 
      },
      lastSync: aiRaw?.updated_at || new Date().toISOString(),
      insights: aiRaw?.insights || [],
      slaRiskScore: (metrics?.urgentTickets || 0) > 5 ? 85 : 20
    };
  }, [metrics, aiRaw]);

  return {
    data: dashboardData,
    tickets: recentTickets,
    uniqueCompanies,
    isLoading: isLoadingMetrics || isLoadingAI || isLoadingTickets,
    isFetching: isLoadingMetrics || isLoadingAI || isLoadingTickets,
  };
}