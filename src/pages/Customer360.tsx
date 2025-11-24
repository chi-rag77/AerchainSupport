"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Users, Loader2, LayoutDashboard, Handshake, MessageSquare } from "lucide-react"; // Added MessageSquare
import HandWaveIcon from "@/components/HandWaveIcon";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Ticket } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from 'sonner';

// New components for Customer 360
import CustomerOverviewCard from "@/components/customer360/CustomerOverviewCard";
import CustomerHealthScore from "@/components/customer360/CustomerHealthScore";
import CustomerPerformanceMetricsCard from "@/components/customer360/CustomerPerformanceMetricsCard";
import CustomerIssueInsightsCard from "@/components/customer360/CustomerIssueInsightsCard"; // New import

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
      console.log("Customer360: Successfully loaded all tickets:", data.length);
      if (!selectedCustomer && data.length > 0) {
        const firstCustomer = data.find(t => t.cf_company)?.cf_company;
        if (firstCustomer) {
          setSelectedCustomer(firstCustomer);
          console.log("Customer360: Automatically selected first customer:", firstCustomer);
        }
      }
      toast.success("Customer 360 data loaded successfully!");
    },
    onError: (err) => {
      console.error("Customer360: Failed to load customer data:", err);
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
    const filtered = allTickets.filter(ticket => ticket.cf_company === selectedCustomer);
    console.log(`Customer360: Filtered tickets for '${selectedCustomer}':`, filtered.length);
    return filtered;
  }, [allTickets, selectedCustomer]);

  useEffect(() => {
    console.log("Customer360: Current selectedCustomer state:", selectedCustomer);
  }, [selectedCustomer]);

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
            <div className="flex items-center gap-4 mt-4 px-8">
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
              {/* 1️⃣ EXECUTIVE SUMMARY (Top Overview Section) */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                  <LayoutDashboard className="h-6 w-6 mr-3 text-blue-600" /> Executive Summary
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <CustomerOverviewCard customerName={selectedCustomer} tickets={customerTickets} />
                  <CustomerHealthScore customerName={selectedCustomer} tickets={customerTickets} />
                </div>
              </section>

              {/* 2️⃣ Customer Performance Metrics */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                  Customer Performance Metrics
                </h2>
                <CustomerPerformanceMetricsCard customerName={selectedCustomer} tickets={customerTickets} />
              </section>

              {/* 3️⃣ Issue & Category Insights */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                  <MessageSquare className="h-6 w-6 mr-3 text-green-600" /> Issue & Category Insights
                </h2>
                <CustomerIssueInsightsCard customerName={selectedCustomer} tickets={customerTickets} />
              </section>

              {/* Placeholder for other sections */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                  Risk Indicators
                </h2>
                <Card className="h-48 flex items-center justify-center text-muted-foreground">
                  <CardContent>Placeholder for Escalation Panel, Reopen Analysis, SLA Breach Details, Aged Tickets</CardContent>
                </Card>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                  Operational Load & Efficiency
                </h2>
                <Card className="h-48 flex items-center justify-center text-muted-foreground">
                  <CardContent>Placeholder for Ticket Handoffs Count, Status Transition Map, Interaction Load</CardContent>
                </Card>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                  Conversation Depth & Activity
                </h2>
                <Card className="h-48 flex items-center justify-center text-muted-foreground">
                  <CardContent>Placeholder for Conversation Density, Customer Responsiveness, Agent Responsiveness</CardContent>
                </Card>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                  Historical Behaviour
                </h2>
                <Card className="h-48 flex items-center justify-center text-muted-foreground">
                  <CardContent>Placeholder for Activity Heatmap, Most Active Customer Contacts, Contact-Based Ticket Summary</CardContent>
                </Card>
              </section>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Customer360;