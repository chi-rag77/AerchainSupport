"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  TrendingUp, TrendingDown, Target, Zap, 
  ShieldAlert, CheckCircle2, Brain, Sparkles 
} from 'lucide-react';
import { PulseData } from '@/features/customer-pulse/types';

interface SnapshotStripProps {
  data: PulseData;
}

const SnapshotStrip = ({ data }: SnapshotStripProps) => {
  const isRateUp = data.metrics.rateTrend >= 0;

  const items = [
    { label: "Tickets", value: data.metrics.total, sub: "Total Volume", icon: Target, color: "text-blue-600" },
    { label: "Resolved", value: data.metrics.resolved, sub: "Completed", icon: CheckCircle2, color: "text-green-600" },
    { 
      label: "Resolution Rate", 
      value: `${data.metrics.rate}%`, 
      sub: `${isRateUp ? '↑' : '↓'} ${Math.abs(data.metrics.rateTrend)}% vs last week`, 
      icon: Zap, 
      color: isRateUp ? "text-green-600" : "text-rose-600" 
    },
    { label: "Primary Issue", value: data.metrics.primaryIssue, sub: `${data.metrics.primaryIssuePercent}% of volume`, icon: ShieldAlert, color: "text-amber-600" },
  ];

  return (
    <Card className="border-none shadow-glass rounded-[32px] bg-white dark:bg-gray-900 overflow-hidden">
      <CardContent className="p-0 flex flex-col lg:flex-row items-stretch">
        {/* Left: Customer Identity */}
        <div className="p-8 lg:w-72 bg-indigo-600 text-white flex flex-col justify-center space-y-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-black tracking-tighter">{data.customer}</h2>
            <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest">{data.weekRange}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={cn(
              "px-4 py-1 rounded-full font-black uppercase tracking-widest text-[10px] border-none",
              data.status === 'Healthy' ? "bg-green-400 text-green-950" : 
              data.status === 'Watch' ? "bg-amber-400 text-amber-950" : "bg-rose-400 text-rose-950"
            )}>
              {data.status}
            </Badge>
            <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-200">
              <Brain className="h-3 w-3" /> {data.confidenceScore}%
            </div>
          </div>
        </div>

        {/* Right: Metrics Grid */}
        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100 dark:divide-gray-800">
          {items.map((item) => (
            <div key={item.label} className="p-8 space-y-3 group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <div className="flex items-center gap-2">
                <item.icon className={cn("h-4 w-4", item.color)} />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{item.label}</span>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-black tracking-tighter text-foreground">{item.value}</p>
                <p className={cn("text-[10px] font-bold uppercase tracking-tighter", item.color === 'text-blue-600' ? 'text-muted-foreground' : item.color)}>
                  {item.sub}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SnapshotStrip;