"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { 
  Activity, TrendingUp, TrendingDown, AlertCircle, 
  Sparkles, Info, Circle, Triangle, AlertTriangle 
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
  aiInsights?: {
    summary: string;
    highlights: { day: string; event: string; reason: string }[];
  };
  mode?: 'summary' | 'ai';
}

const BehavioralTimeline = ({ data, aiInsights, mode = 'summary' }: BehavioralTimelineProps) => {
  const getMarker = (item: DailyData) => {
    if (item.sla_risk === 'high') return <AlertTriangle className="h-5 w-5 text-rose-500 animate-pulse" />;
    if (item.trend === 'spike') return <Triangle className="h-5 w-5 fill-rose-500 text-rose-500" />;
    if (item.trend === 'drop') return <Triangle className="h-5 w-5 fill-amber-500 text-amber-500 rotate-180" />;
    return <Circle className="h-4 w-4 fill-indigo-600 text-indigo-600" />;
  };

  const getMarkerLabel = (item: DailyData) => {
    if (item.sla_risk === 'high') return "SLA Risk";
    if (item.trend === 'spike') return "Spike";
    if (item.trend === 'drop') return "Drop";
    return "Normal";
  };

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
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-indigo-50/50 text-indigo-700 border-none font-bold text-[9px] uppercase tracking-widest">
              Mon – Fri Activity
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-8 pt-6 space-y-10">
        {/* Timeline Visualization */}
        <div className="relative">
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-0 w-full h-px bg-gray-100 dark:bg-gray-800 -translate-y-1/2 z-0" />
          
          <div className="relative z-10 flex justify-between items-center">
            {data?.map((item, i) => (
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
                  <TooltipContent className="p-3 rounded-xl shadow-2xl border-none bg-white dark:bg-gray-800">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">{item.day} Activity</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[9px] font-bold text-muted-foreground uppercase">Created</p>
                          <p className="text-lg font-black">{item.created}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-muted-foreground uppercase">Resolved</p>
                          <p className="text-lg font-black text-green-600">{item.resolved}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="w-full justify-center text-[8px] font-black uppercase">
                        Status: {getMarkerLabel(item)}
                      </Badge>
                    </div>
                  </TooltipContent>
                </Tooltip>

                <div className="text-center space-y-0.5">
                  <p className="text-sm font-black tracking-tighter">
                    {item.created}<span className="text-muted-foreground mx-0.5">/</span>{item.resolved}
                  </p>
                  <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-tighter">C/R Ratio</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Intelligence Layer */}
        {aiInsights && (
          <div className="p-5 rounded-[24px] bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-xl bg-white dark:bg-gray-800 shadow-sm shrink-0">
                <Sparkles className="h-4 w-4 text-indigo-600" />
              </div>
              <div className="space-y-2">
                <h5 className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Behavioral Insight</h5>
                <p className={cn(
                  "text-sm font-bold leading-relaxed text-indigo-900 dark:text-indigo-200",
                  mode === 'summary' && "line-clamp-2"
                )}>
                  {aiInsights.summary}
                </p>
                {mode === 'ai' && aiInsights.highlights && aiInsights.highlights.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {aiInsights.highlights.map((h, i) => (
                      <Badge key={i} variant="outline" className="bg-white/50 dark:bg-gray-800/50 border-indigo-100 text-[9px] font-bold py-0.5 px-2">
                        {h.day}: {h.reason}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BehavioralTimeline;