"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { KPIMetric } from '@/features/dashboard/types';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight, Ticket, Clock, CheckCircle2, Bug } from 'lucide-react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface KPISectionProps {
  metrics: KPIMetric[];
  isLoading: boolean;
}

const KPISection = ({ metrics, isLoading }: KPISectionProps) => {
  const getArchetypeConfig = (archetype: KPIMetric['archetype']) => {
    switch (archetype) {
      case 'volume':
        return {
          icon: Ticket,
          color: "text-blue-600",
          bg: "bg-blue-50 dark:bg-blue-900/20",
          chartColor: "#3b82f6",
          trendBg: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
        };
      case 'backlog':
        return {
          icon: Clock,
          color: "text-orange-600",
          bg: "bg-orange-50 dark:bg-orange-900/20",
          chartColor: "#f97316",
          trendBg: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
        };
      case 'resolved':
        return {
          icon: CheckCircle2,
          color: "text-green-600",
          bg: "bg-green-50 dark:bg-green-900/20",
          chartColor: "#10b981",
          trendBg: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
        };
      case 'attention':
        return {
          icon: Bug,
          color: "text-red-600",
          bg: "bg-red-50 dark:bg-red-900/20",
          chartColor: "#ef4444",
          trendBg: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
        };
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => {
        const config = getArchetypeConfig(metric.archetype);
        const Icon = config.icon;
        const isPositiveTrend = metric.trend > 0;
        
        // Determine if the trend is "good" or "bad" based on the metric type
        const isTrendGood = (metric.archetype === 'backlog' || metric.archetype === 'attention') 
          ? !isPositiveTrend 
          : isPositiveTrend;

        const trendColorClass = isTrendGood 
          ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" 
          : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400";

        return (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="group relative overflow-hidden rounded-[28px] border border-border bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all duration-300">
              <CardContent className="p-0">
                <div className="p-6 pb-2 space-y-4">
                  {/* Header: Icon & Trend Badge */}
                  <div className="flex justify-between items-start">
                    <div className={cn("p-2 rounded-xl", config.bg, config.color)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className={cn(
                      "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter",
                      trendColorClass
                    )}>
                      {isPositiveTrend ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {Math.abs(metric.trend)}%
                    </div>
                  </div>

                  {/* Metric Content */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/60">
                      {metric.title}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <div className="text-3xl font-black tracking-tighter text-foreground">
                        {typeof metric.value === 'number' ? (
                          <CountUp end={metric.value} duration={2} separator="," />
                        ) : metric.value}
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground/60">
                        {metric.microInsight}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Sparkline */}
                <div className="h-14 w-full mt-2 opacity-60 group-hover:opacity-100 transition-opacity">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metric.sparklineData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={config.chartColor} stopOpacity={0.2} />
                          <stop offset="100%" stopColor={config.chartColor} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke={config.chartColor}
                        strokeWidth={2.5}
                        fill={`url(#gradient-${index})`}
                        isAnimationActive={true}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

export default KPISection;