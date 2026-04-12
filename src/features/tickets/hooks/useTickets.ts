import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTicketsPaginated } from '../services/ticket.service';
import { Ticket, TicketFilters } from '../types';
import { supabase } from '@/integrations/supabase/client';

const TICKET_QUERY_KEY = "freshdeskTickets";

export function useTickets(filters: TicketFilters, page: number = 1) {
  // 1. Fetch Paginated Tickets (Updated to 15 per page)
  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: [TICKET_QUERY_KEY, page, filters.searchTerm],
    queryFn: () => fetchTicketsPaginated(page, 15),
    staleTime: 30000,
  });

  // 2. Fetch Global Metrics (Aggregated)
  const { data: metricsData } = useQuery({
    queryKey: ['queueMetrics'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-dashboard-metrics', { method: 'POST' });
      if (error) throw error;
      return data;
    },
    staleTime: 60000,
  });

  // 3. Fetch Unique Filter Options (Limited queries for speed)
  const { data: filterOptions } = useQuery({
    queryKey: ['uniqueFilterOptions'],
    queryFn: async () => {
      const { data: companies } = await supabase.from('freshdesk_tickets').select('cf_company').limit(1000);
      const { data: assignees } = await supabase.from('freshdesk_tickets').select('assignee').limit(1000);
      const { data: types } = await supabase.from('freshdesk_tickets').select('type').limit(1000);
      
      return {
        companies: Array.from(new Set((companies || []).map(t => t.cf_company).filter(Boolean) || [])).sort(),
        assignees: Array.from(new Set((assignees || []).map(t => t.assignee).filter(Boolean) || [])).sort(),
        types: Array.from(new Set((types || []).map(t => t.type).filter(Boolean) || [])).sort(),
        statuses: ['Open (Being Processed)', 'On Tech', 'Pending (Awaiting your Reply)', 'Escalated', 'Resolved', 'Closed'],
        priorities: ['Low', 'Medium', 'High', 'Urgent'],
        dependencies: ['None', 'Tech', 'Product', 'Customer']
      };
    },
    staleTime: 300000, // 5 minutes
  });

  const rawTickets = data?.data || [];
  const totalCount = data?.count || 0;

  const filteredTickets = useMemo(() => {
    let currentTickets: Ticket[] = rawTickets;
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      currentTickets = currentTickets.filter(ticket =>
        ticket.subject.toLowerCase().includes(term) ||
        ticket.id.toLowerCase().includes(term)
      );
    }
    return currentTickets;
  }, [rawTickets, filters.searchTerm]);

  return {
    tickets: filteredTickets,
    totalCount,
    isLoading,
    isFetching,
    error,
    metrics: {
      totalActiveTickets: metricsData?.totalTickets || 0,
      openTicketsSpecific: metricsData?.openTickets || 0,
      bugsReceivedOverall: metricsData?.bugTickets || 0,
    },
    uniqueFilters: filterOptions || {
      assignees: [],
      statuses: [],
      priorities: [],
      companies: [],
      types: [],
      dependencies: []
    },
    queryKey: TICKET_QUERY_KEY,
  };
}