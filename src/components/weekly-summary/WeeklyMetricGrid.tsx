"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { WeeklyMetrics } from '@/features/weekly-summary/types';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight, Ticket, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';

interface WeeklyMetricGridProps {
  metrics: WeeklyMetrics;
}

const WeeklyMetricGrid = ({ metrics }: WeeklyMetricGridProps) => {
  const items = [
    { 
      title: "Tickets Created", 
      value: metrics.created, 
      trend: metrics.trends.created, 
      icon: Ticket, 
      color: "blue" 
    },
    { 
      title: "Tickets Resolved", 
      value: metrics.resolved, 
      trend: metrics.trends.resolved, 
      icon: CheckCircle2, 
      color: "green" 
    },
    { 
      title: "Active Backlog", 
      value: metrics.backlog, 
      trend: metrics.trends.backlog, 
      icon: ShieldAlert, 
      color: "red" 
    },
    { 
      title: "Avg. Resolution", 
      value: metrics.avgResolutionTime, 
      trend: 0, 
      icon: Clock, 
      color: "amber" 
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {items.map((item, i) => (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <Card className="relative group overflow-hidden rounded-[28px] border-none bg-white dark:bg-gray-800 shadow-glass hover:shadow-glass-glow transition-all duration-500">
            <CardContent className="p-8 space-y-4">
              <div className="flex justify-between items-start">
                <div className={cn(
                  "p-2.5 rounded-2xl",
                  item.color === 'blue' && "bg-blue-50 text-blue-600",
                  item.color === 'green' && "bg-green-50 text-green-600",
                  item.color === 'red' && "bg-red-50 text-red-600",
                  item.color === 'amber' && "bg-amber-50 text-amber-600",
                )}>
                  <item.icon className="h-5 w-5" />
                </div>
                {item.trend !== 0 && (
                  <div className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold",
                    item.trend > 0 ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                  )}>
                    {item.trend > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {Math.abs(item.trend)}%
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">
                  {item.title}
                </span>
                <div className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white">
                  {typeof item.value === 'number' ? (
                    <CountUp end={item.value} duration={2} />
                  ) : item.value}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default WeeklyMetricGrid;