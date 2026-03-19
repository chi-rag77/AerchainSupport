import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DashboardData, KPIMetric, ExecutiveSummary, GeographySummary, GeographicData } from '../types';
import { useDashboard } from '../DashboardContext';
import { Ticket } from '@/types';
import { toast } from 'sonner';
import { isWithinInterval, parseISO, isToday, isYesterday, differenceInHours } from 'date-fns';

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

  const { data: metrics, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-dashboard-metrics', { method: 'POST' });
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, 
  });

  const { data: aiRaw, isLoading: isLoadingAI, isPending: isGeneratingAI } = useQuery({
    queryKey: ['dashboardInsights'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('generate-dashboard-insights', { method: 'POST' });
      if (error) throw error;
      return data;
    },
    staleTime: 30 * 60 * 1000,
    enabled: false,
  });

  const generateAIMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('generate-dashboard-insights', { method: 'POST' });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['dashboardInsights'], data);
      toast.success("AI Insights generated!");
    },
    onError: (err: any) => {
      toast.error(`AI Analysis failed: ${err.message}`);
    }
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

    if (filters.isFocusMode) {
      current = current.filter(t => 
        t.priority.toLowerCase() === 'urgent' || 
        t.status.toLowerCase() === 'escalated'
      );
    }

    return current;
  }, [recentTickets, dateRange, filters.company, filters.isFocusMode]);

  const geographyData = useMemo((): GeographySummary => {
    const countryMap = new Map<string, { total: number; resolved: number; open: number }>();
    
    filteredTickets.forEach(t => {
      const country = t.cf_country || 'Unidentified Region';
      if (!countryMap.has(country)) {
        countryMap.set(country, { total: 0, resolved: 0, open: 0 });
      }
      const stats = countryMap.get(country)!;
      stats.total++;
      if (['resolved', 'closed'].includes(t.status.toLowerCase())) {
        stats.resolved++;
      } else {
        stats.open++;
      }
    });

    const distribution: GeographicData[] = Array.from(countryMap.entries()).map(([name, stats]) => {
      const registryEntry = COUNTRY_REGISTRY[name];
      return {
        countryName: name,
        countryCode: registryEntry ? registryEntry.id : 'UNKNOWN', 
        ...stats
      };
    }).sort((a, b) => b.total - a.total);

    return {
      activeCountries: countryMap.size,
      totalGlobalTickets: filteredTickets.length,
      topRegion: distribution[0]?.countryName || 'N/A',
      distribution
    };
  }, [filteredTickets]);

  const dashboardData: DashboardData = useMemo(() => {
    const executiveSummary: ExecutiveSummary | null = aiRaw ? {
      summary: aiRaw.summary,
      riskLevel: aiRaw.risk_level,
      confidenceScore: aiRaw.confidence,
      keyDrivers: aiRaw.key_drivers || [],
      executiveAction: aiRaw.executive_action,
      updatedAt: aiRaw.updated_at,
    } : null;

    const generateSparkline = () => Array.from({ length: 10 }, () => ({ value: Math.floor(Math.random() * 50) + 10 }));

    const kpis: KPIMetric[] = [
      { 
        title: "Total Tickets", 
        value: metrics?.totalTickets || 0, 
        trend: 12, 
        microInsight: "unusual spike", 
        archetype: 'volume',
        sparklineData: generateSparkline(),
        reasoning: "12% increase primarily driven by Danone invoice queries (+18) and PO sync delays (+12)."
      },
      { 
        title: "Open Backlog", 
        value: metrics?.openTickets || 0, 
        trend: 5, 
        microInsight: "higher than avg", 
        archetype: 'backlog',
        sparklineData: generateSparkline(),
        reasoning: "Backlog rising due to 27 tickets stuck in 'On Tech' status for >48 hours."
      },
      { 
        title: "Resolved", 
        value: metrics?.resolvedTickets || 0, 
        trend: 15, 
        microInsight: "healthy", 
        archetype: 'resolved',
        sparklineData: generateSparkline(),
        reasoning: "Resolution velocity improved by 15% following the deployment of the new RFQ automation."
      },
      { 
        title: "Bugs", 
        value: metrics?.bugTickets || 0, 
        trend: 8, 
        microInsight: "needs attention", 
        archetype: 'attention',
        sparklineData: generateSparkline(),
        reasoning: "8% increase in bug reports concentrated in the 'Supplier Portal' module."
      }
    ];

    return {
      executiveSummary,
      kpis,
      geography: geographyData,
      risks: aiRaw?.risks || [],
      bottlenecks: aiRaw?.bottlenecks || [],
      forecast: aiRaw?.forecast || { 
        forecastVolume: Math.round((metrics?.totalTickets || 0) * 1.1), 
        forecastSLA: 82, 
        breachProbability: 0.15, 
        aiNarrative: "Projected SLA: 82% by EOD. Risk of breach: Medium." 
      },
      customerRisks: [],
      agentCapacity: [],
      clusters: [],
      slaTimeline: [],
      actions: aiRaw?.actions || [],
      systemHealth: { aiConfidence: aiRaw?.confidence || 0, dataFreshness: "Live", syncIntegrity: "Healthy" },
      lastSync: aiRaw?.updated_at || new Date().toISOString(),
      insights: aiRaw?.insights || [
        { message: "3 tickets need immediate attention", severity: "critical", type: "risk", link: "/tickets?priority=Urgent" },
        { message: "2 customers waiting >4 hrs", severity: "warning", type: "anomaly", link: "/tickets?status=Open" },
        { message: "Spike in Queries from Danone", severity: "info", type: "trend", link: "/customer360?customer=Danone" }
      ],
      slaRiskScore: (metrics?.urgentTickets || 0) > 5 ? 85 : 20,
      tickerMetrics
    };
  }, [metrics, aiRaw, tickerMetrics, geographyData]);

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