"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Activity, Zap, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const TrendMovementGrid = ({ trends }: { trends: any[] }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
          <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-xl font-black tracking-tight">Trend Movement Intelligence</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {trends.map((trend, i) => (
          <Card key={i} className="border-none bg-white dark:bg-gray-800 shadow-glass rounded-[28px] p-8 group overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <div className="space-y-1">
                <h4 className="text-lg font-bold">{trend.label}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-black tracking-tighter">{trend.value}</span>
                  <Badge variant="outline" className={cn(
                    "text-[10px] font-black uppercase tracking-widest border-2",
                    trend.direction === 'up' ? "text-green-600 border-green-100" : "text-red-600 border-red-100"
                  )}>
                    {trend.direction === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                    {trend.direction}
                  </Badge>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-900 group-hover:bg-indigo-50 transition-colors">
                <Zap className="h-5 w-5 text-indigo-600" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-gray-100 dark:border-gray-700">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Acceleration</span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: `${Math.abs(trend.acceleration)}%` }} />
                  </div>
                  <span className="text-xs font-bold">{trend.acceleration}%</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Volatility Score</span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className={cn("h-full", trend.volatility > 15 ? "bg-red-500" : "bg-green-500")} style={{ width: `${trend.volatility}%` }} />
                  </div>
                  <span className="text-xs font-bold">{trend.volatility}%</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TrendMovementGrid;