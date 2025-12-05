"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LayoutDashboard, Users, Loader2, RefreshCw, CalendarDays } from "lucide-react";
import HandWaveIcon from "@/components/HandWaveIcon";
import WeeklySupportSummaryCard from "@/components/WeeklySupportSummaryCard";
import { useQuery, UseQueryOptions, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Ticket } from "@/types";
import { format, subDays, isWithinInterval, parseISO } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from 'sonner';

interface WeeklySupportSummaryData {
  customerName: string;
  metrics: {
    ticketsCreatedThisWeek: number;
    ticketsResolvedThisWeek: number;
    stillOpenFromThisWeek: number;
    totalOpenIncludingPrevious: number;
  };
  ticketMix: {
    bug: { count: number; percentage: number };
    query: { count: number; percentage: number };
    taskChange: { count: number; percentage: number };
  };
}

const WeeklySummaryPage = () => {
  const { session } = useSupabase();
  const user = session?.user;
  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Calculate startOfWeek and endOfWeek here so they are accessible in JSX
  const now = new Date();
  const endOfWeek = subDays(now, 1); // Yesterday
  const startOfWeek = subDays(endOfWeek, 6); // 7 days including yesterday

  const { data: allTickets, isLoading, error, isFetching } = useQuery<Ticket[], Error>({
    queryKey: ["allFreshdeskTicketsForWeeklySummary"],
    queryFn: async () => {
      const { data, error } = await supabase.from('freshdesk_tickets').select('*').order('created_at', { ascending: false }).limit(10000);
      if (error) throw error;
      return data.map(ticket => ({ ...ticket, id: ticket.freshdesk_id })) as Ticket[];
    },
    onSuccess: (data) => {
      if (!selectedCustomer && data.length > 0) {
        const firstCustomer = data.find(t => t.cf_company)?.cf_company;
        if (firstCustomer) {
          setSelectedCustomer(firstCustomer);
        }
      }
      toast.success("Weekly summary data loaded successfully!");
    },
    onError: (err) => {
      toast.error(`Failed to load weekly summary data: ${err.message}`);
    },
  } as UseQueryOptions<Ticket[], Error>);

  const uniqueCustomers = useMemo(() => {
    const customers = new Set<string>();
    (allTickets || []).forEach(ticket => {
      if (ticket.cf_company) {
        customers.add(ticket.cf_company);
      }
    });
    return Array.from(customers).sort();
  }, [allTickets]);

  const weeklySummaryData: WeeklySupportSummaryData | null = useMemo(() => {
    if (!allTickets || !selectedCustomer) return null;

    const customerTickets = allTickets.filter(ticket => ticket.cf_company === selectedCustomer);

    const ticketsCreatedThisWeek = customerTickets.filter(ticket =>
      isWithinInterval(parseISO(ticket.created_at), { start: startOfWeek, end: endOfWeek })
    );

    const ticketsResolvedThisWeek = customerTickets.filter(ticket =>
      (ticket.status.toLowerCase() === 'resolved' || ticket.status.toLowerCase() === 'closed') &&
      isWithinInterval(parseISO(ticket.updated_at), { start: startOfWeek, end: endOfWeek })
    );

    const stillOpenFromThisWeek = ticketsCreatedThisWeek.filter(ticket =>
      !(ticket.status.toLowerCase() === 'resolved' || ticket.status.toLowerCase() === 'closed')
    );

    const totalOpenIncludingPrevious = customerTickets.filter(ticket =>
      !(ticket.status.toLowerCase() === 'resolved' || ticket.status.toLowerCase() === 'closed')
    );

    // Ticket Mix calculations
    const totalTicketsForMix = ticketsCreatedThisWeek.length;
    const bugTickets = ticketsCreatedThisWeek.filter(ticket => ticket.type?.toLowerCase() === 'bug');
    const queryTickets = ticketsCreatedThisWeek.filter(ticket => ticket.type?.toLowerCase() === 'query');
    const taskChangeTickets = ticketsCreatedThisWeek.filter(ticket => ticket.type?.toLowerCase() === 'task' || ticket.type?.toLowerCase() === 'change');

    const calculatePercentage = (count: number, total: number) =>
      total > 0 ? parseFloat(((count / total) * 100).toFixed(0)) : 0;

    return {
      customerName: selectedCustomer,
      metrics: {
        ticketsCreatedThisWeek: ticketsCreatedThisWeek.length,
        ticketsResolvedThisWeek: ticketsResolvedThisWeek.length,
        stillOpenFromThisWeek: stillOpenFromThisWeek.length,
        totalOpenIncludingPrevious: totalOpenIncludingPrevious.length,
      },
      ticketMix: {
        bug: { count: bugTickets.length, percentage: calculatePercentage(bugTickets.length, totalTicketsForMix) },
        query: { count: queryTickets.length, percentage: calculatePercentage(queryTickets.length, totalTicketsForMix) },
        taskChange: { count: taskChangeTickets.length, percentage: calculatePercentage(taskChangeTickets.length, totalTicketsForMix) },
      },
    };
  }, [allTickets, selectedCustomer, startOfWeek, endOfWeek]); // Added startOfWeek, endOfWeek to dependencies

  const handleSyncTickets = async () => {
    toast.loading("Syncing latest tickets from Freshdesk...", { id: "sync-tickets-weekly-summary" });
    try {
      const { data, error } = await supabase.functions.invoke('fetch-freshdesk-tickets', {
        method: 'POST',
        body: { action: 'syncTickets', user_id: user?.id },
      });

      if (error) {
        let errorMessage = `Failed to sync tickets: ${error.message}`;
        if (error.message.includes("Freshdesk API error: 401") || error.message.includes("Freshdesk API key or domain not set")) {
          errorMessage += ". Please ensure FRESHDESK_API_KEY and FRESHDESK_DOMAIN are correctly set as Supabase secrets for the 'fetch-freshdesk-tickets' Edge Function.";
        } else if (error.message.includes("non-2xx status code")) {
          errorMessage += ". This often indicates an issue with the Freshdesk API or its credentials. Please check your Supabase secrets (FRESHDESK_API_KEY, FRESHDESK_DOMAIN).";
        }
        throw new Error(errorMessage);
      }

      toast.success("Tickets synced successfully!", { id: "sync-tickets-weekly-summary" });
      queryClient.invalidateQueries({ queryKey: ["allFreshdeskTicketsForWeeklySummary"] });
    } catch (err: any) {
      toast.error(err.message, { id: "sync-tickets-weekly-summary" });
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-red-500">Error loading tickets: {error.message}</p>
        <p className="text-red-500">Please ensure FRESHDESK_API_KEY and FRESHDESK_DOMAIN are set as Supabase secrets.</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex-1 flex flex-col p-6 overflow-y-auto">
        <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-lg flex flex-col h-full">
          {/* Title Bar */}
          <div className="p-8 pb-6 border-b border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="flex flex-col items-start">
                <p className="text-lg font-bold text-gray-700 dark:text-gray-300 flex items-center mb-2">
                  Hi {fullName} <HandWaveIcon className="ml-2 h-6 w-6 text-yellow-500" />
                </p>
                <div className="flex items-center space-x-4">
                  <LayoutDashboard className="h-8 w-8 text-primary" />
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Weekly Support Summary</h1>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Overview for the week: <span className="font-semibold">{format(startOfWeek, 'MMM dd')} - {format(endOfWeek, 'MMM dd, yyyy')}</span>
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  onClick={handleSyncTickets}
                  disabled={isFetching}
                  className="h-10 px-5 text-base font-semibold relative overflow-hidden group"
                >
                  {isFetching ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  Sync Tickets
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                </Button>
              </div>
            </div>

            {/* Customer Selector */}
            <div className="flex items-center gap-4 mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-b-xl shadow-inner">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" /> Select Customer:
              </h3>
              <Select value={selectedCustomer || ""} onValueChange={setSelectedCustomer}>
                <SelectTrigger className="w-[250px] bg-card">
                  <SelectValue placeholder="Choose a customer" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueCustomers.map(customer => (
                    <SelectItem key={customer} value={customer}>
                      {customer}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center flex-grow p-8 text-gray-500 dark:text-gray-400">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-lg font-medium">Loading customer data...</p>
            </div>
          ) : !selectedCustomer ? (
            <div className="flex flex-col items-center justify-center flex-grow p-8 text-gray-500 dark:text-gray-400">
              <Users className="h-12 w-12 text-primary mb-4" />
              <p className="text-lg font-medium">Please select a customer to view their weekly support summary.</p>
            </div>
          ) : (
            <div className="flex-grow p-8 text-center text-muted-foreground flex items-center justify-center">
              <div className="w-full max-w-md">
                {weeklySummaryData ? (
                  <WeeklySupportSummaryCard data={weeklySummaryData} />
                ) : (
                  <p className="text-xl">No summary data available for {selectedCustomer} this week.</p>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </TooltipProvider>
  );
};

export default WeeklySummaryPage;