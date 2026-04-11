"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Layers, ArrowRight, ShieldAlert, Clock, UserPlus, Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { AgentCapacity } from '@/features/dashboard/types';

interface OperationsOverviewProps {
  capacity: AgentCapacity[];
  queueMetrics: {
    urgent: number;
    high: number;
    medium: number;
    low: number;
    aging: { label: string; count: number; alert: boolean }[];
  };
}

const OperationsOverview = ({ capacity = [], queueMetrics }: OperationsOverviewProps) => {
  const aggregateLoad = capacity.length > 0 
    ? Math.round(capacity.reduce((acc, curr) => acc + curr.capacityPercent, 0) / capacity.length)
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left: Team Capacity */}
      <Card className="border-none shadow-glass rounded-[32px] bg-white dark:bg-gray-900 overflow-hidden">
        <CardHeader className="p-8 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
                <Users className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-xl font-black tracking-tight">Team Load & Utilization</CardTitle>
            </div>
            <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-none font-bold text-[10px]">{aggregateLoad}% Aggregate</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-8 pt-4 space-y-8">
          <div className="space-y-5">
            {capacity.slice(0, 5).map((agent) => (
              <div key={agent.name} className="space-y-2">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">{agent.name}</span>
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-widest",
                      agent.status === 'Critical' ? "text-rose-600" : agent.status === 'Overloaded' ? "text-amber-600" : "text-green-600"
                    )}>• {agent.status}</span>
                  </div>
                  <span className="text-xs font-black text-indigo-600">{agent.capacityPercent}%</span>
                </div>
                <Progress value={agent.capacityPercent} className="h-1.5" indicatorClassName={agent.capacityPercent > 90 ? "bg-rose-500" : "bg-indigo-600"} />
              </div>
            ))}
          </div>
          <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-border/50 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Performance Insight</p>
              <p className="text-sm font-bold">Avg Resolution Time: {capacity[0]?.avgResolutionTime || 'N/A'}</p>
            </div>
            <Button variant="ghost" size="sm" className="rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 text-indigo-600">
              Reassign <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Right: Queue Health */}
      <Card className="border-none shadow-glass rounded-[32px] bg-white dark:bg-gray-900 overflow-hidden">
        <CardHeader className="p-8 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
                <Layers className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-xl font-black tracking-tight">Queue Breakdown</CardTitle>
            </div>
            <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-none font-bold text-[10px]">Live Metrics</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-8 pt-4 space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Priority Distribution</h4>
              <div className="space-y-3">
                {[
                  { label: 'Urgent', count: queueMetrics.urgent, color: 'bg-rose-500' },
                  { label: 'High', count: queueMetrics.high, color: 'bg-orange-500' },
                  { label: 'Medium', count: queueMetrics.medium, color: 'bg-amber-500' },
                  { label: 'Low', count: queueMetrics.low, color: 'bg-gray-400' },
                ].map(p => (
                  <div key={p.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn("h-1.5 w-1.5 rounded-full", p.color)} />
                      <span className="text-xs font-bold text-muted-foreground">{p.label}</span>
                    </div>
                    <span className="text-xs font-black">{p.count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Aging Analysis</h4>
              <div className="space-y-3">
                {queueMetrics.aging.map(a => (
                  <div key={a.label} className="flex items-center justify-between">
                    <span className={cn("text-xs font-bold", a.alert ? "text-rose-600" : "text-muted-foreground")}>{a.label}</span>
                    <span className={cn("text-xs font-black", a.alert && "text-rose-600")}>{a.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 rounded-xl font-black text-[10px] uppercase tracking-widest h-11 gap-2">
              <Zap className="h-4 w-4" /> Prioritize
            </Button>
            <Button variant="outline" className="flex-1 rounded-xl font-black text-[10px] uppercase tracking-widest h-11 gap-2">
              <Clock className="h-4 w-4" /> SLA View
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OperationsOverview;