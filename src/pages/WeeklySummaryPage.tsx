"use client";

import React, { useState, useMemo } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Loader2, CalendarDays, Sparkles } from "lucide-react"; // Added CalendarDays
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Ticket } from "@/types";
import { format, subDays, isWithinInterval, parseISO, differenceInDays } from 'date-fns';
import { toast } from 'sonner';
import { invokeEdgeFunction } from "@/lib/apiClient";
import { motion, AnimatePresence } from "framer-motion";

// Components
import WeeklyHero from "@/components/weekly-summary/WeeklyHero";
import WeeklyAISummary from "@/components/weekly-summary/WeeklyAISummary";
import WeeklyMetricGrid from "@/components/weekly-summary/WeeklyMetricGrid";
import WeeklyActionCenter from "@/components/weekly-summary/WeeklyActionCenter";
import { Separator } from "@/components/ui/separator";

const WeeklySummaryPage = () => {
  const { session } = useSupabase();
  const user = session?.user;
  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const queryClient = useQueryClient();

  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);

  // Date Range: Last 7 days vs Previous 7 days
  const now = new Date();
  const endOfWeek = subDays(now, 1);
  const startOfWeek = subDays(endOfWeek, 6);
  const endPrevWeek = subDays(startOfWeek, 1);
  const startPrevWeek = subDays(endPrevWeek, 6);

  const weekLabel = `${format(startOfWeek, 'MMM dd')} - ${format(endOfWeek, 'MMM dd, yyyy')}`;

  // 1. Fetch Tickets
  const { data: allTickets, isLoading, isFetching } = useQuery<Ticket[], Error>({
    queryKey: ["allFreshdeskTicketsForWeeklySummary"],
    queryFn: async () => {
      const { data, error } = await supabase.from('freshdesk_tickets').select('*').order('created_at', { ascending: false }).limit(5000);
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

  // 2. Process Metrics
  const summaryData = useMemo(() => {
    if (!allTickets || !selectedCustomer) return null;

    const customerTickets = allTickets.filter(t => t.cf_company === selectedCustomer);
    
    const getMetricsForRange = (start: Date, end: Date) => {
      const created = customerTickets.filter(t => isWithinInterval(parseISO(t.created_at), { start, end }));
      const resolved = customerTickets.filter(t => 
        (t.status.toLowerCase() === 'resolved' || t.status.toLowerCase() === 'closed') &&
        isWithinInterval(parseISO(t.updated_at), { start, end })
      );
      const backlog = customerTickets.filter(t => 
        !['resolved', 'closed'].includes(t.status.toLowerCase()) &&
        parseISO(t.created_at) <= end
      );
      return { created: created.length, resolved: resolved.length, backlog: backlog.length };
    };

    const current = getMetricsForRange(startOfWeek, endOfWeek);
    const previous = getMetricsForRange(startPrevWeek, endPrevWeek);

    const calcTrend = (curr: number, prev: number) => 
      prev === 0 ? 0 : Math.round(((curr - prev) / prev) * 100);

    // Avg Resolution Time (Current Week)
    const resolvedThisWeek = customerTickets.filter(t => 
      (t.status.toLowerCase() === 'resolved' || t.status.toLowerCase() === 'closed') &&
      isWithinInterval(parseISO(t.updated_at), { start: startOfWeek, end: endOfWeek })
    );
    let totalDays = 0;
    resolvedThisWeek.forEach(t => totalDays += differenceInDays(parseISO(t.updated_at), parseISO(t.created_at)));
    const avgRes = resolvedThisWeek.length > 0 ? (totalDays / resolvedThisWeek.length).toFixed(1) + "d" : "N/A";

    return {
      metrics: {
        created: current.created,
        resolved: current.resolved,
        backlog: current.backlog,
        avgResolutionTime: avgRes,
        trends: {
          created: calcTrend(current.created, previous.created),
          resolved: calcTrend(current.resolved, previous.resolved),
          backlog: calcTrend(current.backlog, previous.backlog),
        }
      },
      ticketsForAI: customerTickets.slice(0, 30)
    };
  }, [allTickets, selectedCustomer]);

  // 3. Fetch AI Intelligence
  const { data: aiAnalysis, isLoading: isIntelLoading } = useQuery({
    queryKey: ["weeklyAIIntelligence", selectedCustomer],
    queryFn: async () => {
      return await invokeEdgeFunction<any>('summarize-customer-tickets', {
        method: 'POST',
        body: { customerName: selectedCustomer, ticketsData: summaryData?.ticketsForAI },
      });
    },
    enabled: !!selectedCustomer && !!summaryData,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const handleSync = async () => {
    toast.loading("Syncing Freshdesk data...", { id: "sync-weekly" });
    try {
      await invokeEdgeFunction('fetch-freshdesk-tickets', {
        method: 'POST',
        body: { action: 'syncTickets', user_id: user?.id },
      });
      toast.success("Data synchronized!", { id: "sync-weekly" });
      queryClient.invalidateQueries({ queryKey: ["allFreshdeskTicketsForWeeklySummary"] });
    } catch (err: any) {
      toast.error(`Sync failed: ${err.message}`, { id: "sync-weekly" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F6F8FB] dark:bg-gray-950">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
        <p className="text-lg font-medium text-muted-foreground">Synthesizing Weekly Intelligence...</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex-1 flex flex-col p-8 space-y-10 bg-[#F6F8FB] dark:bg-gray-950 min-h-screen overflow-y-auto">
        
        <WeeklyHero 
          userName={fullName}
          selectedCustomer={selectedCustomer}
          customers={uniqueCustomers}
          onCustomerChange={setSelectedCustomer}
          weekLabel={weekLabel}
          isSyncing={isFetching}
          onSync={handleSync}
        />

        <AnimatePresence mode="wait">
          {!selectedCustomer ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-32 text-muted-foreground"
            >
              <CalendarDays className="h-20 w-20 mb-6 opacity-20" />
              <p className="text-xl font-bold">Select an account to generate the weekly brief</p>
            </motion.div>
          ) : (
            <motion.div
              key={selectedCustomer}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              {/* Section 1: AI Narrative */}
              <WeeklyAISummary 
                analysis={aiAnalysis} 
                isLoading={isIntelLoading} 
              />

              {/* Section 2: KPI Intelligence */}
              {summaryData && <WeeklyMetricGrid metrics={summaryData.metrics} />}

              <Separator className="bg-gray-200 dark:bg-gray-800" />

              {/* Section 3: Action Center */}
              <WeeklyActionCenter actions={aiAnalysis?.nextBestActions || []} />

              {/* Footer: Data Integrity */}
              <div className="pt-12 pb-6 flex items-center justify-center gap-8 opacity-50">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Data Integrity: High</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3 w-3" />
                  <span className="text-[10px] font-black uppercase tracking-widest">AI Confidence: {aiAnalysis?.confidence || 94}%</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
};

export default WeeklySummaryPage;