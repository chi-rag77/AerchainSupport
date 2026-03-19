"use client";

import React, { useState, useEffect } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { 
  Loader2, Target, RefreshCw, Brain, Sparkles, 
  LayoutDashboard, BarChart3, Repeat, Zap, ShieldAlert,
  TrendingUp, TrendingDown, Clock, ArrowRight, Info
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PulseData } from "@/features/customer-pulse/types";
import { toast } from 'sonner';
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { invokeEdgeFunction } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SmartCustomerSelector from "@/components/customer-pulse/SmartCustomerSelector";
import SnapshotStrip from "@/components/customer-pulse/SnapshotStrip";
import BehavioralTimeline from "@/components/customer-pulse/BehavioralTimeline";
import AIInsightPanel from "@/components/customer-pulse/AIInsightPanel";
import RecurringIssueDetector from "@/components/customer-pulse/RecurringIssueDetector";
import ActionCenter from "@/components/customer-pulse/ActionCenter";

const CustomerPulse = () => {
  const { session } = useSupabase();
  const user = session?.user;
  const queryClient = useQueryClient();

  const [selectedCustomer, setSelectedCustomer] = useState<string>("Danone");
  const [viewMode, setViewMode] = useState<'summary' | 'detailed' | 'trend'>('summary');

  const { data, isLoading, isFetching, refetch } = useQuery<PulseData, Error>({
    queryKey: ["customerPulse", selectedCustomer],
    queryFn: () => invokeEdgeFunction('get-customer-pulse', {
      method: 'POST',
      body: { customerName: selectedCustomer },
    }),
    enabled: !!selectedCustomer,
    staleTime: 15 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F6F8FB] dark:bg-gray-950">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-2xl animate-pulse" />
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 relative z-10" />
        </div>
        <p className="mt-6 font-black text-muted-foreground uppercase tracking-[0.3em] text-[10px] animate-pulse">
          Synthesizing Intelligence...
        </p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <TooltipProvider>
      <div className="flex-1 flex flex-col p-8 space-y-10 bg-[#F6F8FB] dark:bg-gray-950 min-h-screen overflow-y-auto">
        
        {/* Sticky Header: Context Engine */}
        <div className="sticky top-0 z-30 flex flex-col md:flex-row md:items-center justify-between gap-6 py-4 bg-[#F6F8FB]/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 -mx-8 px-8">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
                <Target className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-black tracking-tight">Customer Pulse</h1>
            </div>
            <Separator orientation="vertical" className="h-8" />
            <SmartCustomerSelector 
              selectedCustomer={selectedCustomer} 
              onSelect={setSelectedCustomer} 
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center p-1 bg-gray-200/50 dark:bg-gray-800/50 rounded-xl border border-white/20">
              {(['summary', 'detailed', 'trend'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={cn(
                    "px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                    viewMode === mode ? "bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-white" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {mode}
                </button>
              ))}
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => refetch()} 
              disabled={isFetching}
              className="rounded-xl h-11 w-11 border-none bg-white dark:bg-gray-900 shadow-sm"
            >
              <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
            </Button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCustomer}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-12"
          >
            {/* 1. Hero Snapshot */}
            <SnapshotStrip data={data} />

            {/* 2. Main Intelligence Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left: Behavioral & Composition (8 cols) */}
              <div className="lg:col-span-8 space-y-8">
                <BehavioralTimeline data={data.timeline} />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Issue Composition (Smart Breakdown) */}
                  <Card className="border-none shadow-glass rounded-[32px] bg-white dark:bg-gray-800 p-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Issue Composition</h4>
                      <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-tighter">Smart Breakdown</Badge>
                    </div>
                    <div className="space-y-6">
                      {[
                        { label: 'Query', percent: 41, trend: 12, color: 'bg-indigo-600' },
                        { label: 'Bug', percent: 32, trend: 0, color: 'bg-rose-500' },
                        { label: 'Requirement', percent: 27, trend: -5, color: 'bg-amber-500' },
                      ].map((item) => (
                        <div key={item.label} className="space-y-2">
                          <div className="flex justify-between items-end">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black">{item.label}</span>
                              <span className={cn(
                                "text-[10px] font-bold",
                                item.trend > 0 ? "text-rose-500" : item.trend < 0 ? "text-green-500" : "text-muted-foreground"
                              )}>
                                {item.trend !== 0 && (item.trend > 0 ? '↑' : '↓')} {Math.abs(item.trend)}%
                              </span>
                            </div>
                            <span className="text-lg font-black">{item.percent}%</span>
                          </div>
                          <div className="h-2 w-full bg-gray-100 dark:bg-gray-900 rounded-full overflow-hidden">
                            <div className={cn("h-full rounded-full", item.color)} style={{ width: `${item.percent}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Resolution Efficiency */}
                  <Card className="border-none shadow-glass rounded-[32px] bg-white dark:bg-gray-800 p-8 space-y-6">
                    <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Resolution Efficiency</h4>
                    <div className="space-y-8">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Avg Resolution Time</p>
                          <p className="text-3xl font-black tracking-tighter">{data.efficiency.avgResolutionTime}</p>
                        </div>
                        <div className="h-12 w-px bg-gray-100 dark:bg-gray-800" />
                        <div className="space-y-1 text-right">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">SLA Compliance</p>
                          <p className="text-3xl font-black tracking-tighter text-indigo-600">{data.efficiency.slaCompliance}%</p>
                        </div>
                      </div>
                      <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/50 flex items-center gap-3">
                        <TrendingDown className="h-4 w-4 text-rose-600" />
                        <p className="text-[11px] font-bold text-rose-900 dark:text-rose-200 uppercase tracking-tighter">
                          Trend: {data.efficiency.trendReason}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Right: AI Insight Panel (4 cols) */}
              <div className="lg:col-span-4">
                <AIInsightPanel insights={data.aiInsights} />
              </div>
            </div>

            {/* 3. Pattern Intelligence */}
            <RecurringIssueDetector issues={data.recurringIssues} />

            {/* 4. Agent Intelligence */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 px-2">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                  <Zap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-black tracking-tight">Contextual Agent Performance</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {data.agents.map((agent) => (
                  <Card key={agent.name} className="border-none shadow-glass rounded-[28px] bg-white dark:bg-gray-800 p-8 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-indigo-500/20">
                        {agent.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-lg font-black tracking-tight">{agent.name}</h4>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Primary Agent</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Efficiency</span>
                        <p className="text-xl font-black text-indigo-600">{agent.efficiency}%</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Resolved</span>
                        <p className="text-xl font-black">{agent.resolved}</p>
                      </div>
                    </div>
                    <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{agent.strength}</span>
                      </div>
                      <div className="flex items-center gap-2 text-amber-600">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{agent.concern}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* 5. Decision Layer */}
            <ActionCenter actions={data.actions} />

            {/* 6. Comparison Footer */}
            <div className="p-10 rounded-[40px] bg-white dark:bg-gray-900 shadow-glass border border-white/20 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-2">
                <h3 className="text-2xl font-black tracking-tight">Compare with Last Week</h3>
                <p className="text-sm font-medium text-muted-foreground">Strategic movement across key operational pillars.</p>
              </div>
              <div className="flex flex-wrap gap-12">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tickets</p>
                  <p className={cn("text-2xl font-black tracking-tighter", data.comparison.ticketsTrend > 0 ? 'text-rose-600' : 'text-green-600')}>
                    {data.comparison.ticketsTrend > 0 ? '↑' : '↓'} {Math.abs(data.comparison.ticketsTrend)}%
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Resolution</p>
                  <p className={cn("text-2xl font-black tracking-tighter", data.comparison.resolutionTrend >= 0 ? 'text-green-600' : 'text-rose-600')}>
                    {data.comparison.resolutionTrend >= 0 ? '↑' : '↓'} {Math.abs(data.comparison.resolutionTrend)}%
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Recurring</p>
                  <p className={cn("text-2xl font-black tracking-tighter", data.comparison.recurringTrend > 0 ? 'text-rose-600' : 'text-green-600')}>
                    {data.comparison.recurringTrend > 0 ? '↑' : '↓'} {Math.abs(data.comparison.recurringTrend)}%
                  </p>
                </div>
              </div>
              <Button className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[10px] h-14 px-10 shadow-xl shadow-indigo-500/20 gap-3">
                Generate Full Report <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <p className="text-xs font-black uppercase tracking-[0.3em] opacity-30">End of Intelligence Brief</p>
            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </TooltipProvider>
  );
};

export default CustomerPulse;