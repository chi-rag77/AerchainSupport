"use client";

import React, { useState, useMemo } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Loader2, CalendarDays, Sparkles, Brain, LayoutDashboard, AlertCircle, RefreshCw, Clock, CheckCircle2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { invokeEdgeFunction } from "@/lib/apiClient";
import { motion, AnimatePresence } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

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

  const { data: uniqueCustomers = [] } = useQuery<string[]>({
    queryKey: ["uniqueCustomersForWeekly"],
    queryFn: async () => {
      const { data, error } = await supabase.from('freshdesk_tickets').select('cf_company').limit(1000);
      if (error) throw error;
      return Array.from(new Set((data || []).map(t => t.cf_company).filter(Boolean))) as string[];
    }
  });

  // Deterministic Metrics (Always available)
  const { data: intelligence, isLoading, isFetching } = useQuery({
    queryKey: ["weeklyIntelligence", selectedCustomer],
    queryFn: async () => {
      return await invokeEdgeFunction<any>('get-weekly-intelligence', {
        method: 'POST',
        body: { customerName: selectedCustomer, skipAI: true }, // Tell backend to skip AI
      });
    },
    enabled: !!selectedCustomer,
    staleTime: 1000 * 60 * 30,
  });

  // AI Narrative (Manual Trigger)
  const generateAIMutation = useMutation({
    mutationFn: async () => {
      return await invokeEdgeFunction<any>('get-weekly-intelligence', {
        method: 'POST',
        body: { customerName: selectedCustomer, forceRefresh: true },
      });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["weeklyIntelligence", selectedCustomer], data);
      toast.success("AI Narrative synthesized!");
    },
    onError: (err: any) => toast.error(`AI failed: ${err.message}`)
  });

  const handleSync = async () => {
    toast.loading("Refreshing metrics...", { id: "sync-weekly" });
    queryClient.invalidateQueries({ queryKey: ["weeklyIntelligence", selectedCustomer] });
    setTimeout(() => toast.success("Metrics updated!", { id: "sync-weekly" }), 1000);
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-32 text-muted-foreground">
              <CalendarDays className="h-20 w-20 mb-6 opacity-20" />
              <p className="text-xl font-bold">Select an account to view the Weekly Brief</p>
            </motion.div>
          ) : isLoading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-32 text-muted-foreground">
              <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
              <p className="text-lg font-black animate-pulse uppercase tracking-widest">Loading Metrics...</p>
            </motion.div>
          ) : (
            <motion.div key={selectedCustomer} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-16">
              
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                      <LayoutDashboard className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight">Executive Snapshot</h2>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      <Clock className="h-3 w-3" />
                      Generated {format(new Date(intelligence.generatedAt), 'HH:mm')}
                    </div>
                  </div>
                </div>
                <ExecutiveSnapshotStrip data={intelligence} />
              </section>

              {/* AI Narrative Trigger */}
              {!intelligence.aiNarrative ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-10 rounded-[32px] border-2 border-dashed border-indigo-200 bg-indigo-50/30 flex flex-col items-center gap-4 text-center">
                  <Brain className="h-12 w-12 text-indigo-400" />
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-indigo-900">Synthesize AI Narrative</h3>
                    <p className="text-sm text-indigo-700/70 max-w-md">Generate a deep-dive behavioral analysis and executive summary for this week's activity.</p>
                  </div>
                  <Button 
                    onClick={() => generateAIMutation.mutate()} 
                    disabled={generateAIMutation.isPending}
                    className="bg-indigo-600 hover:bg-indigo-700 gap-2 rounded-full px-10 h-12 font-bold shadow-lg shadow-indigo-500/20"
                  >
                    {generateAIMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                    Generate AI Brief
                  </Button>
                </motion.div>
              ) : (
                <WeeklyAISummary analysis={intelligence.aiNarrative} isLoading={false} />
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <TrendMovementGrid trends={intelligence.trends || []} />
                <RiskSignalSection signals={intelligence.riskSignals || []} />
              </div>

              <Separator className="bg-gray-200 dark:bg-gray-800" />

              <CustomerImpactRadar radar={intelligence.customerRadar || []} />

              <StabilityForecast 
                data={intelligence.forecast} 
                friction={intelligence.frictionIndex}
                efficiency={intelligence.efficiencyScore}
              />

              <WeeklyActionCenter actions={intelligence.actions || []} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
};

export default WeeklySummaryPage;