"use client";

import React, { useState, useMemo } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { 
  Users, Loader2, RefreshCw, Target, Globe, Download, FileText, 
  FileSpreadsheet, ChevronDown, Zap, ShieldAlert, Ticket, User, Bell
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Ticket as TicketType } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { invokeEdgeFunction } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CustomerIntelligenceHeader from "@/components/customer360/intelligence-header/CustomerIntelligenceHeader";
import JourneyImpactTimeline from "@/components/customer360/journey-timeline/JourneyImpactTimeline";
import RecurringIssueRadar from "@/components/product-intelligence/RecurringIssueRadar";
import CustomerMetadata from "@/components/customer360/intelligence-header/CustomerMetadata";
import { exportToPdf, exportToExcel } from "@/utils/customer360Export";

const Customer360 = () => {
  const { session } = useSupabase();
  const user = session?.user;
  const queryClient = useQueryClient();

  const [selectedCustomer, setSelectedCustomer] = useState<string | null>("Danone");
  const [activeTab, setActiveTab] = useState<'intelligence' | 'radar'>('intelligence');
  const [isExporting, setIsExporting] = useState(false);

  const { data: allTickets, isLoading } = useQuery<TicketType[], Error>({
    queryKey: ["allFreshdeskTicketsFor360"],
    queryFn: async () => {
      const { data, error } = await supabase.from('freshdesk_tickets').select('*').order('created_at', { ascending: false }).limit(10000);
      if (error) throw error;
      return data.map(ticket => ({ ...ticket, id: ticket.freshdesk_id })) as TicketType[];
    }
  });

  const { data: intelligenceData } = useQuery({
    queryKey: ['customerIntelligence', selectedCustomer],
    queryFn: () => invokeEdgeFunction<any>('get-customer-intelligence', {
      method: 'POST',
      body: { customerName: selectedCustomer },
    }),
    enabled: !!selectedCustomer && selectedCustomer !== 'All',
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

  const handleExportPdf = async () => {
    if (!selectedCustomer) return;
    setIsExporting(true);
    const toastId = toast.loading("Generating PDF...");
    try {
      await exportToPdf('customer-360-content', `Customer360_${selectedCustomer}`);
      toast.success("PDF exported!");
    } catch (err) {
      toast.error("Export failed.");
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAFC] dark:bg-gray-950">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
        <p className="text-lg font-medium text-muted-foreground">Initializing Customer Intelligence...</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex-1 flex flex-col bg-[#F8FAFC] dark:bg-gray-950 min-h-screen relative">
        
        {/* 1. Topbar (48px) - Clean & Functional */}
        <header className="h-12 border-b border-border bg-white dark:bg-gray-900 flex items-center justify-between px-6 shrink-0 sticky top-0 z-50 shadow-sm">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-indigo-600" />
              Customer 360
            </h1>
            <div className="h-4 w-px bg-border" />
            <Select value={selectedCustomer || ""} onValueChange={setSelectedCustomer}>
              <SelectTrigger className="h-8 w-fit min-w-[180px] border-none bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 rounded-lg text-xs font-bold text-indigo-600 gap-2 transition-colors">
                <SelectValue placeholder="Select Account" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-none shadow-2xl">
                <SelectItem value="All" className="font-bold text-indigo-600">Global View</SelectItem>
                {uniqueCustomers.map(customer => (
                  <SelectItem key={customer} value={customer} className="font-medium">{customer}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleSync} className="h-8 px-3 text-[10px] font-bold uppercase tracking-widest gap-2 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
              <RefreshCw className="h-3.5 w-3.5" /> Sync
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="h-8 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] uppercase tracking-widest gap-2 shadow-sm transition-all active:scale-95">
                  <Download className="h-3.5 w-3.5" /> Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl w-48 border-border/50 shadow-2xl">
                <DropdownMenuItem onClick={handleExportPdf} className="cursor-pointer gap-2 py-2.5">
                  <FileText className="h-4 w-4 text-rose-500" /> Export PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {}} className="cursor-pointer gap-2 py-2.5">
                  <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Export Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* 2. Subbar (36px) - Contextual Metadata & Tabs */}
        <div className="h-9 border-b border-border bg-white dark:bg-gray-900/50 flex items-center justify-between px-6 shrink-0 sticky top-12 z-40 backdrop-blur-md">
          <div className="flex-1 overflow-hidden">
            {intelligenceData?.metadata && (
              <CustomerMetadata metadata={intelligenceData.metadata} />
            )}
          </div>

          <div className="flex items-center h-full">
            <button
              onClick={() => setActiveTab('intelligence')}
              className={cn(
                "h-full px-6 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2",
                activeTab === 'intelligence' ? "border-indigo-600 text-indigo-600" : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              Intelligence
            </button>
            <button
              onClick={() => setActiveTab('radar')}
              className={cn(
                "h-full px-6 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2",
                activeTab === 'radar' ? "border-indigo-600 text-indigo-600" : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              Issue Radar
            </button>
          </div>
        </div>

        {/* 3. Main Content - High Density Workspace */}
        <main className="flex-1 p-8 overflow-y-auto pb-32">
          <div className="max-w-7xl mx-auto" id="customer-360-content">
            <AnimatePresence mode="wait">
              {activeTab === 'intelligence' && selectedCustomer !== 'All' ? (
                <motion.div 
                  key="intelligence"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-10"
                >
                  <CustomerIntelligenceHeader customerName={selectedCustomer!} />
                  <JourneyImpactTimeline customerName={selectedCustomer!} />
                </motion.div>
              ) : (
                <motion.div 
                  key="radar"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <RecurringIssueRadar customerName={selectedCustomer!} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
};

export default Customer360;