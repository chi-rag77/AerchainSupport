"use client";

import React, { useState } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { 
  Loader2, Target, RefreshCw, Brain, Sparkles, 
  Zap, TrendingDown, ArrowRight, Activity
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PulseData } from "@/features/customer-pulse/types";
import { toast } from 'sonner';
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { invokeEdgeFunction } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import SmartCustomerSelector from "@/components/customer-pulse/SmartCustomerSelector";
import SnapshotStrip from "@/components/customer-pulse/SnapshotStrip";
import BehavioralTimeline from "@/components/customer-pulse/BehavioralTimeline";
import AIInsightPanel from "@/components/customer-pulse/AIInsightPanel";
import RecurringIssueDetector from "@/components/customer-pulse/RecurringIssueDetector";
import ActionCenter from "@/components/customer-pulse/ActionCenter";
import AgentPerformancePulse from "@/components/customer-pulse/AgentPerformancePulse";

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
      <div className="flex-1 flex flex-col p-8 space-y-6 bg-[#F6F8FB] dark:bg-gray-950 min-h-screen overflow-y-auto">
        
        {/* Sticky Header: Context Engine */}
        <div className="sticky top-0 z-30 flex flex-col md:flex-row md:items-center justify-between gap-6 py-3 bg-[#F6F8FB]/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 -mx-8 px-8">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
                <Target className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-black tracking-tight">Customer Pulse</h1>
            </div>
            <Separator orientation="vertical" className="h-6" />
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
                    "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
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
              className="rounded-xl h-10 w-10 border-none bg-white dark:bg-gray-900 shadow-sm"
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
            transition={{ duration: 0.4 }}
            className="space-y-8"
          >
            {/* 1. Hero Snapshot */}
            <SnapshotStrip data={data} />

            {/* 2. Unified Intelligence Grid (12 Columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* LEFT COLUMN (7 cols) - Stacks vertically */}
              <div className="lg:col-span-7 space-y-8">
                {/* Row 1: Timeline */}
                <BehavioralTimeline data={data.timeline} />
                
                {/* Row 2: Composition & Efficiency */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="border-none shadow-glass rounded-[32px] bg-white dark:bg-gray-800 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Issue Composition</h4>
                      <Badge variant="outline" className="text-[8px] font-bold uppercase tracking-tighter border-none bg-gray-50">Smart Breakdown</Badge>
                    </div>
                    <div className="space-y-4">
                      {[
                        { label: 'Query', percent: 41, trend: 12, color: 'bg-indigo-600' },
                        { label: 'Bug', percent: 32, trend: 0, color: 'bg-rose-500' },
                        { label: 'Requirement', percent: 27, trend: -5, color: 'bg-amber-500' },
                      ].map((item) => (
                        <div key={item.label} className="space-y-1.5">
                          <div className="flex justify-between items-end">
                            <span className="text-xs font-black">{item.label}</span>
                            <span className="text-sm font-black">{item.percent}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-900 rounded-full overflow-hidden">
                            <div className={cn("h-full rounded-full", item.color)} style={{ width: `${item.percent}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="border-none shadow-glass rounded-[32px] bg-white dark:bg-gray-800 p-6 space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Resolution Efficiency</h4>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Avg Res Time</p>
                          <p className="text-2xl font-black tracking-tighter">{data.efficiency.avgResolutionTime}</p>
                        </div>
                        <div className="h-10 w-px bg-gray-100 dark:bg-gray-800" />
                        <div className="space-y-0.5 text-right">
                          <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">SLA Compliance</p>
                          <p className="text-2xl font-black tracking-tighter text-indigo-600">{data.efficiency.slaCompliance}%</p>
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/50 flex items-center gap-2">
                        <TrendingDown className="h-3.5 w-3.5 text-rose-600" />
                        <p className="text-[9px] font-bold text-rose-900 dark:text-rose-200 uppercase tracking-tighter">
                          Trend: {data.efficiency.trendReason}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Row 3: Recurring Patterns */}
                <RecurringIssueDetector issues={data.recurringIssues} />
              </div>

              {/* RIGHT COLUMN (5 cols) - Stacks vertically */}
              <div className="lg:col-span-5 space-y-8">
                {/* Row 1: AI Insights (Tall) */}
                <AIInsightPanel insights={data.aiInsights} />

                {/* Row 2: Agent Performance */}
                <AgentPerformancePulse agents={data.agents} />
              </div>
            </div>

            {/* 3. Decision Layer (Full Width) */}
            <ActionCenter actions={data.actions} />

            {/* 4. Comparison Footer */}
            <div className="p-8 rounded-[32px] bg-white dark:bg-gray-900 shadow-glass border border-white/20 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-indigo-50 rounded-xl">
                  <Activity className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-lg font-black tracking-tight">Weekly Comparison</h3>
                  <p className="text-xs font-medium text-muted-foreground">Strategic movement across key operational pillars.</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-10">
                <div className="space-y-0.5">
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Tickets</p>
                  <p className={cn("text-xl font-black tracking-tighter", data.comparison.ticketsTrend > 0 ? 'text-rose-600' : 'text-green-600')}>
                    {data.comparison.ticketsTrend > 0 ? '↑' : '↓'} {Math.abs(data.comparison.ticketsTrend)}%
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Resolution</p>
                  <p className={cn("text-xl font-black tracking-tighter", data.comparison.resolutionTrend >= 0 ? 'text-green-600' : 'text-rose-600')}>
                    {data.comparison.resolutionTrend >= 0 ? '↑' : '↓'} {Math.abs(data.comparison.resolutionTrend)}%
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Recurring</p>
                  <p className={cn("text-xl font-black tracking-tighter", data.comparison.recurringTrend > 0 ? 'text-rose-600' : 'text-green-600')}>
                    {data.comparison.recurringTrend > 0 ? '↑' : '↓'} {Math.abs(data.comparison.recurringTrend)}%
                  </p>
                </div>
              </div>

              <Button className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[9px] h-12 px-8 shadow-xl shadow-indigo-500/20 gap-3">
                Generate Full Report <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30">End of Intelligence Brief</p>
            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </TooltipProvider>
  );
};

export default CustomerPulse;