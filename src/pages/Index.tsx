"use client";

import React, { useState, useMemo } from "react";
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
import OperationalBottlenecks from "@/components/dashboard/OperationalBottlenecks";
import PredictiveForecast from "@/components/dashboard/PredictiveForecast";
import ExecutiveActionCenter from "@/components/dashboard/ExecutiveActionCenter";
import SystemHealthPanel from "@/components/dashboard/SystemHealthPanel";
import TicketDetailModal from "@/components/TicketDetailModal";
import TicketTypeByCustomerChart from "@/components/TicketTypeByCustomerChart";
import CustomerTypeSummary from "@/components/dashboard/CustomerTypeSummary";
import { Loader2, Brain, Sparkles, Users2, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DashboardContent = () => {
  const { session } = useSupabase();
  const user = session?.user;
  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const queryClient = useQueryClient();

  const { viewMode, dateRange, filters, setFilters } = useDashboard();
  const { data, tickets, uniqueCompanies, isLoading, isGeneratingAI, generateAI, hasAI } = useExecutiveDashboard();
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
    } catch (err: any) {
      toast.error(`Sync failed: ${err.message}`, { id: "sync-dashboard" });
    }
  };

  const selectedCustomer = filters.company || 'All';
  const filteredTicketsForSummary = useMemo(() => {
    if (selectedCustomer === 'All') return tickets;
    return tickets.filter(t => t.cf_company === selectedCustomer);
  }, [tickets, selectedCustomer]);

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
    <div className="flex-1 flex flex-col p-8 space-y-10 bg-[#F6F8FB] dark:bg-gray-950 min-h-screen overflow-y-auto">
      <ExecutiveHero 
        userName={fullName}
        slaRiskScore={data.slaRiskScore}
        lastSync={data.lastSync}
        isSyncing={isLoading}
        onSync={handleSync}
        onViewInsights={generateAI} 
      />

      <div className="flex justify-center">
        <ViewModeSelector />
      </div>

      {!hasAI && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 rounded-[24px] border-2 border-dashed border-indigo-200 bg-indigo-50/30 flex flex-col items-center gap-4 text-center">
          <Brain className="h-10 w-10 text-indigo-400" />
          <div className="space-y-1">
            <h3 className="font-bold text-indigo-900">AI Intelligence is Ready</h3>
            <p className="text-sm text-indigo-700/70">Generate executive summaries and predictive insights on demand.</p>
          </div>
          <Button onClick={() => generateAI()} disabled={isGeneratingAI} className="bg-indigo-600 hover:bg-indigo-700 gap-2 rounded-full px-8">
            {isGeneratingAI ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Generate AI Insights
          </Button>
        </motion.div>
      )}

      {hasAI && showInsight && (
        <AIInsightStrip 
          insight={activeInsight}
          onDismiss={() => setShowInsight(false)}
        />
      )}

      <KPISection metrics={data.kpis} isLoading={isLoading} />

      <DashboardFilterBar uniqueCompanies={uniqueCompanies} />

      <AnimatePresence mode="wait">
        <motion.div key={viewMode} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
          
          {/* New Customer Intelligence Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                <Users2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-2xl font-black tracking-tight">Customer Intelligence</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 rounded-[28px] border-none bg-white dark:bg-gray-800 shadow-glass overflow-hidden">
                <CardHeader className="p-8 pb-0">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-500" />
                    Ticket Type Distribution by Customer
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 h-[400px]">
                  <TicketTypeByCustomerChart 
                    tickets={tickets} 
                    selectedCustomer={selectedCustomer}
                    topNCustomers={10}
                  />
                </CardContent>
              </Card>

              <CustomerTypeSummary 
                customerName={selectedCustomer} 
                tickets={filteredTicketsForSummary} 
              />
            </div>
          </section>

          {(viewMode === 'overview' || viewMode === 'performance') && (
            <>
              <OperationalIntelligence 
                summary={data.executiveSummary}
                tickets={tickets}
                startDate={dateRange.from!}
                endDate={dateRange.to!}
              />
              {hasAI && <OperationalBottlenecks data={data.bottlenecks} />}
              {hasAI && <PredictiveForecast data={data.forecast} />}
            </>
          )}

          {(viewMode === 'overview' || viewMode === 'risk') && (
            <ActiveRiskSection onViewTicket={(t) => { setSelectedTicket(t); setIsModalOpen(true); }} />
          )}

          {viewMode === 'overview' && hasAI && (
            <>
              <Separator className="bg-gray-200 dark:bg-gray-800" />
              <ExecutiveActionCenter actions={data.actions} />
            </>
          )}
        </motion.div>
      </AnimatePresence>

      <SystemHealthPanel data={data.systemHealth} />

      {selectedTicket && (
        <TicketDetailModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} ticket={selectedTicket} />
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