"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { 
  Users, Loader2, LayoutDashboard, Handshake, MessageSquare, 
  AlertTriangle, TrendingUp, History, BarChart2, Gauge, Brain,
  RefreshCw, Sparkles, ShieldCheck, Target
} from "lucide-react";
import HandWaveIcon from "@/components/HandWaveIcon";
import { useQuery, UseQueryOptions, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Ticket } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from 'sonner';
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils"; // Added missing import

// Components
import CustomerOverviewCard from "@/components/customer360/CustomerOverviewCard";
import CustomerHealthScore from "@/components/customer360/CustomerHealthScore";
import CustomerPerformanceMetricsCard from "@/components/customer360/CustomerPerformanceMetricsCard";
import CustomerIssueInsightsCard from "@/components/customer360/CustomerIssueInsightsCard";
import CustomerRiskIndicatorsCard from "@/components/customer360/CustomerRiskIndicatorsCard";
import CustomerOperationalLoadCard from "@/components/customer360/CustomerOperationalLoadCard";
import CustomerConversationActivityCard from "@/components/customer360/CustomerConversationActivityCard";
import CustomerHistoricalBehaviourCard from "@/components/customer360/CustomerHistoricalBehaviourCard";
import TicketDetailModal from "@/components/TicketDetailModal";
import CustomerAISummaryCard from "@/components/customer360/CustomerAISummaryCard";
import CustomerActionCenter from "@/components/customer360/CustomerActionCenter";
import { invokeEdgeFunction } from "@/lib/apiClient";
import { ApiError } from "@/lib/errorHandler";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const fetchCustomerIntelligence = async (customerName: string, ticketsData: any[]): Promise<any> => {
  if (!customerName || !ticketsData || ticketsData.length === 0) return null;
  return await invokeEdgeFunction<any>('summarize-customer-tickets', {
    method: 'POST',
    body: { customerName, ticketsData },
  });
};

const Customer360 = () => {
  const { session } = useSupabase();
  const user = session?.user;
  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const queryClient = useQueryClient();

  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [isTicketDetailModalOpen, setIsTicketDetailModalOpen] = useState(false);
  const [selectedTicketForModal, setSelectedTicketForModal] = useState<Ticket | null>(null);

  const { data: allTickets, isLoading, error, isFetching } = useQuery<Ticket[], Error>({
    queryKey: ["allFreshdeskTicketsFor360"],
    queryFn: async () => {
      const { data, error } = await supabase.from('freshdesk_tickets').select('*').order('created_at', { ascending: false }).limit(10000);
      if (error) throw error;
      return data.map(ticket => ({ ...ticket, id: ticket.freshdesk_id })) as Ticket[];
    }
  });

  const uniqueCustomers = useMemo(() => {
    const customers = new Set<string>();
    (allTickets || []).forEach(ticket => {
      if (ticket.cf_company) customers.add(ticket.cf_company);
    });
    return Array.from(customers).sort();
  }, [allTickets]);

  const customerTickets = useMemo(() => {
    if (!allTickets || !selectedCustomer) return [];
    return allTickets.filter(ticket => ticket.cf_company === selectedCustomer);
  }, [allTickets, selectedCustomer]);

  const { data: intelligence, isLoading: isIntelLoading, error: intelError } = useQuery({
    queryKey: ["customerIntelligence", selectedCustomer],
    queryFn: () => fetchCustomerIntelligence(selectedCustomer!, customerTickets),
    enabled: !!selectedCustomer && customerTickets.length > 0,
    staleTime: 10 * 60 * 1000,
  });

  const handleSync = async () => {
    toast.loading("Syncing Freshdesk data...", { id: "sync-360" });
    try {
      await invokeEdgeFunction('fetch-freshdesk-tickets', {
        method: 'POST',
        body: { action: 'syncTickets', user_id: user?.id },
      });
      toast.success("Data synchronized!", { id: "sync-360" });
      queryClient.invalidateQueries({ queryKey: ["allFreshdeskTicketsFor360"] });
    } catch (err: any) {
      toast.error(`Sync failed: ${err.message}`, { id: "sync-360" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F6F8FB] dark:bg-gray-950">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
        <p className="text-lg font-medium text-muted-foreground">Loading Customer Intelligence...</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex-1 flex flex-col p-8 space-y-10 bg-[#F6F8FB] dark:bg-gray-950 min-h-screen overflow-y-auto">
        
        {/* Section 1: Intelligence Hero */}
        <div className="relative w-full p-8 rounded-[24px] bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 shadow-glass overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
                  Customer 360 Intelligence <Target className="h-8 w-8 text-indigo-600" />
                </h1>
                <p className="text-lg text-muted-foreground font-medium">Holistic behavioral and operational analysis</p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Badge variant="outline" className="bg-indigo-50/50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-200/50 py-1 px-3 gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                  AI Analysis Active
                </Badge>
                <Badge variant="secondary" className="bg-white/50 dark:bg-gray-700/50 py-1 px-3 gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  {uniqueCustomers.length} Managed Accounts
                </Badge>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3 bg-white/80 dark:bg-gray-900/80 p-2 rounded-2xl border border-border shadow-sm">
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-2">Select Account:</span>
                <Select value={selectedCustomer || ""} onValueChange={setSelectedCustomer}>
                  <SelectTrigger className="w-[280px] border-none bg-transparent focus:ring-0 h-10 font-bold text-indigo-600">
                    <SelectValue placeholder="Choose a customer..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-2xl">
                    {uniqueCustomers.map(customer => (
                      <SelectItem key={customer} value={customer} className="font-medium">{customer}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleSync} 
                disabled={isFetching}
                className="rounded-full bg-white dark:bg-gray-900 text-foreground border border-border hover:bg-gray-50 shadow-sm h-12 px-6 font-bold"
              >
                <RefreshCw className={cn("mr-2 h-4 w-4", isFetching && "animate-spin")} />
                Sync Data
              </Button>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!selectedCustomer ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-32 text-muted-foreground"
            >
              <Handshake className="h-20 w-20 mb-6 opacity-20" />
              <p className="text-xl font-bold">Select a customer account to begin analysis</p>
              <p className="text-sm">AI-powered insights will be generated based on their interaction history.</p>
            </motion.div>
          ) : (
            <motion.div
              key={selectedCustomer}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              {/* Section 2: Executive Summary & AI Intelligence */}
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <LayoutDashboard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-black tracking-tight">Executive Summary</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <CustomerOverviewCard customerName={selectedCustomer} tickets={customerTickets} />
                  <CustomerHealthScore customerName={selectedCustomer} tickets={customerTickets} />
                  <CustomerAISummaryCard
                    customerName={selectedCustomer}
                    analysis={intelligence}
                    isLoading={isIntelLoading}
                    error={intelError}
                  />
                </div>
              </section>

              {/* Section 3: Prescriptive Actions */}
              <CustomerActionCenter actions={intelligence?.nextBestActions} isLoading={isIntelLoading} />

              <Separator className="bg-gray-200 dark:bg-gray-800" />

              {/* Section 4: Operational Deep Dive */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <section className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                      <Gauge className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h2 className="text-xl font-black tracking-tight">Performance Intelligence</h2>
                  </div>
                  <CustomerPerformanceMetricsCard customerName={selectedCustomer} tickets={customerTickets} />
                </section>

                <section className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
                      <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <h2 className="text-xl font-black tracking-tight">Risk Indicators</h2>
                  </div>
                  <CustomerRiskIndicatorsCard 
                    customerName={selectedCustomer} 
                    tickets={customerTickets} 
                    onViewTicketDetails={(t) => { setSelectedTicketForModal(t); setIsTicketDetailModalOpen(true); }} 
                  />
                </section>
              </div>

              {/* Section 5: Behavioral Analysis */}
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <BarChart2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="text-xl font-black tracking-tight">Issue & Category Insights</h2>
                </div>
                <CustomerIssueInsightsCard customerName={selectedCustomer} tickets={customerTickets} />
              </section>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <CustomerOperationalLoadCard customerName={selectedCustomer} tickets={customerTickets} />
                <CustomerConversationActivityCard customerName={selectedCustomer} tickets={customerTickets} />
                <CustomerHistoricalBehaviourCard customerName={selectedCustomer} tickets={customerTickets} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <TicketDetailModal
          isOpen={isTicketDetailModalOpen}
          onClose={() => { setIsTicketDetailModalOpen(false); setSelectedTicketForModal(null); }}
          ticket={selectedTicketForModal}
        />
      </div>
    </TooltipProvider>
  );
};

export default Customer360;