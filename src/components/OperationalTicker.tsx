"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Insight, Ticket } from '@/types';
import { AlertCircle, Clock, TrendingUp, CheckCircle, ArrowUp, ArrowDown, Users, Tag, Info, MessageSquare } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatDistanceToNowStrict, differenceInDays, parseISO, isPast, differenceInHours } from 'date-fns';

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

    const openTickets = allTickets.filter(t => 
      t.status.toLowerCase() !== 'resolved' && t.status.toLowerCase() !== 'closed'
    );

    // --- A. Map fetched insights (Stalled & High Volume) ---
    insights.forEach(insight => {
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
        // Filter tickets relevant to this high volume insight (last 24h)
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

    // 4. Positive Signal: Low Open Backlog (Operational Momentum)
    if (openTickets.length <= 5) {
      signals.push({
        id: 'low-backlog',
        entity: 'Backlog',
        metric: `Only ${openTickets.length} open tickets`,
        status: 'Normal',
        icon: CheckCircle,
        change: 'Low Load',
        tooltip: 'The current active ticket backlog is minimal, indicating high operational efficiency.',
        tickets: openTickets,
      });
    }
    
    // 5. Placeholder: Resolution Effectiveness (Recovery/Degradation)
    // These remain placeholders as they require historical trend data not available in the single 'allTickets' array.
    signals.push({
      id: 'res-time-recovery',
      entity: 'Resolution Time',
      metric: 'Avg time ↓ 15% WoW',
      status: 'Recovery',
      icon: TrendingUp,
      change: 'Faster',
      tooltip: 'Average resolution time has decreased by 15% compared to the previous week.',
    });
    
    signals.push({
      id: 'res-time-degrade',
      entity: 'Resolution Time',
      metric: 'Median crossed 48h',
      status: 'Critical',
      icon: Clock,
      change: 'Slower',
      tooltip: 'Median resolution time has exceeded the 48-hour threshold this period.',
    });

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
          duration: tickerContent.length * 1.5, // Adjust speed based on number of items
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