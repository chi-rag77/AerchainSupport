import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DashboardData, KPIMetric, ExecutiveSummary } from '../types';
import { useDashboard } from '../DashboardContext';
import { Ticket } from '@/types';
import { toast } from 'sonner';
import { isWithinInterval, parseISO, isToday, isYesterday, startOfDay } from 'date-fns';

export function useExecutiveDashboard() {
  const queryClient = useQueryClient();
  const { dateRange, filters } = useDashboard();

  // 1. Fetch Aggregated Metrics
  const { data: metrics, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-dashboard-metrics', { method: 'POST' });
      if (error) throw error;
      return data;
    }
  });

  // 2. Fetch AI Insights
  const { data: aiRaw } = useQuery({
    queryKey: ['dashboardInsights'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('generate-dashboard-insights', { method: 'POST' });
      if (error) throw error;
      return data;
    },
    enabled: false,
  });

  const generateAIMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('generate-dashboard-insights', { method: 'POST' });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardInsights'] });
      toast.success("AI Insights generated!");
    }
  });

  // 3. Fetch tickets for calculations
  const { data: recentTickets = [], isLoading: isLoadingTickets, isFetching } = useQuery<Ticket[]>({
    queryKey: ['recentTicketsForDashboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('freshdesk_tickets')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000); 
      if (error) throw error;
      return data.map(t => ({ ...t, id: t.freshdesk_id })) as Ticket[];
    }
  });

  const { data: uniqueCompanies = [] } = useQuery<string[]>({
    queryKey: ['uniqueCompaniesList'],
    queryFn: async () => {
      const { data, error } = await supabase.from('freshdesk_tickets').select('cf_company').limit(1000);
      if (error) throw error;
      return Array.from(new Set((data || []).map(t => t.cf_company).filter(Boolean))) as string[];
    }
  });

  // Calculate Live Ticker Metrics
  const tickerMetrics = useMemo(() => {
    const createdToday = recentTickets.filter(t => isToday(parseISO(t.created_at))).length;
    const createdYesterday = recentTickets.filter(t => isYesterday(parseISO(t.created_at))).length;
    
    const resolvedToday = recentTickets.filter(t => {
      const status = t.status.toLowerCase();
      return (status === 'resolved' || status === 'closed') && isToday(parseISO(t.updated_at));
    }).length;
    
    const resolvedYesterday = recentTickets.filter(t => {
      const status = t.status.toLowerCase();
      return (status === 'resolved' || status === 'closed') && isYesterday(parseISO(t.updated_at));
    }).length;

    return {
      created: { value: createdToday, delta: createdToday - createdYesterday },
      resolved: { value: resolvedToday, delta: resolvedToday - resolvedYesterday }
    };
  }, [recentTickets]);

  const filteredTickets = useMemo(() => {
    if (!dateRange.from || !dateRange.to) return recentTickets;
    return recentTickets.filter(ticket => {
      try {
        const createdAt = parseISO(ticket.created_at);
        return isWithinInterval(createdAt, { start: dateRange.from!, end: dateRange.to! });
      } catch (e) { return false; }
    });
  }, [recentTickets, dateRange]);

  const dashboardData: DashboardData = useMemo(() => {
    const executiveSummary: ExecutiveSummary | null = aiRaw ? {
      summary: aiRaw.summary,
      riskLevel: aiRaw.risk_level,
      confidenceScore: aiRaw.confidence,
      keyDrivers: aiRaw.key_drivers || [],
      executiveAction: aiRaw.executive_action,
      updatedAt: aiRaw.updated_at,
    } : null;

    const kpis: KPIMetric[] = [
      { title: "Total Tickets", value: metrics?.totalTickets || 0, trend: 12, microInsight: "Volume trend", archetype: 'volume' },
      { title: "Open Backlog", value: metrics?.openTickets || 0, trend: -5, microInsight: "Backlog status", archetype: 'health' },
      { title: "Resolved", value: metrics?.resolvedTickets || 0, trend: 15, microInsight: "Efficiency", archetype: 'health' },
      { title: "Bugs", value: metrics?.bugTickets || 0, trend: 8, microInsight: "Stability", archetype: 'attention' }
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
      systemHealth: { aiConfidence: aiRaw?.confidence || 0, dataFreshness: "Live", syncIntegrity: "Healthy" },
      lastSync: aiRaw?.updated_at || new Date().toISOString(),
      insights: aiRaw?.insights || [],
      slaRiskScore: (metrics?.urgentTickets || 0) > 5 ? 85 : 20,
      tickerMetrics
    };
  }, [metrics, aiRaw, tickerMetrics]);

  return {
    data: dashboardData,
    tickets: filteredTickets,
    uniqueCompanies,
    isLoading: isLoadingMetrics || isLoadingTickets,
    isFetching,
    isGeneratingAI: generateAIMutation.isPending,
    generateAI: generateAIMutation.mutate,
    hasAI: !!aiRaw,
  };
}