"use client";

import React, { useState, useMemo } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { 
  Users, Loader2, Handshake, RefreshCw, Target, ChevronUp, ChevronDown,
  LayoutDashboard, BarChart3, Repeat, Globe
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Ticket } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { invokeEdgeFunction } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import CustomerIntelligenceHeader from "@/components/customer360/intelligence-header/CustomerIntelligenceHeader";
import JourneyImpactTimeline from "@/components/customer360/journey-timeline/JourneyImpactTimeline";
import RecurringIssueRadar from "@/components/product-intelligence/RecurringIssueRadar";

const Customer360 = () => {
  const { session } = useSupabase();
  const user = session?.user;
  const queryClient = useQueryClient();

  const [selectedCustomer, setSelectedCustomer] = useState<string | null>("All"); // Default to Global View
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'intelligence' | 'radar'>('radar'); // Default to Radar as requested

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

  const handleCustomerSelect = (val: string) => {
    setSelectedCustomer(val);
    setIsCollapsed(true);
    // If switching to a specific customer, intelligence might be more relevant, 
    // but we'll keep the user's current tab choice.
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F6F8FB] dark:bg-gray-950">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
        <p className="text-lg font-medium text-muted-foreground">Initializing Customer Intelligence...</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex-1 flex flex-col p-8 space-y-10 bg-[#F6F8FB] dark:bg-gray-950 min-h-screen overflow-y-auto">
        
        {/* Collapsible Header Panel */}
        <motion.div 
          initial={false}
          animate={{ 
            height: isCollapsed ? 64 : 'auto',
            paddingTop: isCollapsed ? 12 : 32,
            paddingBottom: isCollapsed ? 12 : 32
          }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className={cn(
            "relative w-full px-8 rounded-[24px] shadow-glass overflow-hidden border border-white/20 dark:border-gray-700/30 backdrop-blur-xl",
            "bg-gradient-to-br from-[#F8FAFF] to-[#F1F5FF] dark:from-gray-800/40 dark:to-gray-900/40"
          )}
        >
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-50/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 flex items-center justify-between gap-8 h-full">
            <AnimatePresence mode="wait">
              {isCollapsed ? (
                <motion.div 
                  key="collapsed"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-3"
                >
                  <h1 className="text-xl font-black tracking-tight text-gray-900 dark:text-white">
                    Customer 360
                  </h1>
                  <div className="h-4 w-px bg-gray-300 dark:bg-gray-600 mx-1" />
                  <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                    {selectedCustomer === 'All' ? <Globe className="h-4 w-4" /> : null}
                    {selectedCustomer === 'All' ? "Global Product View" : selectedCustomer}
                  </span>
                </motion.div>
              ) : (
                <motion.div 
                  key="expanded"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 w-full"
                >
                  <div className="space-y-4">
                    <div>
                      <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
                        Customer 360 <Target className="h-8 w-8 text-indigo-600" />
                      </h1>
                      <p className="text-lg text-muted-foreground font-medium">A unified view of customer health and support activity.</p>
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
                      <Select value={selectedCustomer || ""} onValueChange={handleCustomerSelect}>
                        <SelectTrigger className="w-[280px] border-none bg-transparent focus:ring-0 h-10 font-bold text-indigo-600">
                          <SelectValue placeholder="Choose a customer..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-none shadow-2xl">
                          <SelectItem value="All" className="font-bold text-indigo-600">Global View (All Accounts)</SelectItem>
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
                </motion.div>
              )}
            </AnimatePresence>

            {selectedCustomer && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="rounded-full h-10 w-10 bg-white/50 dark:bg-gray-800/50 hover:bg-[#EEF2FF] dark:hover:bg-indigo-900/30 hover:scale-105 transition-all shrink-0 shadow-sm"
              >
                {isCollapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
              </Button>
            )}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {!selectedCustomer ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-32 text-muted-foreground">
              <Handshake className="h-20 w-20 mb-6 opacity-20" />
              <p className="text-xl font-bold">Select a customer account to begin analysis</p>
            </motion.div>
          ) : (
            <motion.div key={selectedCustomer} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-20">
              
              {/* Tab Switcher */}
              <div className="flex items-center p-1 bg-gray-200/50 dark:bg-gray-800/50 rounded-full w-fit border border-white/20">
                <button
                  onClick={() => setActiveTab('intelligence')}
                  disabled={selectedCustomer === 'All'}
                  className={cn(
                    "relative flex items-center gap-2 px-8 py-2.5 rounded-full text-sm font-black uppercase tracking-widest transition-all duration-300",
                    activeTab === 'intelligence' ? "text-white" : "text-muted-foreground hover:text-foreground",
                    selectedCustomer === 'All' && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {activeTab === 'intelligence' && (
                    <motion.div layoutId="active-360-tab" className="absolute inset-0 bg-indigo-600 rounded-full shadow-lg" />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Intelligence
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('radar')}
                  className={cn(
                    "relative flex items-center gap-2 px-8 py-2.5 rounded-full text-sm font-black uppercase tracking-widest transition-all duration-300",
                    activeTab === 'radar' ? "text-white" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {activeTab === 'radar' && (
                    <motion.div layoutId="active-360-tab" className="absolute inset-0 bg-indigo-600 rounded-full shadow-lg" />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Repeat className="h-4 w-4" />
                    Issue Radar
                  </span>
                </button>
              </div>

              <AnimatePresence mode="wait">
                {activeTab === 'intelligence' && selectedCustomer !== 'All' ? (
                  <motion.div 
                    key="intelligence"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-20"
                  >
                    <CustomerIntelligenceHeader customerName={selectedCustomer} />
                    <JourneyImpactTimeline customerName={selectedCustomer} />
                  </motion.div>
                ) : (
                  <motion.div 
                    key="radar"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <RecurringIssueRadar customerName={selectedCustomer} />
                  </motion.div>
                )}
              </AnimatePresence>
              
              <Separator className="opacity-50" />
              
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <p className="text-xs font-black uppercase tracking-[0.3em] opacity-30">End of Intelligence Brief</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </TooltipProvider>
  );
};

export default Customer360;