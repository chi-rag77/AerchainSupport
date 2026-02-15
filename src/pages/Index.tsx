"use client";

import React, { useState } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DashboardProvider, useDashboard } from "@/features/dashboard/DashboardContext";
import { useExecutiveDashboard } from "@/features/dashboard/hooks/useExecutiveDashboard";
import ExecutiveHero from "@/components/dashboard/ExecutiveHero";
import KPISection from "@/components/dashboard/KPISection";
import AIInsightStrip from "@/components/dashboard/AIInsightStrip";
import OperationalIntelligence from "@/components/dashboard/OperationalIntelligence";
import ActiveRiskSection from "@/components/dashboard/ActiveRiskSection";
import ViewModeSelector from "@/components/dashboard/ViewModeSelector";
import DashboardFilterBar from "@/components/dashboard/DashboardFilterBar";
import TicketDetailModal from "@/components/TicketDetailModal";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

const DashboardContent = () => {
  const { session } = useSupabase();
  const user = session?.user;
  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const queryClient = useQueryClient();

  const { viewMode, dateRange } = useDashboard();
  const { data, tickets, uniqueCompanies, isLoading, isFetching } = useExecutiveDashboard();
  const [showInsight, setShowInsight] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSync = async () => {
    toast.loading("Syncing Freshdesk data...", { id: "sync-dashboard" });
    try {
      const { error } = await supabase.functions.invoke('fetch-freshdesk-tickets', {
        method: 'POST',
        body: { action: 'syncTickets', user_id: user?.id },
      });
      if (error) throw error;
      toast.success("Data synchronized!", { id: "sync-dashboard" });
      queryClient.invalidateQueries({ queryKey: ['freshdeskTickets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardInsights'] });
      queryClient.invalidateQueries({ queryKey: ['activeRisks'] });
    } catch (err: any) {
      toast.error(`Sync failed: ${err.message}`, { id: "sync-dashboard" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F6F8FB] dark:bg-gray-950">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
        <p className="text-lg font-medium text-muted-foreground">Initializing Executive Intelligence...</p>
      </div>
    );
  }

  const activeInsight = (showInsight && data.insights && data.insights.length > 0) 
    ? data.insights[0] 
    : null;

  return (
    <div className="flex-1 flex flex-col p-8 space-y-8 bg-[#F6F8FB] dark:bg-gray-950 min-h-screen overflow-y-auto">
      {/* Section 1: Executive Hero */}
      <ExecutiveHero 
        userName={fullName}
        slaRiskScore={data.slaRiskScore}
        lastSync={data.lastSync}
        isSyncing={isFetching}
        onSync={handleSync}
        onViewInsights={() => {}} 
      />

      {/* Section 2: View Mode Selector */}
      <div className="flex justify-center">
        <ViewModeSelector />
      </div>

      {/* Section 3: AI Insight Strip */}
      <AIInsightStrip 
        insight={activeInsight}
        onDismiss={() => setShowInsight(false)}
      />

      {/* Section 4: KPI Intelligence */}
      <KPISection 
        metrics={data.kpis}
        isLoading={isLoading}
      />

      {/* Section 5: Global Filter Bar */}
      <DashboardFilterBar uniqueCompanies={uniqueCompanies} />

      {/* Section 6: Dynamic Content based on View Mode */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="space-y-10"
        >
          {(viewMode === 'overview' || viewMode === 'performance') && (
            <OperationalIntelligence 
              summary={data.executiveSummary}
              tickets={tickets}
              startDate={dateRange.from!}
              endDate={dateRange.to!}
            />
          )}

          {(viewMode === 'overview' || viewMode === 'risk') && (
            <ActiveRiskSection onViewTicket={(t) => { setSelectedTicket(t); setIsModalOpen(true); }} />
          )}
        </motion.div>
      </AnimatePresence>

      {selectedTicket && (
        <TicketDetailModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          ticket={selectedTicket}
        />
      )}
    </div>
  );
};

const Index = () => (
  <DashboardProvider>
    <DashboardContent />
  </DashboardProvider>
);

export default Index;