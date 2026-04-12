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
    if (score >= 40) return "Needs Attention";
    return "Critical";
  };

  const items = [
    { label: "Urgent (>4h)", count: data.urgent, color: "bg-rose-500", icon: ShieldAlert },
    { label: "Pending Reply", count: data.pending, color: "bg-amber-500", icon: Clock },
    { label: "Ready to Close", count: data.readyToClose, color: "bg-emerald-500", icon: CheckCircle2 },
    { label: "In Progress", count: data.inProgress, color: "bg-blue-500", icon: Zap },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-2">Queue Breakdown</h3>
      
      <Card className="border-none shadow-glass rounded-[32px] bg-white dark:bg-gray-900 overflow-hidden">
        <CardContent className="p-8 space-y-8">
          {/* Health Score Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Queue Health</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black tracking-tighter text-foreground">{data.healthScore}%</span>
                <Badge className={cn("font-black uppercase tracking-widest text-[9px] border-2 px-3 py-0.5 rounded-full", getHealthColor(data.healthScore))}>
                  {getHealthLabel(data.healthScore)}
                </Badge>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
              <Activity className="h-6 w-6" />
            </div>
          </div>

          <Progress value={data.healthScore} className="h-2" indicatorClassName="bg-indigo-600" />

          {/* Status Rows */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-bold text-foreground">Open Tickets</span>
              <span className="text-lg font-black text-foreground">{data.total}</span>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              {items.map((item) => (
                <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 border border-border/30 group hover:border-indigo-100 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={cn("h-1.5 w-1.5 rounded-full", item.color)} />
                    <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors">{item.label}</span>
                  </div>
                  <Badge variant="secondary" className={cn("font-black text-[10px] border-none px-2.5 py-0.5", item.color.replace('bg-', 'text-'), item.color.replace('bg-', 'bg-').replace('500', '50'))}>
                    {item.count}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QueueBreakdown;