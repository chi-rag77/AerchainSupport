"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket } from '@/types';
import { cn } from '@/lib/utils';
import { TicketIcon, Hourglass, Users, ArrowUpRight, ArrowDownRight, TrendingUp, AlertCircle, Clock, Tag } from 'lucide-react';
import { parseISO, subDays } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface CustomerOverviewCardProps {
  customerName: string;
  tickets: Ticket[];
}

const CustomerOverviewCard = ({ customerName, tickets }: CustomerOverviewCardProps) => {
  const metrics = useMemo(() => {
    if (!tickets || tickets.length === 0) return null;

    const now = new Date();
    const last30DaysStart = subDays(now, 30);
    const prev30DaysStart = subDays(now, 60);

    const ticketsLast30 = tickets.filter(t => parseISO(t.created_at) >= last30DaysStart);
    const ticketsPrev30 = tickets.filter(t => parseISO(t.created_at) >= prev30DaysStart && parseISO(t.created_at) < last30DaysStart);

    let trend = 0;
    if (ticketsPrev30.length > 0) {
      trend = ((ticketsLast30.length - ticketsPrev30.length) / ticketsPrev30.length) * 100;
    }

    const openTickets = tickets.filter(t => !['resolved', 'closed'].includes(t.status.toLowerCase()));
    
    const breakdown = { urgent: 0, high: 0, medium: 0, low: 0 };
    openTickets.forEach(t => {
      const p = t.priority.toLowerCase();
      if (p === 'urgent') breakdown.urgent++;
      else if (p === 'high') breakdown.high++;
      else if (p === 'medium') breakdown.medium++;
      else breakdown.low++;
    });

    return {
      total30: ticketsLast30.length,
      trend: parseFloat(trend.toFixed(1)),
      openCount: openTickets.length,
      breakdown
    };
  }, [tickets]);

  if (!metrics) return null;

  return (
    <Card className="relative overflow-hidden rounded-[24px] border-none bg-white dark:bg-gray-800 shadow-glass group">
      <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-xl font-black tracking-tight">Account Snapshot</CardTitle>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Volume & Priority</p>
          </div>
        </div>
        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-none font-black text-[10px] uppercase tracking-widest px-3 py-1">
          Gold Tier
        </Badge>
      </CardHeader>

      <CardContent className="p-8 pt-0 space-y-8">
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tickets (30D)</span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black tracking-tighter">{metrics.total30}</span>
              <div className={cn(
                "flex items-center text-xs font-bold",
                metrics.trend > 0 ? "text-red-500" : "text-green-500"
              )}>
                {metrics.trend > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {Math.abs(metrics.trend)}%
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active Backlog</span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black tracking-tighter text-indigo-600">{metrics.openCount}</span>
              <span className="text-xs font-bold text-muted-foreground">Open</span>
            </div>
          </div>
        </div>

        <Separator className="opacity-50" />

        <div className="space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Priority Distribution (Open)</h4>
          <div className="flex flex-wrap gap-3">
            {metrics.breakdown.urgent > 0 && (
              <Badge className="bg-red-50 text-red-700 border-red-100 font-bold gap-1.5 px-3 py-1.5 rounded-xl">
                <AlertCircle className="h-3.5 w-3.5" /> Urgent: {metrics.breakdown.urgent}
              </Badge>
            )}
            {metrics.breakdown.high > 0 && (
              <Badge className="bg-orange-50 text-orange-700 border-orange-100 font-bold gap-1.5 px-3 py-1.5 rounded-xl">
                <AlertCircle className="h-3.5 w-3.5" /> High: {metrics.breakdown.high}
              </Badge>
            )}
            <Badge variant="outline" className="font-bold gap-1.5 px-3 py-1.5 rounded-xl border-2">
              <Clock className="h-3.5 w-3.5" /> Medium: {metrics.breakdown.medium}
            </Badge>
            <Badge variant="outline" className="font-bold gap-1.5 px-3 py-1.5 rounded-xl border-2">
              <Tag className="h-3.5 w-3.5" /> Low: {metrics.breakdown.low}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerOverviewCard;