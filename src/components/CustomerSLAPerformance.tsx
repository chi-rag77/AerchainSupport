"use client";

import React, { useMemo } from 'react';
import DashboardMetricCard from "@/components/DashboardMetricCard";
import { Ticket } from '@/types';
import { CheckCircle, XCircle, Clock, Percent } from 'lucide-react';
import { differenceInDays, parseISO, isPast } from 'date-fns';

interface CustomerSLAPerformanceProps {
  tickets: Ticket[];
}

const CustomerSLAPerformance = ({ tickets }: CustomerSLAPerformanceProps) => {
  const metrics = useMemo(() => {
    if (!tickets || tickets.length === 0) {
      return {
        avgResolutionTime: "N/A",
        slaMetRate: "N/A",
        slaBreachedRate: "N/A",
      };
    }

    const resolvedOrClosedTickets = tickets.filter(t =>
      t.status.toLowerCase() === 'resolved' || t.status.toLowerCase() === 'closed'
    );

    let totalResolutionDays = 0;
    let slaMetCount = 0;
    let slaBreachedCount = 0;

    resolvedOrClosedTickets.forEach(ticket => {
      const createdAt = parseISO(ticket.created_at);
      const updatedAt = parseISO(ticket.updated_at);
      const dueBy = ticket.due_by ? parseISO(ticket.due_by) : null;

      totalResolutionDays += differenceInDays(updatedAt, createdAt);

      if (dueBy) {
        if (updatedAt <= dueBy) {
          slaMetCount++;
        } else {
          slaBreachedCount++;
        }
      }
    });

    const avgResolutionTime = resolvedOrClosedTickets.length > 0
      ? `${(totalResolutionDays / resolvedOrClosedTickets.length).toFixed(1)} days`
      : "N/A";

    const totalSLAApplicable = slaMetCount + slaBreachedCount;
    const slaMetRate = totalSLAApplicable > 0
      ? `${((slaMetCount / totalSLAApplicable) * 100).toFixed(1)}%`
      : "N/A";
    const slaBreachedRate = totalSLAApplicable > 0
      ? `${((slaBreachedCount / totalSLAApplicable) * 100).toFixed(1)}%`
      : "N/A";

    return {
      avgResolutionTime,
      slaMetRate,
      slaBreachedRate,
    };
  }, [tickets]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <DashboardMetricCard
        title="Avg. Resolution Time"
        value={metrics.avgResolutionTime}
        icon={Clock}
        description="Average time to resolve tickets for this customer."
      />
      <DashboardMetricCard
        title="SLA Met Rate"
        value={metrics.slaMetRate}
        icon={CheckCircle}
        description="Percentage of tickets resolved within SLA for this customer."
      />
      <DashboardMetricCard
        title="SLA Breached Rate"
        value={metrics.slaBreachedRate}
        icon={XCircle}
        description="Percentage of tickets that breached SLA for this customer."
      />
    </div>
  );
};

export default CustomerSLAPerformance;