"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { KPIMetric } from '@/features/dashboard/types';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';

interface KPISectionProps {
  metrics: KPIMetric[];
  isLoading: boolean;
}

const KPISection = ({ metrics, isLoading }: KPISectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="relative group overflow-hidden rounded-[28px] border-none bg-white dark:bg-gray-800 shadow-glass hover:shadow-glass-glow transition-all duration-500">
            {/* Subtle Gradient Accent */}
            <div className={cn(
              "absolute top-0 left-0 w-full h-1.5",
              metric.archetype === 'attention' ? "bg-gradient-to-r from-red-400 to-red-600" : 
              metric.archetype === 'health' ? "bg-gradient-to-r from-green-400 to-green-600" : 
              "bg-gradient-to-r from-blue-400 to-blue-600"
            )} />

            <CardContent className="p-8 space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground/70">
                  {metric.title}
                </span>
                <div className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold",
                  metric.trend > 0 ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400" : "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                )}>
                  {metric.trend > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(metric.trend)}%
                </div>
              </div>

              <div className="text-5xl font-extrabold tracking-tighter text-gray-900 dark:text-white">
                {typeof metric.value === 'number' ? (
                  <CountUp end={metric.value} duration={2} separator="," />
                ) : metric.value}
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-700/50">
                <div className="flex items-start gap-2 text-xs font-medium text-muted-foreground leading-relaxed">
                  <Sparkles className="h-3.5 w-3.5 text-purple-500 shrink-0 mt-0.5" />
                  <span className="italic">"{metric.microInsight}"</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default KPISection;