"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from '@/lib/utils';
import { 
  TrendingUp, TrendingDown, Minus, 
  CheckCircle2, Clock, Heart, ShieldCheck,
  Sparkles
} from 'lucide-react';

interface StatRowProps {
  label: string;
  value: string | number;
  trend: number;
  icon: any;
  color: string;
}

const StatRow = ({ label, value, trend, icon: Icon, color }: StatRowProps) => (
  <div className="flex items-center justify-between p-4 rounded-[20px] bg-gray-50/50 dark:bg-gray-800/50 border border-border/50 group hover:border-indigo-200 transition-all">
    <div className="flex items-center gap-3">
      <div className={cn("p-2 rounded-xl shadow-sm", color)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="space-y-0.5">
        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="text-xl font-black tracking-tighter text-foreground">{value}</p>
      </div>
    </div>
    <div className={cn(
      "flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter",
      trend > 0 ? "bg-green-50 text-green-700" : trend < 0 ? "bg-rose-50 text-rose-700" : "bg-gray-100 text-gray-500"
    )}>
      {trend > 0 ? <TrendingUp className="h-2.5 w-2.5" /> : trend < 0 ? <TrendingDown className="h-2.5 w-2.5" /> : <Minus className="h-2.5 w-2.5" />}
      {Math.abs(trend)}%
    </div>
  </div>
);

interface QuickStatsProps {
  stats: {
    handledToday: number;
    avgResTime: string;
    csat: number;
    sla: number;
    trends: {
      handled: number;
      resTime: number;
      csat: number;
      sla: number;
    };
  };
}

const QuickStats = ({ stats }: QuickStatsProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Today's Numbers</h3>
        <div className="flex items-center gap-1.5 text-[9px] font-bold text-indigo-600">
          <Sparkles className="h-3 w-3" />
          Beating yesterday's pace
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <StatRow 
          label="Handled" 
          value={stats.handledToday} 
          trend={stats.trends.handled} 
          icon={CheckCircle2} 
          color="bg-blue-50 text-blue-600" 
        />
        <StatRow 
          label="Avg Res" 
          value={stats.avgResTime} 
          trend={stats.trends.resTime} 
          icon={Clock} 
          color="bg-indigo-50 text-indigo-600" 
        />
        <StatRow 
          label="CSAT" 
          value={`${stats.csat}%`} 
          trend={stats.trends.csat} 
          icon={Heart} 
          color="bg-rose-50 text-rose-600" 
        />
        <StatRow 
          label="SLA" 
          value={`${stats.sla}%`} 
          trend={stats.trends.sla} 
          icon={ShieldCheck} 
          color="bg-emerald-50 text-emerald-600" 
        />
      </div>
    </div>
  );
};

export default QuickStats;