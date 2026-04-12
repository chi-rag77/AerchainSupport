"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from '@/lib/utils';
import { 
  TrendingUp, TrendingDown, Minus, 
  Ticket, Clock, Shield, BarChart3
} from 'lucide-react';

interface StatItemProps {
  label: string;
  value: string | number;
  trend: string;
  icon: any;
  color: string;
}

const StatItem = ({ label, value, trend, icon: Icon, color }: StatItemProps) => (
  <div className="p-5 space-y-4">
    <div className="flex items-center gap-3">
      <div className={cn("p-2 rounded-lg bg-indigo-50 text-indigo-600")}>
        <Icon className="h-4 w-4" />
      </div>
      <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">{label}</span>
    </div>
    <div className="space-y-1">
      <p className="text-3xl font-black tracking-tighter text-foreground">{value}</p>
      <div className={cn(
        "flex items-center gap-1 text-[10px] font-bold uppercase tracking-tighter",
        trend.includes('+') || trend.includes('target') || trend.includes('-') ? "text-emerald-600" : "text-rose-600"
      )}>
        {trend.includes('+') ? <TrendingUp className="h-3 w-3" /> : trend.includes('-') ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
        {trend}
      </div>
    </div>
  </div>
);

interface QuickStatsProps {
  stats: any;
}

const QuickStats = ({ stats }: QuickStatsProps) => {
  return (
    <Card className="border border-border/50 bg-white dark:bg-gray-900 rounded-[16px] shadow-sm overflow-hidden">
      <CardHeader className="p-5 pb-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-600 text-white shadow-sm">
            <BarChart3 className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold">Today's Numbers</CardTitle>
            <p className="text-[10px] font-medium text-muted-foreground">Real-time performance snapshot</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-x divide-y divide-border/50">
          <StatItem 
            label="Tickets Handled" 
            value={stats?.handledToday || 0} 
            trend={`${stats?.trends?.handled > 0 ? '+' : ''}${stats?.trends?.handled || 0} vs yesterday`} 
            icon={Ticket} 
            color="text-indigo-600" 
          />
          <StatItem 
            label="Avg Resolution" 
            value={stats?.avgResTime || '0h'} 
            trend={`${stats?.trends?.resTime || 0}h vs last week`} 
            icon={Clock} 
            color="text-indigo-600" 
          />
          <StatItem 
            label="SLA Adherence" 
            value={`${stats?.sla || 0}%`} 
            trend="On target" 
            icon={Shield} 
            color="text-indigo-600" 
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickStats;