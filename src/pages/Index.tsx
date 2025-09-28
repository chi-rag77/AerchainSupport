"use client";

import React, { useState, useMemo } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import Sidebar from "@/components/Sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import Logo from "@/components/Logo";
import HandWaveIcon from "@/components/HandWaveIcon";
import DashboardMetricCard from "@/components/DashboardMetricCard";
import TicketsPage from "./TicketsPage"; // Import the renamed TicketsPage
import { Input } from "@/components/ui/input";
import { Search, TicketIcon, Hourglass, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Ticket } from "@/types";

const Index = () => {
  const { session } = useSupabase();
  const user = session?.user;
  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  const [showSidebar, setShowSidebar] = useState(true);
  const [globalSearchTerm, setGlobalSearchTerm] = useState(""); // For global search bar

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  // Fetch tickets from Freshdesk via Supabase Edge Function for metrics
  const { data: freshdeskTickets, isLoading, error } = useQuery<Ticket[], Error>({
    queryKey: ["freshdeskTicketsForMetrics"], // Separate query key for dashboard metrics
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-freshdesk-tickets', {
        method: 'POST',
        body: { action: 'getTickets' },
      });
      if (error) throw error;
      return data as Ticket[];
    },
  });

  // Calculate metrics
  const metrics = useMemo(() => {
    if (!freshdeskTickets) {
      return {
        totalTickets: 0,
        openTickets: 0,
        pendingTickets: 0,
        resolvedClosedTickets: 0,
        highPriorityTickets: 0,
      };
    }

    const totalTickets = freshdeskTickets.length;
    const openTickets = freshdeskTickets.filter(t => t.status.toLowerCase() === 'open (being processed)').length;
    const pendingTickets = freshdeskTickets.filter(t => t.status.toLowerCase().includes('pending') || t.status.toLowerCase().includes('waiting on customer')).length;
    const resolvedClosedTickets = freshdeskTickets.filter(t => t.status.toLowerCase() === 'resolved' || t.status.toLowerCase() === 'closed').length;
    const highPriorityTickets = freshdeskTickets.filter(t => t.priority.toLowerCase() === 'high' || t.priority.toLowerCase() === 'urgent').length;

    return {
      totalTickets,
      openTickets,
      pendingTickets,
      resolvedClosedTickets,
      highPriorityTickets,
    };
  }, [freshdeskTickets]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-gray-700 dark:text-gray-300">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-red-500">Error loading dashboard: {error.message}</p>
        <p className="text-red-500">Please ensure FRESHDESK_API_KEY and FRESHDESK_DOMAIN are set as Supabase secrets.</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-100 dark:bg-gray-900">
      <Sidebar showSidebar={showSidebar} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col p-4 overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-4">
            <Logo className="h-8 w-auto" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">SupportIQ Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Global Search..."
                value={globalSearchTerm}
                onChange={(e) => setGlobalSearchTerm(e.target.value)}
                className="pl-9 w-[300px]"
              />
            </div>
            {/* Quick Filter Chips placeholder */}
            <div className="flex space-x-2">
              {/* <Badge variant="secondary">Open</Badge>
              <Badge variant="secondary">High Priority</Badge> */}
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Greeting */}
        <div className="mb-6">
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center">
            Hi {fullName} <HandWaveIcon className="ml-2 h-6 w-6 text-yellow-500" />
          </p>
        </div>

        {/* Metrics Overview Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <DashboardMetricCard
            title="Total Tickets"
            value={metrics.totalTickets}
            icon={TicketIcon}
            trend={12} // Example trend
            description="All tickets in the system"
          />
          <DashboardMetricCard
            title="Open Tickets"
            value={metrics.openTickets}
            icon={Hourglass}
            trend={-5} // Example trend
            description="Currently being processed"
          />
          <DashboardMetricCard
            title="Pending"
            value={metrics.pendingTickets}
            icon={AlertCircle}
            trend={8} // Example trend
            description="Awaiting customer reply"
          />
          <DashboardMetricCard
            title="Resolved/Closed"
            value={metrics.resolvedClosedTickets}
            icon={CheckCircle}
            trend={15} // Example trend
            description="Successfully handled"
          />
          <DashboardMetricCard
            title="High Priority"
            value={metrics.highPriorityTickets}
            icon={XCircle}
            trend={-2} // Example trend
            description="Requiring immediate attention"
          />
        </div>

        {/* Ticket Table Section (using TicketsPage component) */}
        <div className="flex-1 overflow-hidden">
          <TicketsPage />
        </div>
      </div>
    </div>
  );
};

export default Index;