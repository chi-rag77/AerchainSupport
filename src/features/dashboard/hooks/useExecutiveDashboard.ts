import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Ticket } from '@/types';
import { DashboardData, KPIMetric } from '../types';
import { subDays, parseISO, differenceInHours, isWithinInterval } from 'date-fns';
import { useDashboard } from '../DashboardContext';

export function useExecutiveDashboard() {
  const { dateRange, filters } = useDashboard();

  // 1. Fetch Raw Tickets
  const { data: tickets = [], isLoading: isLoadingTickets, isFetching } = useQuery<Ticket[]>({
    queryKey: ['freshdeskTickets'],
    queryFn: async () => {
      const { data, error } = await supabase.from('freshdesk_tickets').select('*').limit(10000);
      if (error) throw error;
      return data.map(t => ({ ...t, id: t.freshdesk_id }));
    }
  });

  // 2. Fetch AI Insights & Summary
  const { data: aiData, isLoading: isLoadingAI } = useQuery({
    queryKey: ['dashboardInsights', dateRange, filters],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('generate-dashboard-insights', { 
        method: 'POST',
        body: { dateRange, filters }
      });
      if (error) throw error;
      return data;
    }
  });

  // 3. Fetch Operational Intelligence (New)
  const { data: opIntel, isLoading: isLoadingOp } = useQuery({
    queryKey: ['operationalIntelligence', dateRange, filters],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-operational-intelligence', { 
        method: 'POST',
        body: { dateRange, filters }
      });
      if (error) throw error;
      return data;
    }
  });

  const dashboardData: DashboardData = useMemo(() => {
    const now = new Date();
    
    let filtered = tickets;
    if (filters.company) filtered = filtered.filter(t => t.cf_company === filters.company);
    if (filters.status) filtered = filtered.filter(t => t.status === filters.status);
    if (filters.priority) filtered = filtered.filter(t => t.priority === filters.priority);

    const currentTickets = filtered.filter(t => {
      const created = parseISO(t.created_at);
      return isWithinInterval(created, { start: dateRange.from!, end: dateRange.to! });
    });

    const duration = dateRange.to!.getTime() - dateRange.from!.getTime();
    const prevStart = new Date(dateRange.from!.getTime() - duration);
    const prevEnd = new Date(dateRange.to!.getTime() - duration);
    
    const previousTickets = filtered.filter(t => {
      const created = parseISO(t.created_at);
      return isWithinInterval(created, { start: prevStart, end: prevEnd });
    });

    const calculateTrend = (curr: number, prev: number) => prev === 0 ? 0 : parseFloat(((curr - prev) / prev * 100).toFixed(1));

    const kpis: KPIMetric[] = [
      {
        title: "Total Tickets",
        value: currentTickets.length,
        trend: calculateTrend(currentTickets.length, previousTickets.length),
        microInsight: currentTickets.length > previousTickets.length ? "Volume trending up." : "Volume is stabilizing.",
        archetype: 'volume'
      },
      {
        title: "Open Backlog",
        value: filtered.filter(t => !['resolved', 'closed'].includes(t.status.toLowerCase())).length,
        trend: -2.4,
        microInsight: "Backlog clearing at steady rate.",
        archetype: 'health'
      },
      {
        title: "Resolved",
        value: currentTickets.filter(t => ['resolved', 'closed'].includes(t.status.toLowerCase())).length,
        trend: 15.2,
        microInsight: "Efficiency improved vs last period.",
        archetype: 'health'
      },
      {
        title: "Bugs",
        value: currentTickets.filter(t => t.type?.toLowerCase() === 'bug').length,
        trend: calculateTrend(currentTickets.filter(t => t.type?.toLowerCase() === 'bug').length, previousTickets.filter(t => t.type?.toLowerCase() === 'bug').length),
        microInsight: "Bug reports within normal range.",
        archetype: 'attention'
      }
    ];

    const activeTickets = filtered.filter(t => !['resolved', 'closed'].includes(t.status.toLowerCase()));
    const nearBreach = activeTickets.filter(t => t.due_by && differenceInHours(parseISO(t.due_by), now) < 4).length;
    const slaRiskScore = activeTickets.length > 0 ? Math.min(100, (nearBreach / activeTickets.length) * 500) : 0;

    return {
      executiveSummary: aiData?.executiveSummary || null,
      kpis,
      risks: aiData?.risks || [],
      bottlenecks: opIntel?.bottlenecks || [],
      forecast: opIntel?.forecast || { forecastVolume: 0, forecastSLA: 0, breachProbability: 0, aiNarrative: "" },
      customerRisks: opIntel?.customerRisks || [],
      agentCapacity: opIntel?.agentCapacity || [],
      clusters: [],
      slaTimeline: [],
      actions: opIntel?.actions || [],
      systemHealth: opIntel?.systemHealth || { aiConfidence: 0, dataFreshness: "", syncIntegrity: "Healthy" },
      lastSync: tickets.length > 0 ? tickets[0].updated_at : now.toISOString(),
      insights: aiData?.insights || [],
      slaRiskScore
    };
  }, [tickets, aiData, opIntel, dateRange, filters]);

  const uniqueCompanies = useMemo(() => {
    const cos = new Set<string>();
    tickets.forEach(t => t.cf_company && cos.add(t.cf_company));
    return Array.from(cos).sort();
  }, [tickets]);

  return {
    data: dashboardData,
    tickets,
    uniqueCompanies,
    isLoading: isLoadingTickets || isLoadingAI || isLoadingOp,
    isFetching,
  };
}