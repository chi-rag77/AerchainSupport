"use client";

import React, { useState, useMemo } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { 
  Loader2, Target, RefreshCw, Brain
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

const CustomerPulse = () => {
  const { session } = useSupabase();
  const user = session?.user;
  const queryClient = useQueryClient();

  const [selectedCustomer, setSelectedCustomer] = useState<string>("Danone");

  const { data, isLoading, isFetching, refetch } = useQuery<PulseData, Error>({
    queryKey: ["customerPulse", selectedCustomer],
    queryFn: () => invokeEdgeFunction('get-customer-pulse', {
      method: 'POST',
      body: { customerName: selectedCustomer },
    }),
    enabled: !!selectedCustomer,
    staleTime: 15 * 60 * 1000,
  });

  // --- Deterministic Logic Engines ---
  
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

        <motion.div
          key={selectedCustomer}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-12"
        >
          <SnapshotStrip data={data} />

          {/* ROW 1: Core Engines */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            <BehavioralTimeline 
              data={data.timeline} 
              summary={behavioralSummary}
            />
            <ResolutionEfficiency 
              data={data.efficiency} 
              timeline={data.timeline} 
              summary={efficiencySummary}
            />
          </div>

          {/* ROW 2: Performance & Intelligence */}
          <div className="space-y-12">
            <AgentPerformancePulse 
              primary={data.agentPerformance.primary}
              team={data.agentPerformance.team}
            />
            
            <div className="h-48 rounded-[32px] border border-dashed border-gray-300 flex items-center justify-center text-muted-foreground font-bold uppercase tracking-widest text-[10px]">
              Next: Decision Layer (“What should we do”)
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30">End of Intelligence Brief</p>
          </div>
        </motion.div>

      </div>
    </TooltipProvider>
  );
};

export default CustomerPulse;