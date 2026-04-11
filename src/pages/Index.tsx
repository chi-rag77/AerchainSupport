"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DashboardProvider, useDashboard } from "@/features/dashboard/DashboardContext";
import { useExecutiveDashboard } from "@/features/dashboard/hooks/useExecutiveDashboard";
import ExecutiveHero from "@/components/dashboard/ExecutiveHero";
import DashboardSubbar from "@/components/dashboard/DashboardSubbar";
import KPISection from "@/components/dashboard/KPISection";
import DashboardIntelligenceBrief from "@/components/dashboard/DashboardIntelligenceBrief";
import OperationsOverview from "@/components/dashboard/OperationsOverview";
import CustomerRiskIntelligence from "@/components/dashboard/CustomerRiskIntelligence";
import ProductIntelligence from "@/components/dashboard/ProductIntelligence";
import LiveActivityCenter from "@/components/dashboard/LiveActivityCenter";
import PredictiveForecast from "@/components/dashboard/PredictiveForecast";
import SystemHealthPanel from "@/components/dashboard/SystemHealthPanel";
import DashboardAssistant from "@/components/assistant/DashboardAssistant";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Separator } from "@/components/ui/separator";

const DashboardContent = () => {
  const { session } = useSupabase();
  const queryClient = useQueryClient();
  const { dateRange, filters, setFilters } = useDashboard();
  const { data, tickets, uniqueCompanies, isLoading, isFetching, generateAI } = useExecutiveDashboard();
  
  const user = session?.user;
  const selectedCustomer = filters.company || 'All';

  const handleSync = useCallback(async () => {
    toast.loading("Syncing Freshdesk data...", { id: "sync-dashboard" });
    try {
      const { error } = await supabase.functions.invoke('fetch-freshdesk-tickets', {
        method: 'POST',
        body: { action: 'syncTickets', user_id: user?.id },
      });
      if (error) throw error;
      toast.success("Data synchronized!", { id: "sync-dashboard" });
      queryClient.invalidateQueries({ queryKey: ['freshdeskTickets'] });
      queryClient.invalidateQueries({ queryKey: ['recentTicketsForDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['operationalIntelligence'] });
      queryClient.invalidateQueries({ queryKey: ['activeRisks'] });
      queryClient.invalidateQueries({ queryKey: ['recurringIssueRadar'] });
    } catch (err: any) {
      toast.error(`Sync failed: ${err.message}`, { id: "sync-dashboard" });
    }
  }, [user?.id, queryClient]);

  const handleCustomerFilterChange = useCallback((value: string) => {
    if (value === 'All') {
      const newFilters = { ...filters };
      delete newFilters.company;
      setFilters(newFilters);
    } else {
      setFilters({ ...filters, company: value });
    }
  }, [filters, setFilters]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F6F8FB] dark:bg-gray-950">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
        <p className="text-lg font-black uppercase tracking-widest text-muted-foreground">Initializing Executive Intelligence...</p>
      </div>
    );
  }

  // Prepare queue metrics for OperationsOverview
  const queueMetrics = {
    urgent: tickets.filter(t => t.priority === 'Urgent').length,
    high: tickets.filter(t => t.priority === 'High').length,
    medium: tickets.filter(t => t.priority === 'Medium').length,
    low: tickets.filter(t => t.priority === 'Low').length,
    aging: [
      { label: '> 48h', count: tickets.filter(t => !['resolved', 'closed'].includes(t.status.toLowerCase()) && (new Date().getTime() - new Date(t.created_at).getTime()) > 172800000).length, alert: true },
      { label: '> 24h', count: tickets.filter(t => !['resolved', 'closed'].includes(t.status.toLowerCase()) && (new Date().getTime() - new Date(t.created_at).getTime()) > 86400000).length, alert: false },
      { label: '< 24h', count: tickets.filter(t => !['resolved', 'closed'].includes(t.status.toLowerCase()) && (new Date().getTime() - new Date(t.created_at).getTime()) <= 86400000).length, alert: false },
    ]
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F6F8FB] dark:bg-gray-950">
      <DashboardSubbar 
        isSyncing={isFetching}
        onSync={handleSync}
        onViewInsights={generateAI}
        uniqueCompanies={uniqueCompanies}
        selectedCustomer={selectedCustomer}
        onCustomerChange={handleCustomerFilterChange}
      />

      <div className="flex-1 flex flex-col p-8 space-y-10 overflow-y-auto pb-32">
        
        {/* TIER 1: EXECUTIVE BRIEFING */}
        <section className="space-y-10">
          <ExecutiveHero 
            tickerMetrics={data.tickerMetrics}
            lastSync={data.lastSync}
          />
          
          <DashboardIntelligenceBrief data={data} />

          <KPISection metrics={data.kpis} isLoading={isLoading} />
        </section>

        <Separator className="opacity-50" />

        {/* TIER 2: OPERATIONAL INTELLIGENCE */}
        <section className="space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ProductIntelligence clusters={data.clusters} />
            <LiveActivityCenter tickets={tickets} />
          </div>

          <OperationsOverview 
            capacity={data.agentCapacity} 
            queueMetrics={queueMetrics}
          />
          
          <CustomerRiskIntelligence 
            risks={data.customerRisks} 
            distribution={data.riskDistribution}
            movement={data.riskMovement}
          />
        </section>

        <Separator className="opacity-50" />

        {/* TIER 3: DEEP DIVES & FORECAST */}
        <section className="space-y-10">
          <PredictiveForecast data={data.forecast} />
        </section>

        <SystemHealthPanel data={data.systemHealth} />

        {/* AI Assistant */}
        <DashboardAssistant />
      </div>
    </div>
  );
};

const Index = () => (
  <DashboardProvider>
    <DashboardContent />
  </DashboardProvider>
);

export default Index;