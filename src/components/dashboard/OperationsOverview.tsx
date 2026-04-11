"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Users, BarChart3, AlertTriangle } from 'lucide-react';
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

  const getLoadColor = (percent: number) => {
    if (percent >= 85) return "bg-red-500";
    if (percent >= 60) return "bg-orange-500";
    return "bg-emerald-500";
  };

  const getLoadStatusColor = (percent: number) => {
    if (percent >= 85) return "text-red-500";
    if (percent >= 60) return "text-orange-500";
    return "text-emerald-500";
  };

  const totalQueue = queueMetrics.urgent + queueMetrics.high + queueMetrics.medium + queueMetrics.low;

  return (
    <div className="space-y-4">
      <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 px-1">
        Support Operations Health
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Team Load & Utilization */}
        <Card className="border-none shadow-sm bg-white dark:bg-gray-900 rounded-[16px] overflow-hidden">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-2 text-indigo-600">
              <Users className="h-4 w-4" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Team Load & Utilization</h4>
            </div>

            <div className="space-y-4">
              {capacity.slice(0, 4).map((agent) => (
                <div key={agent.name} className="space-y-1.5">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{agent.name}</span>
                    <span className={cn("text-[10px] font-bold", getLoadStatusColor(agent.capacityPercent))}>
                      {agent.capacityPercent}% · {agent.status}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full transition-all duration-1000", getLoadColor(agent.capacityPercent))} 
                      style={{ width: `${agent.capacityPercent}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-slate-400">Aggregate</span>
                <span className="text-xs font-bold text-orange-500">{aggregateLoad}% (Optimal)</span>
              </div>
              <p className="text-[10px] font-medium text-slate-400">
                Bottleneck: Complex tickets ({capacity[0]?.avgResolutionTime || '2.3h'} avg vs 1.8h baseline)
              </p>
              <div className="flex gap-2 pt-1">
                <Button variant="secondary" className="h-8 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-[10px] uppercase tracking-wider">
                  Reassign
                </Button>
                <Button variant="secondary" className="h-8 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-[10px] uppercase tracking-wider">
                  Add Agent
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right: Queue Breakdown */}
        <Card className="border-none shadow-sm bg-white dark:bg-gray-900 rounded-[16px] overflow-hidden">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-2 text-indigo-600">
              <BarChart3 className="h-4 w-4" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Queue Breakdown</h4>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Priority Distribution</p>
              <div className="space-y-3">
                {[
                  { label: 'Urgent', count: queueMetrics.urgent, color: 'bg-red-500' },
                  { label: 'High', count: queueMetrics.high, color: 'bg-orange-500' },
                  { label: 'Medium', count: queueMetrics.medium, color: 'bg-yellow-500' },
                  { label: 'Low', count: queueMetrics.low, color: 'bg-slate-300' },
                ].map((p) => (
                  <div key={p.label} className="flex items-center gap-4">
                    <span className="text-xs font-bold text-slate-900 dark:text-white w-14">{p.label}</span>
                    <div className="flex-1 h-1 bg-slate-100 dark:bg-slate-800 rounded-full relative">
                      <div 
                        className={cn("absolute left-0 top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full shadow-sm", p.color)}
                        style={{ left: `${Math.min(95, (p.count / (totalQueue || 1)) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-400 w-6 text-right">{p.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aging Analysis</p>
              <div className="space-y-2">
                {queueMetrics.aging.map((a) => (
                  <div key={a.label} className="flex justify-between items-center">
                    <span className="text-xs font-medium text-slate-400">{a.label}</span>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-xs font-bold", a.alert ? "text-red-500" : "text-slate-900 dark:text-white")}>
                        {a.count} tickets
                      </span>
                      {a.alert && <AlertTriangle className="h-3 w-3 text-red-500" />}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-1">
                <Button variant="secondary" className="h-8 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-[10px] uppercase tracking-wider">
                  View Queue
                </Button>
                <Button variant="secondary" className="h-8 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-[10px] uppercase tracking-wider">
                  Prioritize
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OperationsOverview;