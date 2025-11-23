"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket } from '@/types';
import { cn } from '@/lib/utils';
import { TicketIcon, Clock, CheckCircle, AlertCircle, Hourglass, Users, Tag, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { differenceInDays, parseISO, subDays, isPast } from 'date-fns';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface CustomerOverviewCardProps {
  customerName: string;
  tickets: Ticket[];
}

const CustomerOverviewCard = ({ customerName, tickets }: CustomerOverviewCardProps) => {
  const metrics = useMemo(() => {
    if (!tickets || tickets.length === 0) {
      return {
        totalTicketsLast30: 0,
        totalTicketsLast90: 0,
        ticketVolumeTrend: 0,
        openTicketsCount: 0,
        openTicketsBreakdown: { urgent: 0, high: 0, medium: 0, low: 0, other: 0 },
      };
    }

    const now = new Date();
    const last30DaysStart = subDays(now, 30);
    const last90DaysStart = subDays(now, 90);
    const prev30DaysStart = subDays(now, 60); // For trend calculation

    const ticketsLast30 = tickets.filter(t => parseISO(t.created_at) >= last30DaysStart);
    const ticketsLast90 = tickets.filter(t => parseISO(t.created_at) >= last90DaysStart);
    const ticketsPrev30 = tickets.filter(t => parseISO(t.created_at) >= prev30DaysStart && parseISO(t.created_at) < last30DaysStart);

    let ticketVolumeTrend = 0;
    if (ticketsPrev30.length > 0) {
      ticketVolumeTrend = ((ticketsLast30.length - ticketsPrev30.length) / ticketsPrev30.length) * 100;
    } else if (ticketsLast30.length > 0) {
      ticketVolumeTrend = 100; // All new tickets in current period
    }

    const openTickets = tickets.filter(t =>
      t.status.toLowerCase() !== 'resolved' && t.status.toLowerCase() !== 'closed'
    );
    const openTicketsCount = openTickets.length;

    const openTicketsBreakdown = { urgent: 0, high: 0, medium: 0, low: 0, other: 0 };
    openTickets.forEach(ticket => {
      const priorityLower = ticket.priority.toLowerCase();
      if (priorityLower === 'urgent') openTicketsBreakdown.urgent++;
      else if (priorityLower === 'high') openTicketsBreakdown.high++;
      else if (priorityLower === 'medium') openTicketsBreakdown.medium++;
      else if (priorityLower === 'low') openTicketsBreakdown.low++;
      else openTicketsBreakdown.other++;
    });

    return {
      totalTicketsLast30: ticketsLast30.length,
      totalTicketsLast90: ticketsLast90.length,
      ticketVolumeTrend: parseFloat(ticketVolumeTrend.toFixed(1)),
      openTicketsCount,
      openTicketsBreakdown,
    };
  }, [tickets]);

  // Placeholder for Customer Tier (would come from a custom field or external data)
  const customerTier = "Gold"; 

  const trendColorClass = metrics.ticketVolumeTrend > 0 ? "text-red-500" : metrics.ticketVolumeTrend < 0 ? "text-green-500" : "text-gray-500";
  const TrendIcon = metrics.ticketVolumeTrend > 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <Card className="relative overflow-hidden group transition-all duration-300 hover:shadow-lg hover:scale-[1.02] h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
          {customerName}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            Tier: {customerTier}
          </Badge>
          <Users className="h-6 w-6 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="text-sm space-y-3">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <div className="flex flex-col">
            <span className="text-muted-foreground flex items-center gap-1"><TicketIcon className="h-4 w-4" /> Total Tickets (30D):</span>
            <span className="text-xl font-bold text-foreground">{metrics.totalTicketsLast30}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground flex items-center gap-1"><TicketIcon className="h-4 w-4" /> Total Tickets (90D):</span>
            <span className="text-xl font-bold text-foreground">{metrics.totalTicketsLast90}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground flex items-center gap-1"><TrendingUp className="h-4 w-4" /> Volume Trend (30D):</span>
            <span className={cn("text-xl font-bold flex items-center", trendColorClass)}>
              {metrics.ticketVolumeTrend !== 0 && <TrendIcon className="h-5 w-5 mr-1" />}
              {metrics.ticketVolumeTrend}%
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground flex items-center gap-1"><Hourglass className="h-4 w-4 text-blue-500" /> Current Open Tickets:</span>
            <span className="text-xl font-bold text-foreground">{metrics.openTicketsCount}</span>
          </div>
        </div>

        {metrics.openTicketsCount > 0 && (
          <div className="mt-4 pt-3 border-t border-border">
            <h4 className="font-semibold text-foreground mb-2">Open Tickets Breakdown:</h4>
            <div className="flex flex-wrap gap-2 text-xs">
              {metrics.openTicketsBreakdown.urgent > 0 && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> Urgent: {metrics.openTicketsBreakdown.urgent}
                </Badge>
              )}
              {metrics.openTicketsBreakdown.high > 0 && (
                <Badge className="bg-orange-500 text-white flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> High: {metrics.openTicketsBreakdown.high}
                </Badge>
              )}
              {metrics.openTicketsBreakdown.medium > 0 && (
                <Badge className="bg-yellow-500 text-black flex items-center gap-1">
                  <Hourglass className="h-3 w-3" /> Medium: {metrics.openTicketsBreakdown.medium}
                </Badge>
              )}
              {metrics.openTicketsBreakdown.low > 0 && (
                <Badge className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Low: {metrics.openTicketsBreakdown.low}
                </Badge>
              )}
              {metrics.openTicketsBreakdown.other > 0 && (
                <Badge className="bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200 flex items-center gap-1">
                  <Tag className="h-3 w-3" /> Other: {metrics.openTicketsBreakdown.other}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerOverviewCard;