import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DashboardData, KPIMetric } from '../types';
import { useDashboard } from '../DashboardContext';

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
  const { data: aiData, isLoading: isLoadingAI } = useQuery({
    queryKey: ['dashboardInsights'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('generate-dashboard-insights', { method: 'POST' });
      if (error) throw error;
      return data;
    }
  });

  const dashboardData: DashboardData = useMemo(() => {
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
      executiveSummary: aiData || null,
      kpis,
      risks: aiData?.risks || [],
      bottlenecks: [],
      forecast: { forecastVolume: 0, forecastSLA: 0, breachProbability: 0, aiNarrative: "" },
      customerRisks: [],
      agentCapacity: [],
      clusters: [],
      slaTimeline: [],
      actions: aiData?.actions || [],
      systemHealth: { aiConfidence: aiData?.confidence || 0, dataFreshness: "Live", syncIntegrity: "Healthy" },
      lastSync: aiData?.updated_at || new Date().toISOString(),
      insights: aiData?.insights || [],
      slaRiskScore: metrics?.urgentTickets > 5 ? 85 : 20
    };
  }, [metrics, aiData]);

  return {
    data: dashboardData,
    isLoading: isLoadingMetrics || isLoadingAI,
    isFetching: isLoadingMetrics || isLoadingAI,
  };
}