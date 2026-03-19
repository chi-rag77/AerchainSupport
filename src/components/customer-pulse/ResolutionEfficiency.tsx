"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from '@/lib/utils';
import { 
  Zap, ShieldAlert, Clock, 
  CheckCircle2, AlertCircle, 
  BarChart3, ListFilter
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ResolutionEfficiencyProps {
  data: any;
  timeline: any[];
  summary: string;
  mode?: 'summary' | 'ai';
}

const ResolutionEfficiency = ({ data, timeline, summary, mode = 'summary' }: ResolutionEfficiencyProps) => {
  const { 
    avg_resolution_time = 0, 
    sla_compliance = 0, 
    first_response_time = 0, 
    efficiency_score = 0, 
    bottlenecks = []
  } = data || {};

  const metrics = [
    { label: "Avg Resolution", value: `${avg_resolution_time}h`, icon: Clock, color: "text-blue-600" },
    { label: "SLA Compliance", value: `${sla_compliance}%`, icon: ShieldAlert, color: sla_compliance > 85 ? "text-green-600" : "text-amber-600" },
    { label: "First Response", value: `${first_response_time}h`, icon: Zap, color: "text-indigo-600" },
  ];

  return (
    <Card className="border-none shadow-glass rounded-[32px] bg-white dark:bg-gray-900 overflow-hidden">
      <CardHeader className="p-8 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-xl font-black tracking-tight">Resolution Efficiency</CardTitle>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Efficiency Score</p>
              <p className={cn("text-lg font-black", efficiency_score > 80 ? "text-green-600" : "text-amber-600")}>
                {efficiency_score} <span className="text-xs text-muted-foreground">/ 100</span>
              </p>
            </div>
            <div className={cn(
              "h-10 w-10 rounded-xl flex items-center justify-center border-2",
              efficiency_score > 80 ? "border-green-100 bg-green-50 text-green-600" : "border-amber-100 bg-amber-50 text-amber-600"
            )}>
              {efficiency_score > 80 ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-8 pt-6 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Weekly Performance Trend</h4>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                  <span className="text-[9px] font-bold text-muted-foreground uppercase">Created</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  <span className="text-[9px] font-bold text-muted-foreground uppercase">Resolved</span>
                </div>
              </div>
            </div>
            
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeline || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                    itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="created" stroke="#6366F1" strokeWidth={3} dot={{ r: 4, strokeWidth: 0, fill: '#6366F1' }} />
                  <Line type="monotone" dataKey="resolved" stroke="#10B981" strokeWidth={3} dot={{ r: 4, strokeWidth: 0, fill: '#10B981' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-8">
            <div className="grid grid-cols-3 gap-3">
              {metrics.map((m) => (
                <div key={m.label} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-border/50 space-y-2">
                  <m.icon className={cn("h-4 w-4", m.color)} />
                  <div className="space-y-0.5">
                    <p className="text-sm font-black tracking-tight">{m.value}</p>
                    <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-tighter">{m.label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <BarChart3 className="h-3.5 w-3.5" /> Top Delay Drivers
              </h4>
              <div className="space-y-4">
                {bottlenecks.map((b: any) => (
                  <div key={b.type} className="space-y-1.5">
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-bold text-foreground/80">{b.type}</span>
                      <span className="text-[10px] font-black text-indigo-600">{b.percentage}%</span>
                    </div>
                    <Progress value={b.percentage} className="h-1.5" indicatorClassName="bg-indigo-600" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Deterministic Summary Layer */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ListFilter className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Efficiency Summary</span>
          </div>
          <p className={cn(
            "text-sm font-bold leading-relaxed text-foreground/80",
            mode === 'summary' && "line-clamp-2"
          )}>
            {summary}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResolutionEfficiency;