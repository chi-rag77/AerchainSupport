"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { 
  Activity, Circle, Triangle, AlertTriangle, ListFilter,
  TrendingUp, TrendingDown, Minus, ArrowDownLeft, ArrowUpRight
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
        label: `${Math.abs(delta)} cleared`,
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
        <div className="relative mb-8">
          <div className="absolute top-[44px] left-0 w-full h-px bg-gray-100 dark:bg-gray-800 z-0" />
          
          <div className="relative z-10 flex justify-between items-start">
            {data?.map((item, i) => {
              const delta = getDeltaInfo(item);
              const DeltaIcon = delta.icon;

              return (
                <div key={item.day} className="flex flex-col items-center gap-4 flex-1">
                  <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                    {item.day}
                  </span>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.1, type: "spring" }}
                        className="cursor-pointer hover:scale-125 transition-transform z-10 bg-white dark:bg-gray-900 p-1 rounded-full"
                      >
                        {getMarker(item)}
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent className="p-4 rounded-2xl shadow-2xl border-none bg-white dark:bg-gray-900">
                      <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-1">{item.day} Status</p>
                      <p className="text-xs font-bold">SLA Risk: {item.sla_risk.toUpperCase()}</p>
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

                  {/* Daily Performance Matrix (Fills the blank space) */}
                  <div className="mt-4 w-full px-2 space-y-2">
                    <div className="flex flex-col items-center py-2 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 border border-border/30 group hover:border-indigo-200 transition-colors">
                      <span className="text-xs font-black text-indigo-600">{item.created}</span>
                      <span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground/60">Created</span>
                    </div>
                    <div className="flex flex-col items-center py-2 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 border border-border/30 group hover:border-green-200 transition-colors">
                      <span className="text-xs font-black text-green-600">{item.resolved}</span>
                      <span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground/60">Resolved</span>
                    </div>
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
            "text-sm font-bold leading-relaxed text-foreground/80 line-clamp-2"
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