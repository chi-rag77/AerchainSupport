"use client";

import React, { useState } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useExecutiveDashboard } from "@/features/dashboard/hooks/useExecutiveDashboard";
import ExecutiveHero from "@/components/dashboard/ExecutiveHero";
import KPISection from "@/components/dashboard/KPISection";
import AIInsightStrip from "@/components/dashboard/AIInsightStrip";
import OperationalIntelligence from "@/components/dashboard/OperationalIntelligence";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const Index = () => {
  const { session } = useSupabase();
  const user = session?.user;
  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching } = useExecutiveDashboard();
  const [showInsight, setShowInsight] = useState(true);

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

  // Mock insight for the strip (would come from backend in production)
  const activeInsight = showInsight ? {
    message: "Urgent tickets for 'Cloudnine' have increased by 32% in the last 48 hours. Potential systemic issue detected.",
    type: 'risk' as const,
    severity: 'critical' as const,
    link: "/tickets?company=Cloudnine"
  } : null;

  return (
    <TooltipProvider>
      <div className="flex-1 flex flex-col p-8 space-y-10 bg-[#F6F8FB] dark:bg-gray-950 min-h-screen overflow-y-auto">
        {/* Section 1: Executive Hero */}
        <ExecutiveHero 
          userName={fullName}
          slaRiskScore={data.slaRiskScore}
          lastSync={data.lastSync}
          isSyncing={isFetching}
          onSync={handleSync}
          onViewInsights={() => {}} 
        />

        {/* Section 2: AI Insight Strip */}
        <AIInsightStrip 
          insight={activeInsight}
          onDismiss={() => setShowInsight(false)}
        />

        {/* Section 3: KPI Intelligence */}
        <KPISection 
          metrics={data.kpis}
          isLoading={isLoading}
        />

        {/* Section 4: Operational Intelligence */}
        <OperationalIntelligence 
          summary={data.executiveSummary}
          tickets={[]} // Pass filtered tickets here
          startDate={new Date()} // Pass effective dates
          endDate={new Date()}
        />

        {/* Placeholder for remaining sections */}
        <div className="grid grid-cols-1 gap-10 opacity-50 pointer-events-none">
          <div className="h-48 bg-white dark:bg-gray-800 rounded-[24px] border border-dashed border-gray-300 flex items-center justify-center text-muted-foreground font-medium">
            Active Risk Dashboard (Coming Next)
          </div>
          <div className="h-96 bg-white dark:bg-gray-800 rounded-[24px] border border-dashed border-gray-300 flex items-center justify-center text-muted-foreground font-medium">
            Team Intelligence (Coming Next)
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Index;