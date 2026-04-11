"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Layers, ArrowRight, ShieldAlert, Clock, UserPlus, Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const OperationsOverview = () => {
  const agents = [
    { name: 'Sarah', load: 92, status: 'Critical' },
    { name: 'Mike', load: 71, status: 'Balanced' },
    { name: 'Priya', load: 45, status: 'Available' },
    { name: 'James', load: 88, status: 'High' },
  ];

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
            <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-none font-bold text-[10px]">74% Aggregate</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-8 pt-4 space-y-8">
          <div className="space-y-5">
            {agents.map((agent) => (
              <div key={agent.name} className="space-y-2">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">{agent.name}</span>
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-widest",
                      agent.status === 'Critical' ? "text-rose-600" : agent.status === 'High' ? "text-amber-600" : "text-green-600"
                    )}>• {agent.status}</span>
                  </div>
                  <span className="text-xs font-black text-indigo-600">{agent.load}%</span>
                </div>
                <Progress value={agent.load} className="h-1.5" indicatorClassName={agent.load > 90 ? "bg-rose-500" : "bg-indigo-600"} />
              </div>
            ))}
          </div>
          <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-border/50 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Bottleneck Detected</p>
              <p className="text-sm font-bold">Complex tickets (2.3h avg vs 1.8h baseline)</p>
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
            <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-none font-bold text-[10px]">149 Active</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-8 pt-4 space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Priority Distribution</h4>
              <div className="space-y-3">
                {[
                  { label: 'Urgent', count: 3, color: 'bg-rose-500' },
                  { label: 'High', count: 12, color: 'bg-orange-500' },
                  { label: 'Medium', count: 45, color: 'bg-amber-500' },
                  { label: 'Low', count: 89, color: 'bg-gray-400' },
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
                {[
                  { label: '> 48h', count: 8, alert: true },
                  { label: '> 24h', count: 23, alert: false },
                  { label: '< 24h', count: 118, alert: false },
                ].map(a => (
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