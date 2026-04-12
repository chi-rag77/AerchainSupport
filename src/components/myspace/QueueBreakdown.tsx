"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Activity, ShieldAlert, Clock, CheckCircle2, Zap } from 'lucide-react';

interface QueueBreakdownProps {
  data: {
    total: number;
    urgent: number;
    pending: number;
    readyToClose: number;
    inProgress: number;
    healthScore: number;
  };
}

const QueueBreakdown = ({ data }: QueueBreakdownProps) => {
  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 bg-emerald-50 border-emerald-100";
    if (score >= 60) return "text-blue-600 bg-blue-50 border-blue-100";
    if (score >= 40) return "text-amber-600 bg-amber-50 border-amber-100";
    return "text-rose-600 bg-rose-50 border-rose-100";
  };

  const getHealthLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Attention";
    return "Critical";
  };

  const items = [
    { label: "Urgent (>4h)", count: data.urgent, color: "bg-rose-500", icon: ShieldAlert },
    { label: "Pending Reply", count: data.pending, color: "bg-amber-500", icon: Clock },
    { label: "Ready to Close", count: data.readyToClose, color: "bg-emerald-500", icon: CheckCircle2 },
    { label: "In Progress", count: data.inProgress, color: "bg-blue-500", icon: Zap },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-2">Queue Breakdown</h3>
      
      <Card className="border-none shadow-glass rounded-[28px] bg-white dark:bg-gray-900 overflow-hidden h-full">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Queue Health</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black tracking-tighter text-foreground">{data.healthScore}%</span>
                <Badge className={cn("font-black uppercase tracking-widest text-[8px] border-none px-2 py-0.5 rounded-full", getHealthColor(data.healthScore))}>
                  {getHealthLabel(data.healthScore)}
                </Badge>
              </div>
            </div>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Activity className="h-5 w-5" />
            </div>
          </div>

          <Progress value={data.healthScore} className="h-1.5" indicatorClassName="bg-indigo-600" />

          <div className="grid grid-cols-2 gap-2">
            {items.map((item) => (
              <div key={item.label} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 border border-border/30 group hover:border-indigo-100 transition-all">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", item.color)} />
                  <span className="text-[10px] font-bold text-muted-foreground group-hover:text-foreground transition-colors truncate">{item.label}</span>
                </div>
                <span className={cn("font-black text-[11px] ml-2", item.color.replace('bg-', 'text-'))}>
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QueueBreakdown;