"use client";

import React, { useState, useMemo } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { 
  Users, Loader2, LayoutDashboard, Handshake, 
  AlertTriangle, TrendingUp, BarChart2, Gauge, Brain,
  RefreshCw, Sparkles, Target
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Ticket } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const Customer360 = () => {
  const { session } = useSupabase();
  const user = session?.user;
  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const queryClient = useQueryClient();

  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [isTicketDetailModalOpen, setIsTicketDetailModalOpen] = useState(false);
  const [selectedTicketForModal, setSelectedTicketForModal] = useState<Ticket | null>(null);

  const { data: allTickets, isLoading, isFetching } = useQuery<Ticket[], Error>({
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

  // AI Intelligence (Manual Trigger)
  const { data: intelligence, isLoading: isIntelLoading, error: intelError } = useQuery({
    queryKey: ["customerIntelligence", selectedCustomer],
    queryFn: async () => {
      return await invokeEdgeFunction<any>('summarize-customer-tickets', {
        method: 'POST',
        body: { customerName: selectedCustomer, ticketsData: customerTickets },
      });
    },
    enabled: false, // DO NOT CALL AUTOMATICALLY
  });

  const generateAIMutation = useMutation({
    mutationFn: async () => {
      return await invokeEdgeFunction<any>('summarize-customer-tickets', {
        method: 'POST',
        body: { customerName: selectedCustomer, ticketsData: customerTickets },
      });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["customerIntelligence", selectedCustomer], data);
      toast.success("Customer Intelligence synthesized!");
    },
    onError: (err: any) => toast.error(`AI failed: ${err.message}`)
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-32 text-muted-foreground">
              <Handshake className="h-20 w-20 mb-6 opacity-20" />
              <p className="text-xl font-bold">Select a customer account to begin analysis</p>
            </motion.div>
          ) : (
            <motion.div key={selectedCustomer} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
              
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <LayoutDashboard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-black tracking-tight">Account Snapshot</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <CustomerOverviewCard customerName={selectedCustomer} tickets={customerTickets} />
                  <CustomerHealthScore customerName={selectedCustomer} tickets={customerTickets} />
                  
                  {!intelligence ? (
                    <Card className="relative overflow-hidden rounded-[24px] border-2 border-dashed border-indigo-200 bg-indigo-50/30 lg:col-span-2 p-12 flex flex-col items-center gap-4 text-center">
                      <Brain className="h-12 w-12 text-indigo-400" />
                      <div className="space-y-1">
                        <h3 className="text-xl font-bold text-indigo-900">Synthesize Behavioral Intelligence</h3>
                        <p className="text-sm text-indigo-700/70 max-w-md">Analyze interaction history to identify personas, churn risk, and prescriptive actions.</p>
                      </div>
                      <Button 
                        onClick={() => generateAIMutation.mutate()} 
                        disabled={generateAIMutation.isPending}
                        className="bg-indigo-600 hover:bg-indigo-700 gap-2 rounded-full px-10 h-12 font-bold shadow-lg shadow-indigo-500/20"
                      >
                        {generateAIMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                        Generate AI Intelligence
                      </Button>
                    </Card>
                  ) : (
                    <CustomerAISummaryCard
                      customerName={selectedCustomer}
                      analysis={intelligence}
                      isLoading={isIntelLoading}
                      error={intelError}
                    />
                  )}
                </div>
              </section>

              {intelligence && <CustomerActionCenter actions={intelligence?.nextBestActions} isLoading={isIntelLoading} />}

              <Separator className="bg-gray-200 dark:bg-gray-800" />

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