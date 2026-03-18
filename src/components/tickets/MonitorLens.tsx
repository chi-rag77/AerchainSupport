"use client";

import React from 'react';
import { Ticket } from '@/features/tickets/types';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  ShieldAlert, Clock, Users, Zap, TrendingUp, 
  AlertTriangle, CheckCircle2, UserPlus, Flag,
  BarChart3, MessageSquare, Info, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { invokeEdgeFunction } from '@/lib/apiClient';

interface MonitorLensProps {
  ticket: Ticket;
  onAnalyzeRisk: () => void;
}

const MonitorLens = ({ ticket, onAnalyzeRisk }: MonitorLensProps) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['ticketMonitorData', ticket.id],
    queryFn: () => invokeEdgeFunction<any>('get-ticket-monitor-data', {
      body: { ticketId: ticket.id }
    }),
    staleTime: 30000,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-muted-foreground">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        <p className="text-sm font-black uppercase tracking-widest animate-pulse">Aggregating Live Metrics...</p>
      </div>
    );
  }

  if (error || !data) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* 1. Executive Summary Insert */}
      <Card className="border-none shadow-glass rounded-[24px] bg-indigo-600 text-white overflow-hidden">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-indigo-200" />
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Manager Brief</span>
            </div>
            <Badge className="bg-white/20 text-white border-none font-bold text-[9px] uppercase">Live Analysis</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <h4 className="text-lg font-bold leading-tight">Issue: {ticket.subject}</h4>
              <p className="text-xs text-indigo-100 font-medium">
                Impact: Potential delay in <span className="font-black">{ticket.cf_module || 'core'}</span> operations for <span className="font-black">{ticket.cf_company}</span>.
              </p>
            </div>
            <div className="flex items-center gap-4 md:justify-end">
              <div className="text-right">
                <p className="text-[9px] font-black uppercase tracking-widest text-indigo-200">Severity</p>
                <p className="text-sm font-bold">{ticket.priority}</p>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div className="text-right">
                <p className="text-[9px] font-black uppercase tracking-widest text-indigo-200">Status</p>
                <p className="text-sm font-bold">{ticket.status}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 2. SLA & Risk Panel */}
        <Card className="border-none shadow-sm rounded-[24px] bg-white dark:bg-gray-800 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-rose-500" /> SLA & Risk
            </h4>
            <Badge className={cn(
              "font-bold text-[10px] uppercase",
              data.sla.status === 'Breached' ? "bg-rose-50 text-rose-700 border-rose-100" :
              data.sla.status === 'At Risk' ? "bg-amber-50 text-amber-700 border-amber-100" :
              "bg-green-50 text-green-700 border-green-100"
            )}>
              {data.sla.status}
            </Badge>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
                <span>SLA Consumption</span>
                <span className={cn(data.sla.consumedPercent > 80 ? "text-rose-600" : "text-indigo-600")}>
                  {data.sla.consumedPercent}% Consumed
                </span>
              </div>
              <Progress 
                value={data.sla.consumedPercent} 
                className="h-1.5" 
                indicatorClassName={cn(
                  data.sla.consumedPercent > 80 ? "bg-rose-500" : 
                  data.sla.consumedPercent > 50 ? "bg-amber-500" : "bg-indigo-500"
                )} 
              />
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/50">
                <AlertTriangle className="h-4 w-4 text-rose-600" />
                <span className="text-xs font-bold text-rose-900 dark:text-rose-200">
                  {ticket.priority} priority + {data.sla.ageDays} days aging
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50">
                <Users className="h-4 w-4 text-indigo-600" />
                <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                  Account Sensitivity: {ticket.priority === 'Urgent' ? 'Critical' : 'Standard'}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* 3. Team Performance Snapshot */}
        <Card className="border-none shadow-sm rounded-[24px] bg-white dark:bg-gray-800 p-6 space-y-6">
          <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Users className="h-4 w-4 text-indigo-600" /> Team Performance
          </h4>
          
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center font-bold text-indigo-600">
                  {data.team.assignee.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold">{data.team.assignee}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">Primary Owner</p>
                </div>
              </div>
              <Badge variant="outline" className="font-bold text-[10px] uppercase">Active</Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-border">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Avg Res Time</p>
                <p className="text-sm font-bold">{data.team.avgResolutionTime}</p>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-border">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Current Load</p>
                <p className="text-sm font-bold">{data.team.activeLoad} Tickets</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 4. Similar Issues & Escalation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Similar Issues Cluster</h4>
          <div className="p-5 rounded-[24px] bg-white dark:bg-gray-800 border border-border shadow-sm flex items-center justify-between group cursor-pointer hover:border-indigo-300 transition-all">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold">{data.clusters.count} similar issues</p>
                <p className="text-[10px] text-muted-foreground font-medium">Detected in {ticket.cf_module} module</p>
              </div>
            </div>
            <Badge className="bg-indigo-600 text-white border-none font-bold text-[10px]">View Cluster</Badge>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Escalation Insights</h4>
          <div className="p-5 rounded-[24px] bg-white dark:bg-gray-800 border border-border shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <TrendingUp className={cn("h-4 w-4", data.escalation.trend > 0 ? "text-rose-500" : "text-green-500")} />
              <p className="text-xs font-bold">
                Escalation frequency is <span className={data.escalation.trend > 0 ? "text-rose-600" : "text-green-600"}>
                  {data.escalation.trend > 0 ? 'increasing' : 'decreasing'}
                </span> ({Math.abs(data.escalation.trend)}%)
              </p>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <p className="text-xs font-bold">{data.escalation.recentCount} escalations for this account in 30d.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Decision Actions */}
      <div className="pt-6 border-t border-border">
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="rounded-xl font-bold text-xs gap-2 h-11 px-6 border-rose-200 text-rose-600 hover:bg-rose-50">
            <ShieldAlert className="h-4 w-4" /> Escalate
          </Button>
          <Button variant="outline" className="rounded-xl font-bold text-xs gap-2 h-11 px-6">
            <UserPlus className="h-4 w-4" /> Reassign
          </Button>
          <Button variant="outline" className="rounded-xl font-bold text-xs gap-2 h-11 px-6">
            <Flag className="h-4 w-4" /> Prioritize
          </Button>
          <Button onClick={onAnalyzeRisk} className="ml-auto rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-2 h-11 px-8 shadow-lg shadow-indigo-500/20">
            <Zap className="h-4 w-4" /> Analyze Risk
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MonitorLens;