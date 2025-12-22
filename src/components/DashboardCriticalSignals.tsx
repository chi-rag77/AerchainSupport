"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket, Insight } from '@/types';
import { AlertCircle, Clock, Tag, Users, TrendingUp, ArrowRight, Info, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { differenceInDays, parseISO, differenceInHours, isPast, subDays } from 'date-fns';

interface DashboardCriticalSignalsProps {
  insights: Insight[];
  allTickets: Ticket[];
  onViewTicketDetails: (ticket: Ticket) => void;
}

// Re-implement the signal generation logic here to ensure consistency and access to all signals
const useOperationalSignals = (insights: Insight[], allTickets: Ticket[]) => {
  return useMemo(() => {
    const signals: any[] = [];
    const now = new Date();
    const last7DaysStart = subDays(now, 7);
    const prev7DaysStart = subDays(now, 14);

    const openTickets = allTickets.filter(t => 
      t.status.toLowerCase() !== 'resolved' && t.status.toLowerCase() !== 'closed'
    );

    // --- A. Map fetched insights (Stalled & High Volume) ---
    const stalledInsights = insights.filter(i => i.type === 'stalledOnTech').sort((a, b) => (b.daysStalled || 0) - (a.daysStalled || 0));
    const highVolumeInsights = insights.filter(i => i.type === 'highVolumeCustomer').sort((a, b) => (b.ticketCount || 0) - (a.ticketCount || 0));

    [...stalledInsights, ...highVolumeInsights].forEach(insight => {
      const status = insight.severity === 'critical' ? 'Critical' : insight.severity === 'warning' ? 'Watch' : 'Normal';
      const Icon = insight.type === 'stalledOnTech' ? Clock : Users;
      
      if (insight.type === 'stalledOnTech' && insight.ticketId && insight.daysStalled !== undefined) {
        const ticket = allTickets.find(t => t.id === insight.ticketId);
        if (ticket) {
          signals.push({
            id: insight.id,
            entity: `Ticket #${ticket.id}`,
            metric: `Stalled ${insight.daysStalled} days`,
            status: status,
            icon: Icon,
            change: insight.companyName,
            tooltip: insight.message,
            tickets: [ticket],
          });
        }
      } else if (insight.type === 'highVolumeCustomer' && insight.customerName && insight.ticketCount !== undefined) {
        const tickets = allTickets.filter(t => t.cf_company === insight.customerName && differenceInHours(now, parseISO(t.created_at)) <= 24);
        signals.push({
          id: insight.id,
          entity: insight.customerName,
          metric: `+${insight.ticketCount} tickets`,
          status: status,
          icon: Icon,
          change: 'Last 24h',
          tooltip: insight.message,
          tickets: tickets,
        });
      }
    });

    // --- B. Derived Signals ---

    // 1. Urgent Unassigned Signal
    const urgentUnassigned = openTickets.filter(t => 
      t.priority.toLowerCase() === 'urgent' && 
      (t.assignee === 'Unassigned' || !t.assignee)
    );
    if (urgentUnassigned.length > 0) {
      signals.push({
        id: 'urgent-unassigned',
        entity: 'Ownership Gap',
        metric: `${urgentUnassigned.length} urgent tickets`,
        status: 'Critical',
        icon: Tag,
        change: 'Unassigned',
        tooltip: `${urgentUnassigned.length} urgent tickets require immediate assignment to prevent breach.`,
        tickets: urgentUnassigned,
      });
    }

    // 2. Longest Open Ticket Signal
    const oldestTicket = openTickets.sort((a, b) => parseISO(a.created_at).getTime() - parseISO(b.created_at).getTime())[0];
    if (oldestTicket) {
      const daysOpen = differenceInDays(now, parseISO(oldestTicket.created_at));
      if (daysOpen >= 7) {
        signals.push({
          id: 'longest-open',
          entity: `Ticket #${oldestTicket.id}`,
          metric: `Open ${daysOpen} days`,
          status: daysOpen >= 14 ? 'Critical' : 'Watch',
          icon: Clock,
          change: oldestTicket.cf_company,
          tooltip: `The oldest open ticket is ${daysOpen} days old. Subject: ${oldestTicket.subject}`,
          tickets: [oldestTicket],
        });
      }
    }

    // 3. SLA Breach Forecast
    const nearBreachTickets = openTickets.filter(t => 
      t.due_by && differenceInHours(parseISO(t.due_by), now) <= 4 && !isPast(parseISO(t.due_by))
    );
    if (nearBreachTickets.length > 0) {
      signals.push({
        id: 'sla-forecast',
        entity: 'SLA Risk',
        metric: `${nearBreachTickets.length} tickets at risk`,
        status: nearBreachTickets.length >= 5 ? 'Critical' : 'Watch',
        icon: AlertCircle,
        change: 'Near Breach',
        tooltip: `${nearBreachTickets.length} tickets are due within the next 4 hours.`,
        tickets: nearBreachTickets,
      });
    }

    // 4. Week-over-Week Demand Change (Trend)
    const ticketsLast7Days = allTickets.filter(t => parseISO(t.created_at) >= last7DaysStart).length;
    const ticketsPrev7Days = allTickets.filter(t => parseISO(t.created_at) >= prev7DaysStart && parseISO(t.created_at) < last7DaysStart).length;
    
    let trendPct = 0;
    if (ticketsPrev7Days > 0) {
      trendPct = ((ticketsLast7Days - ticketsPrev7Days) / ticketsPrev7Days) * 100;
    } else if (ticketsLast7Days > 0) {
      trendPct = 100;
    }

    if (trendPct > 20) {
      signals.push({
        id: 'demand-surge',
        entity: 'Demand',
        metric: `Volume ↑ ${Math.abs(trendPct).toFixed(0)}% WoW`,
        status: 'Critical',
        icon: TrendingUp,
        change: 'Surge',
        tooltip: `Ticket volume has surged by ${Math.abs(trendPct).toFixed(0)}% this week compared to last week.`,
      });
    } else if (trendPct < -10) {
      signals.push({
        id: 'demand-drop',
        entity: 'Demand',
        metric: `Volume ↓ ${Math.abs(trendPct).toFixed(0)}% WoW`,
        status: 'Recovery',
        icon: TrendingUp,
        change: 'Drop',
        tooltip: `Ticket volume has dropped by ${Math.abs(trendPct).toFixed(0)}% this week. Investigate for potential customer disengagement.`,
      });
    }

    // Filter for Critical and Watch signals, then take the top 5
    const criticalSignals = signals.filter(s => s.status === 'Critical' || s.status === 'Watch');
    
    // Sort by Criticality (Critical > Watch) and then by urgency (e.g., days stalled/age)
    const statusOrder = { 'Critical': 3, 'Watch': 2, 'Recovery': 1, 'Normal': 0 };
    
    return criticalSignals.sort((a, b) => {
      const orderA = statusOrder[a.status];
      const orderB = statusOrder[b.status];
      if (orderA !== orderB) return orderB - orderA;
      
      // Secondary sort: prioritize higher days stalled/open
      const ageA = a.daysStalled || a.daysOpen || 0;
      const ageB = b.daysStalled || b.daysOpen || 0;
      return ageB - ageA;
    }).slice(0, 5);

  }, [insights, allTickets]);
};

const DashboardCriticalSignals = ({ insights, allTickets, onViewTicketDetails }: DashboardCriticalSignalsProps) => {
  const topSignals = useOperationalSignals(insights, allTickets);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Critical': return <Badge className="bg-red-500 text-white flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Critical</Badge>;
      case 'Watch': return <Badge className="bg-amber-500 text-black flex items-center gap-1"><Zap className="h-3 w-3" /> Watch</Badge>;
      case 'Recovery': return <Badge className="bg-blue-500 text-white flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Recovery</Badge>;
      default: return <Badge variant="secondary">Normal</Badge>;
    }
  };

  return (
    <Card className="shadow-lg h-full">
      <CardContent className="p-6">
        {topSignals.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <CheckCircle className="h-10 w-10 text-green-500 mb-3" />
            <p className="text-lg font-medium">No immediate critical signals detected.</p>
            <p className="text-sm">System is running smoothly.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {topSignals.map((signal, index) => (
              <li key={signal.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-border shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-center space-x-4">
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0",
                    signal.status === 'Critical' && 'bg-red-100 text-red-600',
                    signal.status === 'Watch' && 'bg-amber-100 text-amber-600',
                    signal.status === 'Recovery' && 'bg-blue-100 text-blue-600',
                  )}>
                    <signal.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                      {signal.entity}
                      {getStatusBadge(signal.status)}
                    </p>
                    <p className="text-lg font-bold text-foreground mt-0.5">{signal.metric}</p>
                    <p className="text-xs text-muted-foreground mt-1">{signal.tooltip}</p>
                  </div>
                </div>
                {signal.tickets && signal.tickets.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onViewTicketDetails(signal.tickets[0])} // View first ticket for context
                    className="flex items-center gap-1 text-blue-600 dark:text-blue-400"
                  >
                    View Ticket <ArrowRight className="h-3 w-3" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardCriticalSignals;