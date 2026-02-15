"use client";

import React from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useExecutiveDashboard } from "@/features/dashboard/hooks/useExecutiveDashboard";
import ExecutiveHero from "@/components/dashboard/ExecutiveHero";
import KPISection from "@/components/dashboard/KPISection";
import { Loader2 } from "lucide-react";

const DashboardV2 = () => {
  const { session } = useSupabase();
  const user = session?.user;
  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  const { data, isLoading, isFetching } = useExecutiveDashboard();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F6F8FB] dark:bg-gray-950">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
        <p className="text-lg font-medium text-muted-foreground">Initializing Executive Intelligence...</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex-1 flex flex-col p-8 space-y-10 bg-[#F6F8FB] dark:bg-gray-950 min-h-screen overflow-y-auto">
        {/* Section 1: Executive Hero */}
        <ExecutiveHero 
          userName={fullName}
          slaRiskScore={data.slaRiskScore}
          lastSync={data.lastSync}
          isSyncing={isFetching}
          onSync={() => {}} // To be implemented
          onViewInsights={() => {}} // To be implemented
        />

        {/* Section 2: KPI Intelligence */}
        <KPISection 
          metrics={data.kpis}
          isLoading={isLoading}
        />

        {/* Placeholder for remaining sections */}
        <div className="grid grid-cols-1 gap-10 opacity-50 pointer-events-none">
          <div className="h-24 bg-white dark:bg-gray-800 rounded-[24px] border border-dashed border-gray-300 flex items-center justify-center text-muted-foreground font-medium">
            AI Insight Strip (Coming Next)
          </div>
          <div className="h-96 bg-white dark:bg-gray-800 rounded-[24px] border border-dashed border-gray-300 flex items-center justify-center text-muted-foreground font-medium">
            Operational Intelligence (Coming Next)
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default DashboardV2;