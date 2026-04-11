import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DashboardData, KPIMetric, ExecutiveSummary, GeographySummary, GeographicData, IssueCluster } from '../types';
import { useDashboard } from '../DashboardContext';
import { Ticket } from '@/types';
import { toast } from 'sonner';
import { isWithinInterval, parseISO, isToday, isYesterday } from 'date-fns';

const COUNTRY_REGISTRY: Record<string, { iso: string; id: string }> = {
  'United States': { iso: 'USA', id: '840' },
  'USA': { iso: 'USA', id: '840' },
  'India': { iso: 'IND', id: '356' },
  'Germany': { iso: 'DEU', id: '276' },
  'United Arab Emirates': { iso: 'ARE', id: '784' },
  'UAE': { iso: 'ARE', id: '784' },
  'Singapore': { iso: 'SGP', id: '702' },
  'United Kingdom': { iso: 'GBR', id: '826' },
  'UK': { iso: 'GBR', id: '826' },
  'Canada': { iso: 'CAN', id: '124' },
  'Australia': { iso: 'AUS', id: '036' },
  'France': { iso: 'FRA', id: '250' },
  'Japan': { iso: 'JPN', id: '392' },
  'Brazil': { iso: 'BRA', id: '076' },
  'Netherlands': { iso: 'NLD', id: '528' },
  'Switzerland': { iso: 'CHE', id: '756' },
};

export function useExecutiveDashboard() {
  const queryClient = useQueryClient();
  const { dateRange, filters } = useDashboard();

  // 1. Basic Metrics
  const { data: metrics, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-dashboard-metrics', { method: 'POST' });
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, 
  });

  // 2. Operational Intelligence
  const { data: opsData, isLoading: isLoadingOps } = useQuery({
    queryKey: ['operationalIntelligence'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-operational-intelligence', { method: 'POST' });
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // 3. Active Risks
  const { data: riskData, isLoading: isLoadingRisks } = useQuery({
    queryKey: ['activeRisks'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-active-risks', { method: 'POST' });
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // 4. Product Intelligence (Radar)
  const { data: radarData, isLoading: isLoadingRadar } = useQuery({
    queryKey: ['recurringIssueRadar', filters.company || 'All'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-recurring-issue-radar', { 
        method: 'POST',
        body: { customerName: filters.company || 'All' }
      });
      if (error) throw error;
      return data;
    },
    staleTime: 10 * 60 * 1000,
  });

  // 5. AI Insights
  const { data: aiRaw, isLoading: isLoadingAI } = useQuery({
    queryKey: ['dashboardInsights'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('generate-dashboard-insights', { method: 'POST' });
      if (error) throw error;
      return data;
    },
    staleTime: 30 * 60 * 1000,
  });

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
    },
    staleTime: 2 * 60 * 1000,
  });

  const { data: uniqueCompanies = [] } = useQuery<string[]>({
    queryKey: ['uniqueCompaniesList'],
    queryFn: async () => {
      const { data, error } = await supabase.from('freshdesk_tickets').select('cf_company').limit(1000);
      if (error) throw error;
      return Array.from(new Set((data || []).map(t => t.cf_company).filter(Boolean))) as string[];
    },
    staleTime: 10 * 60 * 1000,
  });

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
    let current = recentTickets;
    if (dateRange.from && dateRange.to) {
      current = current.filter(ticket => {
        try {
          const createdAt = parseISO(ticket.created_at);
          return isWithinInterval(createdAt, { start: dateRange.from!, end: dateRange.to! });
        } catch (e) { return false; }
      });
    }
    if (filters.company) {
      current = current.filter(t => t.cf_company === filters.company);
    }
    return current;
  }, [recentTickets, dateRange, filters.company]);

  const geographyData = useMemo((): GeographySummary => {
    const countryMap = new Map<string, { total: number; resolved: number; open: number }>();
    filteredTickets.forEach(t => {
      const country = t.cf_country || 'Unidentified Region';
      if (!countryMap.has(country)) countryMap.set(country, { total: 0, resolved: 0, open: 0 });
      const stats = countryMap.get(country)!;
      stats.total++;
      if (['resolved', 'closed'].includes(t.status.toLowerCase())) stats.resolved++;
      else stats.open++;
    });
    const distribution: GeographicData[] = Array.from(countryMap.entries()).map(([name, stats]) => {
      const registryEntry = COUNTRY_REGISTRY[name];
      return { countryName: name, countryCode: registryEntry ? registryEntry.id : 'UNKNOWN', ...stats };
    }).sort((a, b) => b.total - a.total);
    return { activeCountries: countryMap.size, totalGlobalTickets: filteredTickets.length, topRegion: distribution[0]?.countryName || 'N/A', distribution };
  }, [filteredTickets]);

  const dashboardData: DashboardData = useMemo(() => {
    const generateSparkline = () => Array.from({ length: 10 }, () => ({ value: Math.floor(Math.random() * 50) + 10 }));

    const kpis: KPIMetric[] = [
      { title: "Ticket Volume", value: metrics?.totalTickets || 0, trend: 12, microInsight: "23% above avg", archetype: 'volume', sparklineData: generateSparkline() },
      { title: "Resolution Rate", value: `${Math.round((metrics?.resolvedTickets / metrics?.totalTickets) * 100) || 0}%`, trend: 5, microInsight: "123m avg time", archetype: 'resolved', sparklineData: generateSparkline() },
      { title: "Backlog Health", value: metrics?.openTickets || 0, trend: -8, microInsight: "45 tickets aging", archetype: 'backlog', sparklineData: generateSparkline() },
      { title: "SLA Adherence", value: `${metrics?.slaCompliance || 0}%`, trend: -2, microInsight: "95% target", archetype: 'attention', sparklineData: generateSparkline() },
      { title: "Escalation Velocity", value: riskData?.metrics?.escalationRisk?.count || 0, trend: 30, microInsight: "↑ vs baseline", archetype: 'risk', sparklineData: generateSparkline() },
      { title: "Customer Health", value: "82%", trend: -5, microInsight: "82% in green", archetype: 'health', sparklineData: generateSparkline() },
      { title: "Issue Recurrence", value: `${radarData?.clusters?.length || 0}`, trend: 12, microInsight: "Active clusters", archetype: 'recurrence', sparklineData: generateSparkline() },
      { title: "First Contact Res", value: "67%", trend: 2, microInsight: "70% target", archetype: 'quality', sparklineData: generateSparkline() },
    ];

    return {
      executiveSummary: aiRaw ? { summary: aiRaw.summary, riskLevel: aiRaw.risk_level, confidenceScore: aiRaw.confidence, keyDrivers: aiRaw.key_drivers || [], executiveAction: aiRaw.executive_action, updatedAt: aiRaw.updated_at } : null,
      kpis,
      geography: geographyData,
      risks: aiRaw?.risks || [],
      bottlenecks: opsData?.bottlenecks || [],
      forecast: opsData?.forecast || { forecastVolume: 0, forecastSLA: 0, breachProbability: 0, aiNarrative: "Calculating..." },
      customerRisks: opsData?.customerRisks || [],
      agentCapacity: opsData?.agentCapacity || [],
      clusters: radarData?.clusters || [],
      slaTimeline: [],
      actions: opsData?.actions || [],
      systemHealth: opsData?.systemHealth || { aiConfidence: 0, dataFreshness: "N/A", syncIntegrity: "Healthy" },
      lastSync: aiRaw?.updated_at || new Date().toISOString(),
      insights: aiRaw?.insights || [],
      slaRiskScore: (riskData?.metrics?.slaRisk?.count || 0) > 5 ? 85 : 20,
      tickerMetrics
    };
  }, [metrics, aiRaw, tickerMetrics, geographyData, opsData, riskData, radarData]);

  return {
    data: dashboardData,
    tickets: filteredTickets,
    uniqueCompanies,
    isLoading: isLoadingMetrics || isLoadingTickets || isLoadingOps || isLoadingRisks || isLoadingRadar,
    isFetching,
    generateAI: () => queryClient.invalidateQueries({ queryKey: ['dashboardInsights'] }),
    hasAI: !!aiRaw,
  };
}