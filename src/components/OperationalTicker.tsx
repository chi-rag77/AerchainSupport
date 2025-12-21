"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Insight, Ticket } from '@/types';
import { AlertCircle, Clock, TrendingUp, CheckCircle, ArrowUp, ArrowDown, Users, Tag, Info, MessageSquare } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { formatDistanceToNowStrict, differenceInDays, parseISO } from 'date-fns';

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

  // --- 1. Map Insights to Signals ---
  const mappedSignals: SignalItem[] = useMemo(() => {
    const signals: SignalItem[] = [];
    const now = new Date();

    // A. Map fetched insights (Stalled & High Volume)
    insights.forEach(insight => {
      const status = insight.severity === 'critical' ? 'Critical' : insight.severity === 'warning' ? 'Watch' : 'Normal';
      const Icon = insight.type === 'stalledOnTech' ? Clock : Users;
      
      if (insight.type === 'stalledOnTech' && insight.ticketId && insight.daysStalled !== undefined) {
        const ticket = allTickets.find(t => t.id === insight.ticketId);
        if (ticket) {
          signals.push({
            id: insight.id,
            entity: `Ticket #${insight.ticketId}`,
            metric: `Stalled ${insight.daysStalled} days`,
            status: status,
            icon: Icon,
            change: insight.companyName,
            tooltip: insight.message,
            tickets: [ticket],
          });
        }
      } else if (insight.type === 'highVolumeCustomer' && insight.customerName && insight.ticketCount !== undefined) {
        const tickets = allTickets.filter(t => t.cf_company === insight.customerName && differenceInDays(now, parseISO(t.created_at)) <= 1);
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

    // B. Placeholder/Derived Signals (for variety and demonstration)
    
    // SLA Recovery Signal (Placeholder)
    signals.push({
      id: 'sla-recovery',
      entity: 'SLA Compliance',
      metric: '↑ 6% WoW',
      status: 'Recovery',
      icon: CheckCircle,
      change: 'vs last week',
      tooltip: 'Overall Resolution SLA compliance has improved by 6% compared to the previous week.',
    });

    // Urgent Unassigned Signal (Derived)
    const urgentUnassigned = allTickets.filter(t => 
      t.priority.toLowerCase() === 'urgent' && 
      (t.assignee === 'Unassigned' || !t.assignee) &&
      t.status.toLowerCase() !== 'resolved' && t.status.toLowerCase() !== 'closed'
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

    // Resolution Time Degradation (Placeholder)
    signals.push({
      id: 'res-time-degrade',
      entity: 'Resolution Time',
      metric: 'Median crossed 48h',
      status: 'Critical',
      icon: Clock,
      change: 'Slower',
      tooltip: 'Median resolution time has exceeded the 48-hour threshold this period.',
    });

    return signals;
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