"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { 
  Activity, Circle, Triangle, AlertTriangle, ListFilter,
  TrendingUp, TrendingDown, Minus
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from '@/components/ui/badge';

interface DailyData {
  day: string;
  created: number;
  resolved: number;
  sla_risk: 'low' | 'medium' | 'high';
  trend: 'normal' | 'spike' | 'drop';
}

interface BehavioralTimelineProps {
  data: DailyData[];
  summary: string;
  mode?: 'summary' | 'ai';
}

const BehavioralTimeline = ({ data, summary, mode = 'summary' }: BehavioralTimelineProps) => {
  // Calculate max value for bar scaling
  const maxVal = useMemo(() => {
    return Math.max(...data.map(d => Math.max(d.created, d.resolved)), 1);
  }, [data]);

  const getMarker = (item: DailyData) => {
    if (item.sla_risk === 'high') return <AlertTriangle className="h-5 w-5 text-rose-500 animate-pulse" />;
    if (item.trend === 'spike') return <Triangle className="h-5 w-5 fill-rose-500 text-rose-500" />;
    if (item.trend === 'drop') return <Triangle className="h-5 w-5 fill-amber-500 text-amber-500 rotate-180" />;
    return <Circle className="h-4 w-4 fill-indigo-600 text-indigo-600" />;
  };

  const getDeltaInfo = (item: DailyData) => {
    const delta = item.created - item.resolved;
    if (delta > 0) {
      return {
        label: `+${delta} backlog`,
        color: delta > 5 ? "text-rose-600" : "text-amber-600",
        icon: TrendingUp
      };
    } else if (delta < 0) {
      return {
        label: `${delta} cleared`,
        color: "text-green-600",
        icon: TrendingDown
      };
    }
    return {
      label: "balanced",
      color: "text-muted-foreground",
      icon: Minus
    };
  };

  return (
    <Card className="border-none shadow-glass rounded-[32px] bg-white dark:bg-gray-900 overflow-hidden h-full flex flex-col">
      <CardHeader className="p-8 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
              <Activity className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <CardTitle className="text-xl font-black tracking-tight">Behavioral Timeline</CardTitle>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
              <span className="text-[9px] font-bold text-muted-foreground uppercase">Inflow</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
              <span className="text-[9px] font-bold text-muted-foreground uppercase">Outflow</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-8 pt-6 flex-1 flex flex-col">
        <div className="relative mb-12">
          <div className="absolute top-1/2 left-0 w-full h-px bg-gray-100 dark:bg-gray-800 -translate-y-1/2 z-0" />
          
          <div className="relative z-10 flex justify-between items-center">
            {data?.map((item, i) => {
              const delta = getDeltaInfo(item);
              const DeltaIcon = delta.icon;

              return (
                <div key={item.day} className="flex flex-col items-center gap-6 flex-1">
                  <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                    {item.day}
                  </span>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.1, type: "spring" }}
                        className="cursor-pointer hover:scale-125 transition-transform"
                      >
                        {getMarker(item)}
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent className="p-4 rounded-2xl shadow-2xl border-none bg-white dark:bg-gray-900">
                      <div className="space-y-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">{item.day} Detailed Activity</p>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center gap-8">
                            <span className="text-xs font-bold text-muted-foreground">Tickets Created</span>
                            <span className="text-sm font-black">{item.created}</span>
                          </div>
                          <div className="flex justify-between items-center gap-8">
                            <span className="text-xs font-bold text-muted-foreground">Tickets Resolved</span>
                            <span className="text-sm font-black text-green-600">{item.resolved}</span>
                          </div>
                        </div>
                        <Separator className="opacity-50" />
                        <div className={cn("flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest", delta.color)}>
                          <DeltaIcon className="h-3 w-3" />
                          {delta.label}
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>

                  {/* Visual Micro-Bars */}
                  <div className="w-full px-4 space-y-1.5">
                    <div className="h-1.5 w-full bg-gray-50 dark:bg-gray-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.created / maxVal) * 100}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className="h-full bg-indigo-600 rounded-full"
                      />
                    </div>
                    <div className="h-1.5 w-full bg-gray-50 dark:bg-gray-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.resolved / maxVal) * 100}%` }}
                        transition={{ duration: 1, delay: i * 0.1 + 0.2 }}
                        className="h-full bg-green-500 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Delta Intelligence Label */}
                  <div className={cn("flex items-center gap-1 font-black text-[9px] uppercase tracking-tighter", delta.color)}>
                    <DeltaIcon className="h-2.5 w-2.5" />
                    {delta.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Deterministic Summary Layer - Pushed to bottom */}
        <div className="mt-auto p-5 rounded-[24px] bg-gray-50 dark:bg-gray-900/50 border border-border space-y-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ListFilter className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Activity Summary</span>
          </div>
          <p className={cn(
            "text-sm font-bold leading-relaxed text-foreground/80",
            mode === 'summary' && "line-clamp-2"
          )}>
            {summary}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

import { Separator } from '@/components/ui/separator';
export default BehavioralTimeline;