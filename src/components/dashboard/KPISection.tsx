"use client";

import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { KPIMetric } from '@/features/dashboard/types';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight, Ticket, Clock, CheckCircle2, Bug, Brain, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';

interface KPISectionProps {
  metrics: KPIMetric[];
  isLoading: boolean;
}

const KPISection = ({ metrics, isLoading }: KPISectionProps) => {
  const [selectedMetric, setSelectedMetric] = useState<KPIMetric | null>(null);

  const getArchetypeConfig = (archetype: KPIMetric['archetype']) => {
    switch (archetype) {
      case 'volume':
        return {
          icon: Ticket,
          color: "text-blue-600",
          bg: "bg-blue-50 dark:bg-blue-900/20",
          chartColor: "#3b82f6"
        };
      case 'backlog':
        return {
          icon: Clock,
          color: "text-orange-600",
          bg: "bg-orange-50 dark:bg-orange-900/20",
          chartColor: "#f97316"
        };
      case 'resolved':
        return {
          icon: CheckCircle2,
          color: "text-green-600",
          bg: "bg-green-50 dark:bg-green-900/20",
          chartColor: "#10b981"
        };
      case 'attention':
        return {
          icon: Bug,
          color: "text-red-600",
          bg: "bg-red-50 dark:bg-red-900/20",
          chartColor: "#ef4444"
        };
    }
  };

  return (
    <div className="relative">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const config = getArchetypeConfig(metric.archetype);
          const Icon = config.icon;
          const isPositiveTrend = metric.trend > 0;
          const isTrendGood = (metric.archetype === 'backlog' || metric.archetype === 'attention') 
            ? !isPositiveTrend 
            : isPositiveTrend;

          const isAnomaly = metric.microInsight.includes('unusual') || metric.microInsight.includes('attention');

          return (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedMetric(metric)}
            >
              <Card className={cn(
                "group relative overflow-hidden rounded-[24px] border border-border bg-white dark:bg-gray-900 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer",
                isAnomaly && "ring-2 ring-indigo-500/20"
              )}>
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className={cn("p-2.5 rounded-xl", config.bg, config.color)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-tight",
                      isTrendGood 
                        ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" 
                        : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                    )}>
                      {isPositiveTrend ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {Math.abs(metric.trend)}%
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/70">
                      {metric.title}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <div className="text-4xl font-black tracking-tighter text-foreground">
                        {typeof metric.value === 'number' ? (
                          <CountUp end={metric.value} duration={2} separator="," />
                        ) : metric.value}
                      </div>
                      <span className={cn(
                        "text-[10px] font-bold lowercase px-2 py-0.5 rounded-full",
                        isAnomaly ? "bg-indigo-50 text-indigo-600" : "text-muted-foreground"
                      )}>
                        {metric.microInsight}
                      </span>
                    </div>
                  </div>

                  <div className="h-12 w-full -mx-6 -mb-6 mt-2 opacity-50 group-hover:opacity-100 transition-opacity">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={metric.sparklineData}>
                        <defs>
                          <linearGradient id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={config.chartColor} stopOpacity={0.4} />
                            <stop offset="100%" stopColor={config.chartColor} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke={config.chartColor}
                          strokeWidth={2}
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

      {/* Side Panel: Why this number? */}
      <AnimatePresence>
        {selectedMetric && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMetric(null)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-900 shadow-2xl z-[60] border-l border-border flex flex-col"
            >
              <div className="p-6 border-b border-border flex items-center justify-between bg-indigo-600 text-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/20 backdrop-blur-md">
                    <Brain className="h-5 w-5" />
                  </div>
                  <span className="font-black tracking-tight">Intelligence Panel</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedMetric(null)} className="text-white hover:bg-white/10 rounded-full">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-8 space-y-8 flex-1 overflow-y-auto">
                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Metric Analysis</h3>
                  <p className="text-2xl font-black">{selectedMetric.title}: {selectedMetric.value}</p>
                </div>

                <div className="p-6 rounded-[24px] bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">AI Reasoning</span>
                  </div>
                  <p className="text-sm font-bold leading-relaxed text-indigo-900 dark:text-indigo-200">
                    {selectedMetric.reasoning || "This metric is currently within normal operational parameters."}
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Recommended Actions</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <Button variant="outline" className="justify-start gap-3 h-12 rounded-xl font-bold text-xs border-indigo-100 text-indigo-600 hover:bg-indigo-50">
                      <CheckCircle2 className="h-4 w-4" /> Investigate Drivers
                    </Button>
                    <Button variant="outline" className="justify-start gap-3 h-12 rounded-xl font-bold text-xs border-indigo-100 text-indigo-600 hover:bg-indigo-50">
                      <ArrowUpRight className="h-4 w-4" /> View Related Tickets
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KPISection;