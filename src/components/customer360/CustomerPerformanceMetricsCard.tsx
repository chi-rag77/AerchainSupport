"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket } from '@/types';
import { cn } from '@/lib/utils';
import { CheckCircle, Clock, AlertCircle, Timer, MessageSquare, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { differenceInDays, parseISO, isPast, isBefore, subDays } from 'date-fns';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface CustomerPerformanceMetricsCardProps {
  customerName: string;
  tickets: Ticket[];
}

const CustomerPerformanceMetricsCard = ({ customerName, tickets }: CustomerPerformanceMetricsCardProps) => {
  const metrics = useMemo(() => {
    if (!tickets || tickets.length === 0) {
      return {
        slaAdherence: { percentage: 0, met: 0, total: 0 },
        frSlaAdherence: { percentage: 0, met: 0, total: 0 },
        avgResolutionTime: { days: "N/A", count: 0 },
        resolutionTimeTrend: 0,
      };
    }

    const now = new Date();
    const last30DaysStart = subDays(now, 30);
    const prev30DaysStart = subDays(now, 60);

    // --- SLA Adherence (Resolution) ---
    let slaMetCount = 0;
    let slaTotalCount = 0;
    tickets.forEach(ticket => {
      if (ticket.due_by) {
        slaTotalCount++;
        const updatedAt = parseISO(ticket.updated_at);
        const dueBy = parseISO(ticket.due_by);
        if (isBefore(updatedAt, dueBy) || updatedAt.getTime() === dueBy.getTime()) {
          slaMetCount++;
        }
      }
    });
    const slaAdherencePercentage = slaTotalCount > 0 ? (slaMetCount / slaTotalCount) * 100 : 100;

    // --- First Response SLA Adherence ---
    let frSlaMetCount = 0;
    let frSlaTotalCount = 0;
    tickets.forEach(ticket => {
      if (ticket.fr_due_by) {
        frSlaTotalCount++;
        // This is a simplified check. A true FR SLA requires conversation data.
        // Here, we assume if the ticket was updated before FR due by, it implies FR was met.
        const updatedAt = parseISO(ticket.updated_at);
        const frDueBy = parseISO(ticket.fr_due_by);
        if (isBefore(updatedAt, frDueBy) || updatedAt.getTime() === frDueBy.getTime()) {
          frSlaMetCount++;
        }
      }
    });
    const frSlaAdherencePercentage = frSlaTotalCount > 0 ? (frSlaMetCount / frSlaTotalCount) * 100 : 100;

    // --- Average Resolution Time ---
    const resolvedTickets = tickets.filter(t => t.status.toLowerCase() === 'resolved' || t.status.toLowerCase() === 'closed');
    let totalResolutionDays = 0;
    resolvedTickets.forEach(ticket => {
      totalResolutionDays += differenceInDays(parseISO(ticket.updated_at), parseISO(ticket.created_at));
    });
    const avgResolutionTimeDays = resolvedTickets.length > 0 ? (totalResolutionDays / resolvedTickets.length).toFixed(1) : "N/A";

    // --- Resolution Time Trend (Last 30 days vs Previous 30 days) ---
    const resolvedLast30 = resolvedTickets.filter(t => parseISO(t.updated_at) >= last30DaysStart);
    const resolvedPrev30 = resolvedTickets.filter(t => parseISO(t.updated_at) >= prev30DaysStart && parseISO(t.updated_at) < last30DaysStart);

    let avgResTimeLast30 = 0;
    if (resolvedLast30.length > 0) {
      const totalDaysLast30 = resolvedLast30.reduce((sum, t) => sum + differenceInDays(parseISO(t.updated_at), parseISO(t.created_at)), 0);
      avgResTimeLast30 = totalDaysLast30 / resolvedLast30.length;
    }

    let avgResTimePrev30 = 0;
    if (resolvedPrev30.length > 0) {
      const totalDaysPrev30 = resolvedPrev30.reduce((sum, t) => sum + differenceInDays(parseISO(t.updated_at), parseISO(t.created_at)), 0);
      avgResTimePrev30 = totalDaysPrev30 / resolvedPrev30.length;
    }

    let resolutionTimeTrend = 0; // Positive means faster (good), negative means slower (bad)
    if (avgResTimePrev30 > 0) {
      resolutionTimeTrend = ((avgResTimePrev30 - avgResTimeLast30) / avgResTimePrev30) * 100;
    } else if (avgResTimeLast30 > 0) {
      resolutionTimeTrend = -100; // Was 0, now > 0 (infinitely slower)
    } else {
      resolutionTimeTrend = 0; // Both 0
    }

    return {
      slaAdherence: { percentage: parseFloat(slaAdherencePercentage.toFixed(1)), met: slaMetCount, total: slaTotalCount },
      frSlaAdherence: { percentage: parseFloat(frSlaAdherencePercentage.toFixed(1)), met: frSlaMetCount, total: frSlaTotalCount },
      avgResolutionTime: { days: avgResolutionTimeDays, count: resolvedTickets.length },
      resolutionTimeTrend: parseFloat(resolutionTimeTrend.toFixed(1)),
    };
  }, [tickets]);

  const getTrendColorClass = (trend: number) => {
    if (trend > 0) return "text-green-500"; // Faster is good
    if (trend < 0) return "text-red-500";   // Slower is bad
    return "text-gray-500";
  };
  const TrendIcon = metrics.resolutionTimeTrend > 0 ? ArrowUpRight : ArrowDownRight; // Up arrow for faster, down for slower

  return (
    <Card className="relative overflow-hidden group transition-all duration-300 hover:shadow-lg hover:scale-[1.02] h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-500" /> Performance Metrics
        </CardTitle>
        <Badge variant="secondary" className="text-sm font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {customerName}
        </Badge>
      </CardHeader>
      <CardContent className="text-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Resolution SLA Adherence */}
          <div className="flex flex-col p-3 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
            <span className="text-muted-foreground flex items-center gap-1 mb-1">
              <CheckCircle className="h-4 w-4 text-green-500" /> Resolution SLA Adherence:
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-foreground">{metrics.slaAdherence.percentage}%</span>
              <span className="text-xs text-muted-foreground">({metrics.slaAdherence.met}/{metrics.slaAdherence.total} met)</span>
            </div>
          </div>

          {/* First Response SLA Adherence */}
          <div className="flex flex-col p-3 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
            <span className="text-muted-foreground flex items-center gap-1 mb-1">
              <Timer className="h-4 w-4 text-purple-500" /> First Response SLA:
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-foreground">{metrics.frSlaAdherence.percentage}%</span>
              <span className="text-xs text-muted-foreground">({metrics.frSlaAdherence.met}/{metrics.frSlaAdherence.total} met)</span>
            </div>
          </div>

          {/* Average Resolution Time */}
          <div className="flex flex-col p-3 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
            <span className="text-muted-foreground flex items-center gap-1 mb-1">
              <Clock className="h-4 w-4 text-orange-500" /> Avg. Resolution Time:
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-foreground">{metrics.avgResolutionTime.days}</span>
              <span className="text-xs text-muted-foreground">days ({metrics.avgResolutionTime.count} tickets)</span>
            </div>
          </div>

          {/* Resolution Time Trend */}
          <div className="flex flex-col p-3 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
            <span className="text-muted-foreground flex items-center gap-1 mb-1">
              <TrendingUp className="h-4 w-4 text-indigo-500" /> Resolution Time Trend (30D):
            </span>
            <div className="flex items-baseline justify-between">
              <span className={cn("text-2xl font-bold flex items-center", getTrendColorClass(metrics.resolutionTimeTrend))}>
                {metrics.resolutionTimeTrend !== 0 && <TrendIcon className="h-5 w-5 mr-1" />}
                {Math.abs(metrics.resolutionTimeTrend)}%
              </span>
              <span className="text-xs text-muted-foreground">vs. prev 30 days</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerPerformanceMetricsCard;