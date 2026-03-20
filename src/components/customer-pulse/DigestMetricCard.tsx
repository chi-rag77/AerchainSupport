"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Info, TrendingUp } from 'lucide-react';
import CountUp from 'react-countup';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface DigestMetricCardProps {
  title: string;
  value: number;
  suffix?: string;
  trend: number;
  trendLabel: string;
  status: 'good' | 'warning' | 'critical' | 'neutral';
  sparklineData: { value: number }[];
  description: string;
  isPrimary?: boolean;
}

const DigestMetricCard = ({ 
  title, value, suffix = "", trend, trendLabel, status, 
  sparklineData, description, isPrimary = false 
}: DigestMetricCardProps) => {
  
  const statusColors = {
    good: "text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100",
    warning: "text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20 border-amber-100",
    critical: "text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/20 border-rose-100",
    neutral: "text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-100",
  };

  const chartColors = {
    good: "#10b981",
    warning: "#f59e0b",
    critical: "#f43f5e",
    neutral: "#6366f1",
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          whileHover={{ y: -4, scale: 1.02 }}
          className="relative h-full"
        >
          <Card className={cn(
            "h-full border-none shadow-glass rounded-[24px] overflow-hidden transition-all duration-500 group",
            isPrimary ? "bg-white dark:bg-gray-800 ring-2 ring-indigo-500/20" : "bg-white/60 dark:bg-gray-900/60 backdrop-blur-md"
          )}>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">
                  {title}
                </span>
                <div className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter border",
                  statusColors[status]
                )}>
                  {trend > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(trend)}%
                </div>
              </div>

              <div className="space-y-1">
                <div className={cn(
                  "text-3xl font-black tracking-tighter",
                  isPrimary ? "text-indigo-600" : "text-foreground"
                )}>
                  <CountUp end={value} duration={2} separator="," />
                  <span className="text-xl ml-0.5">{suffix}</span>
                </div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  {trendLabel}
                </p>
              </div>

              {/* Sparkline */}
              <div className="h-10 w-full -mx-2 opacity-40 group-hover:opacity-100 transition-opacity">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sparklineData}>
                    <defs>
                      <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={chartColors[status]} stopOpacity={0.4} />
                        <stop offset="100%" stopColor={chartColors[status]} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke={chartColors[status]} 
                      fill={`url(#grad-${title})`} 
                      strokeWidth={2}
                      isAnimationActive={true}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </TooltipTrigger>
      <TooltipContent className="p-4 rounded-2xl shadow-2xl border-none bg-white dark:bg-gray-900 max-w-[200px]">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-600">
            <TrendingUp className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Intelligence Insight</span>
          </div>
          <p className="text-xs font-bold leading-relaxed text-foreground/80">
            {description}
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export default DigestMetricCard;