"use client";

import React, { useState, useMemo } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { 
  Target, RefreshCw, Activity, Mail, LayoutDashboard, Zap
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PulseData } from "@/features/customer-pulse/types";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { invokeEdgeFunction } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import SmartCustomerSelector from "@/components/customer-pulse/SmartCustomerSelector";
import SnapshotStrip from "@/components/customer-pulse/SnapshotStrip";
import BehavioralTimeline from "@/components/customer-pulse/BehavioralTimeline";
import ResolutionEfficiency from "@/components/customer-pulse/ResolutionEfficiency";
import AgentPerformancePulse from "@/components/customer-pulse/AgentPerformancePulse";
import IntelligenceLoader from "@/components/customer-pulse/IntelligenceLoader";
import WeeklyDigestSection from "@/components/customer-pulse/WeeklyDigestSection";

type PulseTab = 'intelligence' | 'digest';

const CustomerPulse = () => {
  const { session } = useSupabase();
  const user = session?.user;
  const queryClient = useQueryClient();

  const [selectedCustomer, setSelectedCustomer] = useState<string>("Danone");
  const [activeTab, setActiveTab] = useState<PulseTab>('intelligence');

  const { data, isLoading, isFetching, refetch } = useQuery<PulseData, Error>({
    queryKey: ["customerPulse", selectedCustomer],
    queryFn: () => invokeEdgeFunction('get-customer-pulse', {
      method: 'POST',
      body: { customerName: selectedCustomer },
    }),
    enabled: !!selectedCustomer,
    staleTime: 15 * 60 * 1000,
  });

  const behavioralSummary = useMemo(() => {
    if (!data?.timeline || data.timeline.length === 0) return "";
    const parts = data.timeline.map((day, i) => {
      if (i === 0) return `${day.day} started with ${day.created} tickets`;
      const prev = data.timeline[i - 1];
      if (day.created > prev.created) return `${day.day.toLowerCase()} peaked`;
      if (day.created < prev.created) return `${day.day.toLowerCase()} was lower`;
      return `${day.day.toLowerCase()} remained steady`;
    });
    return parts.join(", ") + ".";
  }, [data?.timeline]);

  const efficiencySummary = useMemo(() => {
    if (!data?.efficiency || !data?.timeline) return "";
    const totalCreated = data.timeline.reduce((acc, d) => acc + d.created, 0);
    const totalResolved = data.timeline.reduce((acc, d) => acc + d.resolved, 0);
    const pace = totalResolved >= totalCreated ? "keeping pace with" : "trailing";
    return `Resolution volume is ${pace} incoming demand. Average resolution time stands at ${data.efficiency.avg_resolution_time}h with ${data.efficiency.sla_compliance}% SLA compliance.`;
  }, [data?.efficiency, data?.timeline]);

  if (isLoading) return <IntelligenceLoader />;
  if (!data) return null;

  return (
    <TooltipProvider>
      <div className="flex-1 flex flex-col p-8 space-y-10 bg-[#F6F8FB] dark:bg-gray-950 min-h-screen overflow-y-auto">
        
        {/* Sticky Header */}
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

          <div className="flex items-center gap-4">
            {/* Tab Switcher */}
            <div className="flex items-center p-1 bg-gray-200/50 dark:bg-gray-800/50 rounded-full border border-white/20">
              <button
                onClick={() => setActiveTab('intelligence')}
                className={cn(
                  "relative flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                  activeTab === 'intelligence' ? "text-white" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {activeTab === 'intelligence' && (
                  <motion.div layoutId="pulse-tab" className="absolute inset-0 bg-indigo-600 rounded-full shadow-md" />
                )}
                <LayoutDashboard className="relative z-10 h-3.5 w-3.5" />
                <span className="relative z-10">Intelligence</span>
              </button>
              <button
                onClick={() => setActiveTab('digest')}
                className={cn(
                  "relative flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                  activeTab === 'digest' ? "text-white" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {activeTab === 'digest' && (
                  <motion.div layoutId="pulse-tab" className="absolute inset-0 bg-indigo-600 rounded-full shadow-md" />
                )}
                <Mail className="relative z-10 h-3.5 w-3.5" />
                <span className="relative z-10">Weekly Digest</span>
              </button>
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
          {activeTab === 'intelligence' ? (
            <motion.div
              key="intelligence"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <SnapshotStrip data={data} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                <BehavioralTimeline data={data.timeline} summary={behavioralSummary} />
                <ResolutionEfficiency data={data.efficiency} timeline={data.timeline} summary={efficiencySummary} />
              </div>
              <AgentPerformancePulse primary={data.agentPerformance.primary} team={data.agentPerformance.team} />
            </motion.div>
          ) : (
            <motion.div
              key="digest"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <WeeklyDigestSection customerName={selectedCustomer} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30">End of Intelligence Brief</p>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default CustomerPulse;