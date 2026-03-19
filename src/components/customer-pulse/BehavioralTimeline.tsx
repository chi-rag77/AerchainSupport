"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DailyActivity } from '@/features/customer-pulse/types';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface BehavioralTimelineProps {
  data: DailyActivity[];
}

const BehavioralTimeline = ({ data }: BehavioralTimelineProps) => {
  const maxVal = Math.max(...data.map(d => Math.max(d.created, d.resolved)), 1);

  return (
    <Card className="border-none shadow-glass rounded-[32px] bg-white dark:bg-gray-900 overflow-hidden h-full">
      <CardHeader className="p-8 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
              <Activity className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <CardTitle className="text-xl font-black tracking-tight">Behavioral Timeline</CardTitle>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-indigo-600" /> Created
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-emerald-500" /> Resolved
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-8 pt-6 space-y-10">
        <div className="flex items-end justify-between h-48 gap-4">
          {data.map((day, i) => (
            <div key={day.day} className="flex-1 flex flex-col items-center gap-4 group">
              <div className="w-full flex justify-center gap-1.5 h-full items-end">
                {/* Created Bar */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${(day.created / maxVal) * 100}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className={cn(
                        "w-4 rounded-t-lg transition-all group-hover:brightness-110",
                        day.isSpike ? "bg-rose-500 shadow-lg shadow-rose-500/20" : "bg-indigo-600"
                      )}
                    />
                  </TooltipTrigger>
                  <TooltipContent className="font-bold">{day.created} Tickets Created</TooltipContent>
                </Tooltip>

                {/* Resolved Bar */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${(day.resolved / maxVal) * 100}%` }}
                      transition={{ duration: 1, delay: (i * 0.1) + 0.2 }}
                      className={cn(
                        "w-4 rounded-t-lg transition-all group-hover:brightness-110",
                        day.isDip ? "bg-amber-400 shadow-lg shadow-amber-500/20" : "bg-emerald-500"
                      )}
                    />
                  </TooltipTrigger>
                  <TooltipContent className="font-bold">{day.resolved} Tickets Resolved</TooltipContent>
                </Tooltip>
              </div>

              <div className="space-y-1 text-center">
                <span className="text-xs font-black uppercase tracking-widest text-foreground">{day.day}</span>
                {day.isSpike && (
                  <div className="flex items-center justify-center gap-1 text-[8px] font-black text-rose-600 uppercase">
                    <TrendingUp className="h-2 w-2" /> Spike
                  </div>
                )}
                {day.isDip && (
                  <div className="flex items-center justify-center gap-1 text-[8px] font-black text-amber-600 uppercase">
                    <TrendingDown className="h-2 w-2" /> Dip
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-border flex items-start gap-3">
          <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-[11px] font-medium text-muted-foreground leading-relaxed">
            Activity peaked on <span className="font-bold text-foreground">Tuesday</span> with a significant volume spike, while resolution efficiency dipped on <span className="font-bold text-foreground">Friday</span>, likely due to pending technical dependencies.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BehavioralTimeline;