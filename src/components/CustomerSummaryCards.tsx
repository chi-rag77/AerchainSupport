"use client";

import React, { useMemo } from 'react';
import DashboardMetricCard from "@/components/DashboardMetricCard";
import { Ticket } from '@/types';
import { TicketIcon, Hourglass, CheckCircle, Clock } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';

interface CustomerSummaryCardsProps {
  tickets: Ticket[];
}

const CustomerSummaryCards = ({ tickets }: CustomerSummaryCardsProps) => {
  const metrics = useMemo(() => {
    if (!tickets || tickets.length === 0) {
      return {
        totalTickets: 0,
        openTickets: 0,
        resolvedTickets: 0,
        avgResolutionTime: "N/A",
      };
    }

    const totalTickets = tickets.length;
    const openTickets = tickets.filter(t =>
      t.status.toLowerCase() === 'open (being processed)' ||
      t.status.toLowerCase() === 'pending (awaiting your reply)' ||
      t.status.toLowerCase() === 'waiting on customer' ||
      t.status.toLowerCase() === 'on tech' ||
      t.status.toLowerCase() === 'on product' ||
      t.status.toLowerCase() === 'escalated'
    ).length;

    const resolvedOrClosedTickets = tickets.filter(t =>
      t.status.toLowerCase() === 'resolved' || t.status.toLowerCase() === 'closed'
    );
    const resolvedTickets = resolvedOrClosedTickets.length;

    let totalResolutionDays = 0;
    resolvedOrClosedTickets.forEach(ticket => {
      if (ticket.created_at && ticket.updated_at) {
        const created = parseISO(ticket.created_at);
        const updated = parseISO(ticket.updated_at);
        totalResolutionDays += differenceInDays(updated, created);
      }
    });

    const avgResolutionTime = resolvedTickets > 0
      ? `${(totalResolutionDays / resolvedTickets).toFixed(1)} days`
      : "N/A";

    return {
      totalTickets,
      openTickets,
      resolvedTickets,
      avgResolutionTime,
    };
  }, [tickets]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <DashboardMetricCard
        title="Total Tickets"
        value={metrics.totalTickets}
        icon={TicketIcon}
        description="All tickets created by this customer."
      />
      <DashboardMetricCard
        title="Open Tickets"
        value={metrics.openTickets}
        icon={Hourglass}
        description="Tickets currently active for this customer."
      />
      <DashboardMetricCard
        title="Resolved Tickets"
        value={metrics.resolvedTickets}
        icon={CheckCircle}
        description="Tickets successfully resolved for this customer."
      />
      <DashboardMetricCard
        title="Avg. Resolution Time"
        value={metrics.avgResolutionTime}
        icon={Clock}
        description="Average time to resolve tickets for this customer."
      />
    </div>
  );
};

export default CustomerSummaryCards;