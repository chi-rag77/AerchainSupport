"use client";

import React, { useState } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { 
  Loader2, Target, RefreshCw
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

            {/* 2. Main Intelligence Grid (7/5 Split) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* LEFT COLUMN (7 cols) */}
              <div className="lg:col-span-7 space-y-8">
                <BehavioralTimeline data={data.timeline} aiInsights={data.aiInsights} />
                
                {/* Placeholder for next modules */}
                <div className="h-48 rounded-[32px] border border-dashed border-gray-300 flex items-center justify-center text-muted-foreground font-bold uppercase tracking-widest text-[10px]">
                  Next: Resolution Efficiency & Composition
                </div>
              </div>

              {/* RIGHT COLUMN (5 cols) */}
              <div className="lg:col-span-5">
                <div className="h-full rounded-[32px] border border-dashed border-gray-300 flex items-center justify-center text-muted-foreground font-bold uppercase tracking-widest text-[10px]">
                  Next: AI Intelligence Brief
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30">End of Intelligence Brief</p>
            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </TooltipProvider>
  );
};

export default CustomerPulse;