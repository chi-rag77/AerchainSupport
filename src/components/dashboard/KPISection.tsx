"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { KPIMetric } from '@/features/dashboard/types';
import { cn } from '@/lib/utils';
import { 
  ArrowUpRight, ArrowDownRight, Ticket, Clock, 
  CheckCircle2, Bug, ShieldAlert, Heart, Repeat, Zap 
} from 'lucide-react';
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
      case 'volume': return { icon: Ticket, color: "text-blue-600", bg: "bg-blue-50", chartColor: "#2563eb" };
      case 'resolved': return { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50", chartColor: "#10b981" };
      case 'backlog': return { icon: Clock, color: "text-orange-600", bg: "bg-orange-50", chartColor: "#f97316" };
      case 'attention': return { icon: Bug, color: "text-red-600", bg: "bg-red-50", chartColor: "#ef4444" };
      case 'risk': return { icon: ShieldAlert, color: "text-rose-600", bg: "bg-rose-50", chartColor: "#e11d48" };
      case 'health': return { icon: Heart, color: "text-emerald-600", bg: "bg-emerald-50", chartColor: "#059669" };
      case 'recurrence': return { icon: Repeat, color: "text-indigo-600", bg: "bg-indigo-50", chartColor: "#4f46e5" };
      case 'quality': return { icon: Zap, color: "text-amber-600", bg: "bg-amber-50", chartColor: "#d97706" };
      default: return { icon: Ticket, color: "text-gray-600", bg: "bg-gray-50", chartColor: "#4b5563" };
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => {
        const config = getArchetypeConfig(metric.archetype);
        const Icon = config.icon;
        const isPositiveTrend = metric.trend > 0;
        const isTrendGood = ['resolved', 'health', 'quality'].includes(metric.archetype) ? isPositiveTrend : !isPositiveTrend;

        return (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="group relative overflow-hidden rounded-[28px] border border-border bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all duration-300">
              <CardContent className="p-0">
                <div className="p-6 pb-2 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className={cn("p-2 rounded-xl", config.bg, config.color, "dark:bg-gray-800")}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className={cn(
                      "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter",
                      isTrendGood ? "bg-green-50 text-green-700 dark:bg-green-900/20" : "bg-red-50 text-red-700 dark:bg-red-900/20"
                    )}>
                      {isPositiveTrend ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {Math.abs(metric.trend)}%
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/60">
                      {metric.title}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <div className="text-3xl font-black tracking-tighter text-foreground">
                        {typeof metric.value === 'number' ? <CountUp end={metric.value} duration={2} separator="," /> : metric.value}
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground/60">{metric.microInsight}</span>
                    </div>
                  </div>
                </div>

                <div className="h-16 w-full mt-2 opacity-60 group-hover:opacity-100 transition-opacity">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metric.sparklineData}>
                      <defs>
                        <linearGradient id={`grad-${index}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={config.chartColor} stopOpacity={0.3} />
                          <stop offset="100%" stopColor={config.chartColor} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="value" stroke={config.chartColor} strokeWidth={2.5} fill={`url(#grad-${index})`} isAnimationActive={true} />
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