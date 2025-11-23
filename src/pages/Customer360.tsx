"use client";

import React, { useState, useMemo } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Users, Loader2, LayoutDashboard, Handshake, TrendingUp, BarChart3, ShieldCheck } from "lucide-react"; // Added ShieldCheck, TrendingUp, BarChart3
import HandWaveIcon from "@/components/HandWaveIcon";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Ticket } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CustomerSummaryCards from "@/components/CustomerSummaryCards";
import CustomerTicketTypeChart from "@/components/CustomerTicketTypeChart";
// Removed: import CustomerTicketsTable from "@/components/CustomerTicketsTable";
// Removed: import CustomerTimeline from "@/components/CustomerTimeline";
import CustomerSLAPerformance from "@/components/CustomerSLAPerformance"; // New import
import CustomerRecurringIssues from "@/components/CustomerRecurringIssues"; // New import
import CustomerEngagementTrendChart from "@/components/CustomerEngagementTrendChart"; // New import
import { toast } from 'sonner';

const Customer360 = () => {
  const { session } = useSupabase();
  const user = session?.user;
  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);

  // Fetch all tickets to get unique customer names and then filter
  const { data: allTickets, isLoading, error } = useQuery<Ticket[], Error>({
    queryKey: ["allFreshdeskTicketsFor360"],
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
      toast.success("Customer 360 data loaded successfully!");
    },
    onError: (err) => {
      toast.error(`Failed to load customer data: ${err.message}`);
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

  const customerTickets = useMemo(() => {
    if (!allTickets || !selectedCustomer) return [];
    return allTickets.filter(ticket => ticket.cf_company === selectedCustomer);
  }, [allTickets, selectedCustomer]);

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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg flex flex-col h-full">
          {/* Title Bar */}
          <div className="p-8 pb-6 border-b border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="flex flex-col items-start">
                <p className="text-lg font-bold text-gray-700 dark:text-gray-300 flex items-center mb-2">
                  Hi {fullName} <HandWaveIcon className="ml-2 h-6 w-6 text-yellow-500" />
                </p>
                <div className="flex items-center space-x-4">
                  <Users className="h-8 w-8 text-primary" />
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Customer 360-Degree Overview</h1>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  A holistic view of your customer's interactions and history.
                </p>
              </div>
            </div>

            {/* Customer Selector */}
            <div className="flex items-center gap-4 mt-4 px-8"> {/* Added px-8 for consistent padding */}
              <h3 className="text-lg font-semibold text-foreground">Select Customer:</h3>
              <Select value={selectedCustomer || ""} onValueChange={setSelectedCustomer}>
                <SelectTrigger className="w-[250px]">
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
              <Handshake className="h-12 w-12 text-primary mb-4" />
              <p className="text-lg font-medium">Please select a customer to view their 360-degree overview.</p>
            </div>
          ) : (
            <div className="p-8 space-y-8">
              {/* Section 1: Customer Summary */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                  <LayoutDashboard className="h-6 w-6 mr-3 text-blue-600" /> Customer Summary
                </h2>
                <CustomerSummaryCards tickets={customerTickets} />
              </section>

              {/* Section 2: Ticket Breakdown & SLA Performance */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                  <ShieldCheck className="h-6 w-6 mr-3 text-green-600" /> Service Performance & Issue Insights
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="h-96">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-foreground">Ticket Type Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[calc(100%-60px)]">
                      <CustomerTicketTypeChart tickets={customerTickets} />
                    </CardContent>
                  </Card>
                  <Card className="h-96">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-foreground">Customer SLA Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[calc(100%-60px)] flex items-center justify-center">
                      <CustomerSLAPerformance tickets={customerTickets} />
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Section 3: Recurring Issues & Engagement Trend */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                  <TrendingUp className="h-6 w-6 mr-3 text-purple-600" /> Engagement & Recurring Patterns
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="h-96">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-foreground">Recurring Issues by Type/Module</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[calc(100%-60px)]">
                      <CustomerRecurringIssues tickets={customerTickets} />
                    </CardContent>
                  </Card>
                  <Card className="h-96">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-foreground">Ticket Creation Trend</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[calc(100%-60px)]">
                      <CustomerEngagementTrendChart tickets={customerTickets} />
                    </CardContent>
                  </Card>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Customer360;