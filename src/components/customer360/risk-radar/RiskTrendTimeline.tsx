"use client";

import React from 'react';
import { MonthlyRiskTrend } from '@/features/customer360/types';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface RiskTrendTimelineProps {
  timeline: MonthlyRiskTrend[];
}

const RiskTrendTimeline = ({ timeline }: RiskTrendTimelineProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Healthy': return 'bg-green-500';
      case 'Stable': return 'bg-amber-500';
      case 'At Risk': return 'bg-orange-500';
      case 'Critical': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Customer Risk Trend</h4>
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-900/50 border border-border/50">
        {timeline.map((item, idx) => (
          <React.Fragment key={item.month}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center gap-2 cursor-default group">
                  <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground group-hover:text-foreground transition-colors">
                    {item.label}
                  </span>
                  <div className={cn(
                    "h-3 w-3 rounded-full shadow-sm transition-transform group-hover:scale-125",
                    getStatusColor(item.status)
                  )} />
                  <span className="text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.status}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-bold">Score: {item.score}</p>
              </TooltipContent>
            </Tooltip>
            {idx < timeline.length - 1 && (
              <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800 mt-4" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default RiskTrendTimeline;