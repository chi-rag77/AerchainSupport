import { useMemo, useState } from 'react';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { parseISO, isPast, isWithinInterval } from 'date-fns';
import { fetchTicketsPaginated } from '../services/ticket.service';
import { Ticket, TicketFilters } from '../types';
import { useSupabase } from '@/components/SupabaseProvider';

const TICKET_QUERY_KEY = "freshdeskTickets";

export function useTickets(filters: TicketFilters, page: number = 1) {
  const { session } = useSupabase();
  const userEmail = session?.user?.email;
  const fullName = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || 'User';

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: [TICKET_QUERY_KEY, page],
    queryFn: () => fetchTicketsPaginated(page, 50),
    staleTime: 60000,
  });

  const rawTickets = data?.data || [];
  const totalCount = data?.count || 0;

  const filteredTickets = useMemo(() => {
    let currentTickets: Ticket[] = rawTickets;

    // Client-side filtering for the current page
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      currentTickets = currentTickets.filter(ticket =>
        ticket.subject.toLowerCase().includes(term) ||
        ticket.id.toLowerCase().includes(term)
      );
    }

    return currentTickets;
  }, [rawTickets, filters]);

  return {
    tickets: filteredTickets,
    totalCount,
    isLoading,
    isFetching,
    error,
    queryKey: TICKET_QUERY_KEY,
  };
}