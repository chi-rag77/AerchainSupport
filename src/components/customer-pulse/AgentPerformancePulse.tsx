"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  User, Users, Zap, Clock, ShieldAlert, 
  CheckCircle2, AlertCircle, TrendingUp, 
  Sparkles, ArrowRight, BarChart3, Activity
} from 'lucide-react';
import { AgentPerformance, TeamMember } from '@/features/customer-pulse/types';
import { Progress } from '@/components/ui/progress';

interface AgentPerformancePulseProps {
  primary: AgentPerformance;
  team: TeamMember[];
}

const AgentPerformancePulse = ({ primary, team = [] }: AgentPerformancePulseProps) => {
  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'Strong': return "text-green-600 bg-green-50 border-green-100";
      case 'Attention': return "text-amber-600 bg-amber-50 border-amber-100";
      case 'Risk': return "text-rose-600 bg-rose-50 border-rose-100";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getWorkloadColor = (workload: string) => {
    switch (workload) {
      case 'Overloaded': return "text-rose-600";
      case 'High': return "text-amber-600";
      default: return "text-green-600";
    }
  };

  // Ensure primary and its nested arrays exist
  if (!primary) return null;
  const taskMix = primary.taskMix || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 px-2">
        <div className="p-1.5 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20">
          <User className="h-4 w-4 text-white" />
        </div>
        <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Agent Performance Pulse</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        
        {/* LEFT: Primary Agent Control Panel (70%) */}
        <Card className="lg:col-span-7 border-none shadow-glass rounded-[24px] bg-white dark:bg-gray-900 overflow-hidden h-[320px] flex flex-col">
          <CardHeader className="p-6 pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-lg font-black text-indigo-600 shadow-inner">
                  {primary.name?.substring(0, 2).toUpperCase() || '??'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg font-black tracking-tight">{primary.name}</CardTitle>
                    <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-none font-bold text-[8px] uppercase tracking-widest">Primary</Badge>
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Handled {primary.tickets} tickets this week</p>
                </div>
              </div>
              <Badge className={cn("px-3 py-1 rounded-full font-black uppercase tracking-widest text-[9px] border-2", getSignalColor(primary.signal))}>
                Signal: {primary.signal}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-6 pt-4 space-y-6 flex-1 flex flex-col justify-between">
            {/* Visual Metrics Row */}
            <div className="grid grid-cols-3 gap-8">
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Efficiency</span>
                  <span className="text-xs font-black text-indigo-600">{primary.efficiency}%</span>
                </div>
                <Progress value={primary.efficiency} className="h-1.5" indicatorClassName="bg-indigo-600" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">SLA</span>
                  <span className="text-xs font-black text-green-600">{primary.sla}%</span>
                </div>
                <Progress value={primary.sla} className="h-1.5" indicatorClassName="bg-green-500" />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Avg Speed</span>
                <div className="flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-amber-500" />
                  <p className="text-lg font-black tracking-tighter">{primary.avg_time}</p>
                </div>
              </div>
            </div>

            {/* Strength & Concern (Lean) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/50">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
                <p className="text-[11px] font-bold text-green-900 dark:text-green-200 truncate">{primary.strength}</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/50">
                <AlertCircle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                <p className="text-[11px] font-bold text-rose-900 dark:text-rose-200 truncate">{primary.concern}</p>
              </div>
            </div>

            {/* Workload Status */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Workload Status:</span>
                <span className={cn("text-[10px] font-black uppercase tracking-widest", getWorkloadColor(primary.workload))}>
                  {primary.workload}
                </span>
              </div>
              <button className="text-[9px] font-black uppercase tracking-widest text-indigo-600 hover:underline flex items-center gap-1">
                Full Profile <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* RIGHT: Team & Task Mix (30%) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Load Distribution */}
          <Card className="border-none shadow-glass rounded-[24px] bg-white dark:bg-gray-900 p-5 h-[152px] flex flex-col justify-between">
            <h4 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Load Distribution</h4>
            <div className="space-y-3">
              {team.length > 0 ? (
                team.slice(0, 2).map((member) => (
                  <div key={member.name} className="space-y-1">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-bold text-foreground truncate max-w-[100px]">{member.name}</span>
                      <span className="text-[10px] font-black text-indigo-600">{member.percent}%</span>
                    </div>
                    <Progress value={member.percent} className="h-1" indicatorClassName="bg-indigo-600" />
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-muted-foreground italic">No team data</p>
              )}
              {team.length === 1 && (
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-1.5 rounded-lg">
                  <ShieldAlert className="h-3 w-3" />
                  Single point dependency
                </div>
              )}
            </div>
          </Card>

          {/* Task Mix */}
          <Card className="border-none shadow-glass rounded-[24px] bg-white dark:bg-gray-900 p-5 h-[152px] flex flex-col justify-between">
            <h4 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Task Mix</h4>
            <div className="space-y-2.5">
              {taskMix.length > 0 ? (
                taskMix.slice(0, 3).map((task) => (
                  <div key={task.label} className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-muted-foreground">{task.label}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1 bg-gray-50 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-400" style={{ width: `${task.percent}%` }} />
                      </div>
                      <span className="text-[10px] font-black text-foreground">{task.percent}%</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-muted-foreground italic">No task data</p>
              )}
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default AgentPerformancePulse;