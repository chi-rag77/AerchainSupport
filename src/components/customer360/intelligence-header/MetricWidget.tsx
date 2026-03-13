"use client";

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, Heart, Ticket, Timer } from 'lucide-react';
import HealthScorePopover from './HealthScorePopover';
import { CustomerIntelligenceData } from '@/features/customer360/types';

interface MetricWidgetProps {
  type: 'health' | 'activity' | 'sla';
  data: CustomerIntelligenceData;
}

const MetricWidget = ({ type, data }: MetricWidgetProps) => {
  const config = {
    health: {
      icon: Heart,
      title: "Customer Health",
      value: `${data.health_score} / 100`,
      subValue: data.status,
      info: <HealthScorePopover data={data} />,
      status: data.status,
    },
    activity: {
      icon: Ticket,
      title: "Support Activity",
      value: data.open_tickets,
      subValue: `Open Tickets`,
      trend: data.ticket_growth,
      info: <span className="text-xs text-muted-foreground">View ticket trends</span>,
    },
    sla: {
      icon: Timer,
      title: "SLA Risk",
      value: data.sla_risk,
      subValue: `${data.health_score_components.sla_adherence.score}% Adherence`,
      info: <span className="text-xs text-muted-foreground">View SLA analysis</span>,
      status: data.sla_risk,
    }
  }[type];

  const Icon = config.icon;
  const isGrowth = config.trend && config.trend.startsWith('+');
  const TrendIcon = isGrowth ? ArrowUp : ArrowDown;

  const getStatusColor = (status: string | undefined) => {
    if (!status) return "";
    const s = status.toLowerCase();
    if (s.includes('excellent') || s.includes('healthy') || s.includes('low')) return "text-green-600 dark:text-green-400";
    if (s.includes('watchlist') || s.includes('medium')) return "text-amber-600 dark:text-amber-400";
    if (s.includes('at risk') || s.includes('critical') || s.includes('high')) return "text-red-600 dark:text-red-400";
    return "";
  };

  return (
    <div className="p-6 rounded-2xl bg-gray-50/50 dark:bg-gray-800/30 border border-border/50 space-y-4">
      <div className="flex items-center gap-2">
        <Icon className={cn("h-4 w-4", getStatusColor(config.status))} />
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{config.title}</h4>
      </div>
      <div className="space-y-1">
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-black tracking-tighter text-foreground">{config.value}</p>
          {config.trend && (
            <span className={cn("flex items-center font-bold text-sm", isGrowth ? "text-red-500" : "text-green-500")}>
              <TrendIcon className="h-3 w-3 mr-0.5" /> {config.trend}
            </span>
          )}
        </div>
        <p className={cn("text-sm font-bold", getStatusColor(config.status))}>{config.subValue}</p>
      </div>
      {config.info}
    </div>
  );
};

export default MetricWidget;