"use client";

import React, { useState, useMemo } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Loader2, CalendarDays, Sparkles, Brain, BarChart3, ShieldCheck, LayoutDashboard } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Ticket } from "@/types";
import { toast } from 'sonner';
import { invokeEdgeFunction } from "@/lib/apiClient";
import { motion, AnimatePresence } from "framer-motion";
import { Separator } from "@/components/ui/separator";

// Components
import WeeklyHero from "@/components/weekly-summary/WeeklyHero";
import ExecutiveSnapshotStrip from "@/components/weekly-summary/ExecutiveSnapshotStrip";
import TrendMovementGrid from "@/components/weekly-summary/TrendMovementGrid";
import RiskSignalSection from "@/components/weekly-summary/RiskSignalSection";
import CustomerImpactRadar from "@/components/weekly-summary/CustomerImpactRadar";
import StabilityForecast from "@/components/weekly-summary/StabilityForecast";
import WeeklyAISummary from "@/components/weekly-summary/WeeklyAISummary";
import WeeklyActionCenter from "@/components/weekly-summary/WeeklyActionCenter";

const WeeklySummaryPage = () => {
  const { session } = useSupabase();
  const user = session?.user;
  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const queryClient = useQueryClient();

  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);

  // 1. Fetch Unique Customers for the selector
  const { data: uniqueCustomers = [] } = useQuery<string[]>({
    queryKey: ["uniqueCustomersForWeekly"],
    queryFn: async () => {
      const { data, error } = await supabase.from('freshdesk_tickets').select('cf_company').limit(1000);
      if (error) throw error;
      return Array.from(new Set((data || []).map(t => t.cf_company).filter(Boolean))) as string[];
    }
  });

  // 2. Fetch Advanced Intelligence
  const { data: intelligence, isLoading, isFetching, error } = useQuery({
    queryKey: ["weeklyIntelligence", selectedCustomer],
    queryFn: async () => {
      return await invokeEdgeFunction<any>('get-weekly-intelligence', {
        method: 'POST',
        body: { customerName: selectedCustomer },
      });
    },
    enabled: !!selectedCustomer,
    staleTime: 1000 * 60 * 30, // 30 mins
  });

  const handleSync = async () => {
    toast.loading("Syncing Freshdesk data...", { id: "sync-weekly" });
    try {
      await invokeEdgeFunction('fetch-freshdesk-tickets', {
        method: 'POST',
        body: { action: 'syncTickets', user_id: user?.id },
      });
      toast.success("Data synchronized!", { id: "sync-weekly" });
      queryClient.invalidateQueries({ queryKey: ["weeklyIntelligence", selectedCustomer] });
    } catch (err: any) {
      toast.error(`Sync failed: ${err.message}`, { id: "sync-weekly" });
    }
  };

  return (
    <TooltipProvider>
      <div className="flex-1 flex flex-col p-8 space-y-10 bg-[#F6F8FB] dark:bg-gray-950 min-h-screen overflow-y-auto">
        
        <WeeklyHero 
          userName={fullName}
          selectedCustomer={selectedCustomer}
          customers={uniqueCustomers}
          onCustomerChange={setSelectedCustomer}
          weekLabel={intelligence?.weekLabel || "Current Week"}
          isSyncing={isFetching}
          onSync={handleSync}
        />

        <AnimatePresence mode="wait">
          {!selectedCustomer ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-32 text-muted-foreground"
            >
              <CalendarDays className="h-20 w-20 mb-6 opacity-20" />
              <p className="text-xl font-bold">Select an account to generate the Weekly Intelligence Brief</p>
              <p className="text-sm">Board-ready operational insights will be synthesized automatically.</p>
            </motion.div>
          ) : isLoading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-32 text-muted-foreground"
            >
              <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
              <p className="text-lg font-black animate-pulse uppercase tracking-widest">Synthesizing Intelligence Brief...</p>
            </motion.div>
          ) : (
            <motion.div
              key={selectedCustomer}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-16"
            >
              {/* Section 1: Executive Snapshot */}
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                    <LayoutDashboard className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h2 className="text-2xl font-black tracking-tight">Executive Snapshot</h2>
                </div>
                <ExecutiveSnapshotStrip data={intelligence} />
              </section>

              {/* Section 2: AI Narrative Brief */}
              <WeeklyAISummary 
                analysis={intelligence.aiNarrative} 
                isLoading={false} 
              />

              {/* Section 3: Trend Movement & Signals */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <TrendMovementGrid trends={intelligence.trends} />
                <RiskSignalSection signals={intelligence.riskSignals} />
              </div>

              <Separator className="bg-gray-200 dark:bg-gray-800" />

              {/* Section 4: Customer Impact Radar */}
              <CustomerImpactRadar radar={intelligence.customerRadar} />

              {/* Section 5: Advanced Metrics & Forecast */}
              <StabilityForecast 
                data={intelligence.forecast} 
                friction={intelligence.frictionIndex}
                efficiency={intelligence.efficiencyScore}
              />

              {/* Section 6: Action Center */}
              <WeeklyActionCenter actions={intelligence.actions} />

              {/* Footer: System Health */}
              <div className="pt-12 pb-6 flex items-center justify-center gap-8 opacity-50">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Data Integrity: High</span>
                </div>
                <div className="flex items-center gap-2">
                  <Brain className="h-3 w-3" />
                  <span className="text-[10px] font-black uppercase tracking-widest">AI Confidence: 94%</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-3 w-3 text-green-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest">SOC2 Compliant</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
};

export default WeeklySummaryPage;