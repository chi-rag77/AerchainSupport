"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { Heart, Ticket, Timer } from 'lucide-react';
import HealthScorePopover from './HealthScorePopover';
import { CustomerIntelligenceData } from '@/features/customer360/types';
import { Progress } from '@/components/ui/progress';

interface MetricWidgetProps {
  type: 'health' | 'activity' | 'sla';
  data: CustomerIntelligenceData;
}

const MetricWidget = ({ type, data }: MetricWidgetProps) => {
  if (!data) return null;

  const config = {
    health: {
      icon: Heart,
      title: "CUSTOMER HEALTH",
      value: data.health_score,
      subValue: data.status,
      info: data.health_score_components ? <HealthScorePopover data={data} /> : null,
      status: data.status,
    },
    activity: {
      icon: Ticket,
      title: "SUPPORT ACTIVITY",
      value: data.open_tickets,
      subValue: `Open tickets`,
      trend: data.ticket_growth,
    },
    sla: {
      icon: Timer,
      title: "SLA ADHERENCE",
      value: data.sla_risk,
      subValue: data.health_score_components ? `${data.health_score_components.sla_adherence.score}% adherence` : 'N/A',
      status: data.sla_risk,
    }
  }[type];

  const getStatusColor = (status: string | undefined) => {
    if (!status) return "text-muted-foreground";
    const s = status.toLowerCase();
    if (s.includes('excellent') || s.includes('healthy') || s.includes('low')) return "text-emerald-600";
    if (s.includes('watchlist') || s.includes('medium')) return "text-amber-600";
    if (s.includes('at risk') || s.includes('critical') || s.includes('high')) return "text-rose-600";
    return "text-muted-foreground";
  };

  const getRingColor = (score: number) => {
    if (score < 50) return "text-rose-500";
    if (score < 75) return "text-amber-500";
    return "text-emerald-500";
  };

  return (
    <div className="p-6 rounded-[24px] bg-white dark:bg-gray-900 border border-border/50 shadow-sm flex flex-col h-full transition-all hover:shadow-md group">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">{config.title}</h4>
        <div className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 group-hover:bg-indigo-50 transition-colors">
          <config.icon className={cn("h-4 w-4 transition-colors", getStatusColor(config.status))} />
        </div>
      </div>

      <div className="flex items-center justify-between flex-1">
        <div className="space-y-1">
          <div className="flex items-baseline gap-1.5">
            <p className="text-4xl font-medium tracking-tighter text-foreground">
              {config.value}
              {type === 'health' && <span className="text-lg text-muted-foreground/30 ml-0.5">/100</span>}
            </p>
            {config.trend && (
              <span className={cn("text-xs font-black flex items-center gap-0.5", config.trend.startsWith('+') ? "text-rose-600" : "text-emerald-600")}>
                {config.trend.startsWith('+') ? '↑' : '↓'} {config.trend.replace(/[+-]/, '')}
              </span>
            )}
          </div>
          <p className={cn("text-xs font-bold uppercase tracking-widest", getStatusColor(config.status))}>{config.subValue}</p>
        </div>

        {type === 'health' && (
          <div className="relative h-16 w-16">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-100 dark:text-gray-800" />
              <circle 
                cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="3" 
                strokeDasharray={`${data.health_score}, 100`}
                className={getRingColor(data.health_score)}
                strokeLinecap="round"
              />
            </svg>
          </div>
        )}
      </div>

      {type === 'sla' && (
        <div className="mt-4 space-y-1.5">
          <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-amber-500 rounded-full transition-all duration-1000" 
              style={{ width: `${data.health_score_components?.sla_adherence.score || 0}%` }} 
            />
          </div>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-50 dark:border-gray-800">
        {config.info || (
          <button className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-indigo-600 transition-colors flex items-center gap-1.5">
            View Details <ChevronDown className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
};

import { ChevronDown } from 'lucide-react';
export default MetricWidget;