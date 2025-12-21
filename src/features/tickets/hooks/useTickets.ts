import { useMemo, useState } from 'react';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { parseISO, isPast, isWithinInterval } from 'date-fns';
import { fetchAllTickets } from '../services/ticket.service';
import { Ticket, TicketFilters } from '../types';
import { useSupabase } from '@/components/SupabaseProvider';

const TICKET_QUERY_KEY = ["freshdeskTickets"];

export function useTickets(filters: TicketFilters) {
  const { session } = useSupabase();
  const userEmail = session?.user?.email;
  const fullName = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || 'User';

  const { data: rawTickets = [], isLoading, error, isFetching } = useQuery<Ticket[], Error>({
    queryKey: TICKET_QUERY_KEY,
    queryFn: fetchAllTickets,
    staleTime: 60000, // 1 minute stale time
  } as UseQueryOptions<Ticket[], Error>);

  const filteredTickets = useMemo(() => {
    let currentTickets: Ticket[] = rawTickets;

    // 1. Quick Filters
    if (filters.myTickets && userEmail) {
      currentTickets = currentTickets.filter(ticket => 
        ticket.requester_email === userEmail || 
        ticket.assignee?.toLowerCase().includes(fullName.toLowerCase())
      );
    }
    if (filters.highPriority) {
      currentTickets = currentTickets.filter(ticket => 
        ticket.priority.toLowerCase() === 'high' || 
        ticket.priority.toLowerCase() === 'urgent'
      );
    }
    if (filters.slaBreached) {
      currentTickets = currentTickets.filter(ticket => {
        if (ticket.due_by) {
          const dueDate = parseISO(ticket.due_by);
          const now = new Date();
          const statusLower = ticket.status.toLowerCase();
          return isPast(dueDate) && statusLower !== 'resolved' && statusLower !== 'closed';
        }
        return false;
      });
    }

    // 2. Search Filter
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      currentTickets = currentTickets.filter(ticket =>
        ticket.subject.toLowerCase().includes(term) ||
        ticket.requester_email.toLowerCase().includes(term) ||
        (ticket.assignee && ticket.assignee.toLowerCase().includes(term)) ||
        ticket.id.toLowerCase().includes(term)
      );
    }

    // 3. Core Filters (Selects/Multi-Selects)
    currentTickets = currentTickets.filter(ticket => {
      const matchesStatus = filters.status === "All" || ticket.status.toLowerCase().includes(filters.status.toLowerCase());
      const matchesPriority = filters.priority === "All" || ticket.priority.toLowerCase() === filters.priority.toLowerCase();
      const matchesAssignee = filters.assignees.length === 0 || (ticket.assignee && filters.assignees.includes(ticket.assignee));
      const matchesCompany = filters.companies.length === 0 || (ticket.cf_company && filters.companies.includes(ticket.cf_company));
      const matchesType = filters.types.length === 0 || (ticket.type && filters.types.includes(ticket.type));
      const matchesDependency = filters.dependencies.length === 0 || (ticket.cf_dependency && filters.dependencies.includes(ticket.cf_dependency));
      return matchesStatus && matchesPriority && matchesAssignee && matchesCompany && matchesType && matchesDependency;
    });

    // 4. Date Range Filter
    if (filters.dateRange?.from) {
      currentTickets = currentTickets.filter(ticket => {
        const dateToCheck = filters.dateField === 'created_at' ? parseISO(ticket.created_at) : parseISO(ticket.updated_at);
        const start = filters.dateRange!.from!;
        const end = filters.dateRange!.to || start;

        const effectiveStart = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0, 0);
        const effectiveEnd = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999);

        return isWithinInterval(dateToCheck, { start: effectiveStart, end: effectiveEnd });
      });
    }

    return currentTickets;
  }, [rawTickets, filters, userEmail, fullName]);

  // --- Derived Data for Filters ---
  const uniqueAssignees = useMemo(() => {
    const assignees = new Set<string>();
    rawTickets.forEach(ticket => {
      if (ticket.assignee && ticket.assignee !== "Unassigned") {
        assignees.add(ticket.assignee);
      }
    });
    return Array.from(assignees).sort();
  }, [rawTickets]);

  const uniqueStatuses = useMemo(() => {
    const statuses = new Set<string>();
    rawTickets.forEach(ticket => {
      statuses.add(ticket.status);
    });
    return ["All", ...Array.from(statuses).sort()];
  }, [rawTickets]);

  const uniquePriorities = useMemo(() => {
    const priorities = new Set<string>();
    rawTickets.forEach(ticket => {
      priorities.add(ticket.priority);
    });
    return ["All", ...Array.from(priorities).sort()];
  }, [rawTickets]);

  const uniqueCompanies = useMemo(() => {
    const companies = new Set<string>();
    rawTickets.forEach(ticket => {
      if (ticket.cf_company) {
        companies.add(ticket.cf_company);
      }
    });
    return Array.from(companies).sort();
  }, [rawTickets]);

  const uniqueTypes = useMemo(() => {
    const types = new Set<string>();
    rawTickets.forEach(ticket => {
      if (ticket.type) {
        types.add(ticket.type);
      }
    });
    return Array.from(types).sort();
  }, [rawTickets]);

  const uniqueDependencies = useMemo(() => {
    const dependencies = new Set<string>();
    rawTickets.forEach(ticket => {
      if (ticket.cf_dependency) {
        dependencies.add(ticket.cf_dependency);
      }
    });
    return Array.from(dependencies).sort();
  }, [rawTickets]);

  // --- Derived Metrics (for KPI cards) ---
  const metrics = useMemo(() => {
    const totalTicketsOverall = rawTickets.length;
    const totalActiveTickets = rawTickets.filter(t =>
      t.status.toLowerCase() !== 'resolved' && t.status.toLowerCase() !== 'closed'
    ).length;
    const openTicketsSpecific = rawTickets.filter(t => t.status.toLowerCase() === 'open (being processed)').length;
    const bugsReceivedOverall = rawTickets.filter(t => t.type?.toLowerCase() === 'bug').length;

    return {
      totalTicketsOverall,
      totalActiveTickets,
      openTicketsSpecific,
      bugsReceivedOverall,
    };
  }, [rawTickets]);

  return {
    tickets: filteredTickets,
    rawTickets,
    isLoading,
    isFetching,
    error,
    metrics,
    uniqueFilters: {
      assignees: uniqueAssignees,
      statuses: uniqueStatuses,
      priorities: uniquePriorities,
      companies: uniqueCompanies,
      types: uniqueTypes,
      dependencies: uniqueDependencies,
    },
    queryKey: TICKET_QUERY_KEY,
  };
}