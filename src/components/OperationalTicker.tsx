"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Insight, Ticket } from '@/types';
import { AlertCircle, Clock, TrendingUp, CheckCircle, ArrowUp, ArrowDown, Users, Tag, Info, MessageSquare, Zap } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatDistanceToNowStrict, differenceInDays, parseISO, isPast, differenceInHours, subDays } from 'date-fns';

// Define the structure for a single signal item
interface SignalItem {
  id: string;
  entity: string;
  metric: string;
  status: 'Normal' | 'Watch' | 'Critical' | 'Recovery';
  icon: React.ElementType;
  change?: string; // e.g., "+5 tickets" or "↓ 18%"
  tooltip: string;
  link?: string;
  tickets?: Ticket[]; // Optional tickets for drilldown
}

interface OperationalTickerProps {
  insights: Insight[];
  allTickets: Ticket[];
  onSignalClick: (title: string, description: string, tickets: Ticket[]) => void;
}

const statusColors = {
  Normal: { dot: 'bg-green-500', text: 'text-green-600 dark:text-green-400', icon: CheckCircle },
  Watch: { dot: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400', icon: AlertCircle },
  Critical: { dot: 'bg-red-500', text: 'text-red-600 dark:text-red-400', icon: AlertCircle },
  Recovery: { dot: 'bg-blue-500', text: 'text-blue-600 dark:text-blue-400', icon: TrendingUp },
};

const OperationalTicker = ({ insights, allTickets, onSignalClick }: OperationalTickerProps) => {
  const [isHovered, setIsHovered] = useState(false);

  // --- 1. Map Insights and Derive New Signals ---
  const mappedSignals: SignalItem[] = useMemo(() => {
    const signals: SignalItem[] = [];
    const now = new Date();
    const yesterday = subDays(now, 1);
    const last7DaysStart = subDays(now, 7);
    const prev7DaysStart = subDays(now, 14);

    const openTickets = allTickets.filter(t => 
      t.status.toLowerCase() !== 'resolved' && t.status.toLowerCase() !== 'closed'
    );

    // --- A. Map fetched insights (Stalled & High Volume) ---
    const stalledInsights = insights.filter(i => i.type === 'stalledOnTech').sort((a, b) => (b.daysStalled || 0) - (a.daysStalled || 0));
    const highVolumeInsights = insights.filter(i => i.type === 'highVolumeCustomer').sort((a, b) => (b.ticketCount || 0) - (a.ticketCount || 0));

    // Limit high-volume insights to top 5
    [...stalledInsights.slice(0, 5), ...highVolumeInsights.slice(0, 5)].forEach(insight => {
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

    // --- B. Derived Signals (Calculated from raw data) ---

    // 1. Urgent Unassigned Signal (Ownership Gaps)
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

    // 2. Longest Open Ticket Signal (Aging & Staleness)
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

    // 3. SLA Breach Forecast (Risk Signals)
    const nearBreachTickets = openTickets.filter(t => 
      t.due_by && differenceInHours(parseISO(t.due_by), now) <= 4 && !isPast(parseISO(t.due_by)) // Due within 4 hours
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

    // 4. Week-over-Week Demand Change (Placeholder Trend)
    // This requires comparing ticket creation counts between last 7 days and previous 7 days.
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

    // 5. Ticket Creation Velocity (Spike/Surge - Simple daily check)
    const ticketsToday = allTickets.filter(t => differenceInDays(now, parseISO(t.created_at)) === 0).length;
    const avgDaily = allTickets.length / differenceInDays(now, parseISO(allTickets[allTickets.length - 1]?.created_at || now));
    
    if (ticketsToday > avgDaily * 1.5 && ticketsToday > 10) { // 50% higher than average and > 10 tickets
      signals.push({
        id: 'daily-spike',
        entity: 'Velocity',
        metric: `+${ticketsToday} tickets today`,
        status: 'Watch',
        icon: Zap,
        change: 'Spike',
        tooltip: `Ticket creation velocity is significantly higher today (${ticketsToday} tickets) than the average daily rate (${avgDaily.toFixed(1)}).`,
      });
    }

    // Ensure critical signals appear first
    const statusOrder = { 'Critical': 3, 'Watch': 2, 'Recovery': 1, 'Normal': 0 };
    return signals.sort((a, b) => statusOrder[b.status] - statusOrder[a.status]);

  }, [insights, allTickets]);

  // --- 2. Ticker Animation Logic ---
  const tickerContent = useMemo(() => {
    // Duplicate content to ensure seamless loop
    return [...mappedSignals, ...mappedSignals];
  }, [mappedSignals]);

  const containerVariants = {
    animate: {
      x: ['0%', '-100%'],
      transition: {
        x: {
          repeat: Infinity,
          duration: mappedSignals.length * 1.5, // Adjust speed based on number of items
          ease: 'linear',
        },
      },
    },
    paused: {
      x: '0%', // Keep it simple, just stop movement
      transition: {
        x: {
          duration: 0,
        },
      },
    },
  };

  if (mappedSignals.length === 0) {
    return (
      <Card className="p-4 shadow-lg border-l-4 border-blue-500 dark:border-blue-400">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <Info className="h-5 w-5 flex-shrink-0" />
          <span className="font-semibold">Operational Pulse:</span>
          No critical signals detected. Support system is running smoothly.
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className="p-2 shadow-lg border-none overflow-hidden bg-card/80 backdrop-blur-sm"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-4 text-sm font-medium text-foreground flex-shrink-0">
        <span className="flex items-center gap-2 text-lg font-bold text-blue-600 dark:text-blue-400 flex-shrink-0">
          <TrendingUp className="h-6 w-6" /> Operational Pulse:
        </span>
      </div>
      <div className="relative w-full overflow-hidden h-8">
        <motion.div
          className="absolute flex h-full"
          variants={containerVariants}
          animate={isHovered ? 'paused' : 'animate'}
        >
          {tickerContent.map((signal, index) => {
            const { dot, text, icon: StatusIcon } = statusColors[signal.status];
            const IconComponent = signal.icon;

            return (
              <Tooltip key={index} delayDuration={100}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "flex items-center space-x-2 px-4 py-1 mx-2 rounded-full transition-colors duration-150 flex-shrink-0 h-full",
                      "bg-gray-100/50 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-600",
                      signal.status === 'Critical' && 'border border-red-300 dark:border-red-700',
                      signal.status === 'Watch' && 'border border-amber-300 dark:border-amber-700',
                    )}
                    style={{ minWidth: '250px' }}
                    onClick={() => signal.tickets && onSignalClick(
                      `${signal.entity} - ${signal.metric}`,
                      signal.tooltip,
                      signal.tickets
                    )}
                  >
                    {/* Status Dot */}
                    <span className={cn("h-2 w-2 rounded-full", dot)} />
                    
                    {/* Entity & Metric */}
                    <span className="font-semibold text-foreground truncate max-w-[100px]">{signal.entity}:</span>
                    
                    {/* Change/Value */}
                    <span className={cn("font-medium", text)}>{signal.metric}</span>
                    
                    {/* Status Badge */}
                    <span className={cn("text-xs font-bold flex items-center gap-1", text)}>
                      <StatusIcon className="h-3 w-3" />
                      {signal.status}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="font-semibold mb-1 flex items-center gap-2">
                    <IconComponent className="h-4 w-4" /> {signal.entity} Signal
                  </p>
                  <p>{signal.tooltip}</p>
                  {signal.tickets && signal.tickets.length > 0 && (
                    <p className="mt-2 text-blue-400">Click to view {signal.tickets.length} related tickets.</p>
                  )}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </motion.div>
      </div>
    </Card>
  );
};

export default OperationalTicker;