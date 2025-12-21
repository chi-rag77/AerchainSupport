"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Users, Loader2, LayoutDashboard, Handshake, MessageSquare, AlertTriangle, TrendingUp, History, BarChart2, Gauge, Brain } from "lucide-react"; // Added Brain icon
import HandWaveIcon from "@/components/HandWaveIcon";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Ticket } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from 'sonner';
import { Separator } from "@/components/ui/separator";

// New components for Customer 360
import CustomerOverviewCard from "@/components/customer360/CustomerOverviewCard";
import CustomerHealthScore from "@/components/customer360/CustomerHealthScore";
import CustomerPerformanceMetricsCard from "@/components/customer360/CustomerPerformanceMetricsCard";
import CustomerIssueInsightsCard from "@/components/customer360/CustomerIssueInsightsCard";
import CustomerRiskIndicatorsCard from "@/components/customer360/CustomerRiskIndicatorsCard";
import CustomerOperationalLoadCard from "@/components/customer360/CustomerOperationalLoadCard";
import CustomerConversationActivityCard from "@/components/customer360/CustomerConversationActivityCard";
import CustomerHistoricalBehaviourCard from "@/components/customer360/CustomerHistoricalBehaviourCard";
import TicketDetailModal from "@/components/TicketDetailModal";
import CustomerAISummaryCard from "@/components/customer360/CustomerAISummaryCard"; // New import
import { invokeEdgeFunction, ApiError } from "@/lib/apiClient"; // Import apiClient

const fetchCustomerAISummary = async (customerName: string, ticketsData: any[]): Promise<string> => {
  if (!customerName || !ticketsData || ticketsData.length === 0) {
    return "No tickets available for summary or authentication missing.";
  }

  try {
    const data = await invokeEdgeFunction<{ summary: string }>(
      'summarize-customer-tickets',
      {
        method: 'POST',
        body: { customerName, ticketsData },
      }
    );

    return data.summary as string;
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw new Error(`AI Summary failed (Status ${err.status}): ${err.message}`);
    }
    throw new Error(`Failed to generate AI summary: ${err.message}`);
  }
};

const Customer360 = () => {
  const { session } = useSupabase();
  const user = session?.user;
  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const authToken = session?.access_token;

  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [isTicketDetailModalOpen, setIsTicketDetailModalOpen] = useState(false);
  const [selectedTicketForModal, setSelectedTicketForModal] = useState<Ticket | null>(null);

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

  // Prepare simplified ticket data for AI summary
  const simplifiedCustomerTicketsData = useMemo(() => {
    if (!customerTickets || customerTickets.length === 0) return [];
    return customerTickets.map(ticket => ({
      id: ticket.id,
      subject: ticket.subject,
      status: ticket.status,
      priority: ticket.priority,
      type: ticket.type,
      created_at: ticket.created_at,
      updated_at: ticket.updated_at,
      assignee: ticket.assignee,
      cf_company: ticket.cf_company,
      cf_module: ticket.cf_module,
      cf_dependency: ticket.cf_dependency,
      cf_recurrence: ticket.cf_recurrence,
    }));
  }, [customerTickets]);

  // Fetch AI Summary
  const { data: aiCustomerSummary, isLoading: isAISummaryLoading, error: aiSummaryError } = useQuery<string, Error>({
    queryKey: ["customerAISummary", selectedCustomer, simplifiedCustomerTicketsData],
    queryFn: () => fetchCustomerAISummary(selectedCustomer!, simplifiedCustomerTicketsData),
    enabled: !!selectedCustomer && simplifiedCustomerTicketsData.length > 0,
    staleTime: 5 * 60 * 1000, // Summary can be stale for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  } as UseQueryOptions<string, Error>);

  const handleViewTicketDetails = (ticket: Ticket) => {
    setSelectedTicketForModal(ticket);
    setIsTicketDetailModalOpen(true);
  };

  const handleCloseTicketDetailModal = () => {
    setIsTicketDetailModalOpen(false);
    setSelectedTicketForModal(null);
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
      <div className="flex-1 flex flex-col p-6 overflow-y-auto bg-background">
        <Card className="flex flex-col h-full p-0 overflow-hidden border-none shadow-xl">
          {/* Header Section */}
          <div className="p-8 pb-6 bg-gradient-to-br from-blue-500/5 to-purple-500/5 border-b border-border shadow-sm">
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
            <div className="flex items-center gap-4 mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-border shadow-inner">
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
              <Handshake className="h-12 w-12 text-primary mb-4" />
              <p className="text-lg font-medium">Please select a customer to view their 360-degree overview.</p>
            </div>
          ) : (
            <div className="flex-grow p-8 space-y-10 bg-gray-50 dark:bg-gray-900/50">
              {/* 1️⃣ EXECUTIVE SUMMARY (Top Overview Section) */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                  <LayoutDashboard className="h-6 w-6 text-blue-600" /> Executive Summary
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <CustomerOverviewCard customerName={selectedCustomer} tickets={customerTickets} />
                  <CustomerHealthScore customerName={selectedCustomer} tickets={customerTickets} />
                  {/* AI Summary Card - spans two columns on large screens */}
                  <CustomerAISummaryCard
                    customerName={selectedCustomer}
                    summary={aiCustomerSummary}
                    isLoading={isAISummaryLoading}
                    error={aiSummaryError}
                  />
                </div>
              </section>

              <Separator className="my-10" />

              {/* 2️⃣ Customer Performance Metrics */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                  <Gauge className="h-6 w-6 text-indigo-600" /> Performance Metrics
                </h2>
                <CustomerPerformanceMetricsCard customerName={selectedCustomer} tickets={customerTickets} />
              </section>

              <Separator className="my-10" />

              {/* 3️⃣ Issue & Category Insights */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                  <BarChart2 className="h-6 w-6 mr-1 text-green-600" /> Issue & Category Insights
                </h2>
                <CustomerIssueInsightsCard customerName={selectedCustomer} tickets={customerTickets} />
              </section>

              <Separator className="my-10" />

              {/* 4️⃣ Risk Indicators */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-red-600" /> Risk Indicators
                </h2>
                <CustomerRiskIndicatorsCard customerName={selectedCustomer} tickets={customerTickets} onViewTicketDetails={handleViewTicketDetails} />
              </section>

              <Separator className="my-10" />

              {/* 5️⃣ Operational Load & Efficiency */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                  <TrendingUp className="h-6 w-6 text-purple-600" /> Operational Load & Efficiency
                </h2>
                <CustomerOperationalLoadCard customerName={selectedCustomer} tickets={customerTickets} />
              </section>

              <Separator className="my-10" />

              {/* 6️⃣ Conversation Depth & Activity */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                  <MessageSquare className="h-6 w-6 text-blue-600" /> Conversation Depth & Activity
                </h2>
                <CustomerConversationActivityCard customerName={selectedCustomer} tickets={customerTickets} />
              </section>

              <Separator className="my-10" />

              {/* 7️⃣ Historical Behaviour */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                  <History className="h-6 w-6 text-orange-600" /> Historical Behaviour
                </h2>
                <CustomerHistoricalBehaviourCard customerName={selectedCustomer} tickets={customerTickets} />
              </section>
            </div>
          )}
        </Card>
      </div>
      <TicketDetailModal
        isOpen={isTicketDetailModalOpen}
        onClose={handleCloseTicketDetailModal}
        ticket={selectedTicketForModal}
      />
    </TooltipProvider>
  );
};

export default Customer360;