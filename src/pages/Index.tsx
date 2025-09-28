"use client";

import React, { useState, useMemo } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import Sidebar from "@/components/Sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import Logo from "@/components/Logo";
import HandWaveIcon from "@/components/HandWaveIcon";
import DashboardMetricCard from "@/components/DashboardMetricCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, LayoutDashboard, TicketIcon, Hourglass, CalendarDays, CheckCircle, AlertCircle, ShieldAlert, Download, Filter, Bookmark, ChevronDown, Bug, Clock } from "lucide-react"; // Added Bug and Clock icons
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Ticket } from "@/types";
import { isWithinInterval, subDays, format } from 'date-fns';

// Import chart components
import TicketsOverTimeChart from "@/components/TicketsOverTimeChart";
import TicketTypeByCustomerChart from "@/components/TicketTypeByCustomerChart";
import PriorityDistributionChart from "@/components/PriorityDistributionChart";
import AssigneeLoadChart from "@/components/AssigneeLoadChart";

// Define the type for the conversation summary (if needed, though not directly used here)
type ConversationSummary = {
  initialMessage: string;
  lastAgentReply: string;
};

const Index = () => {
  const { session } = useSupabase();
  const user = session?.user;
  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  const [showSidebar, setShowSidebar] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState("last7days"); // Default date range for metrics

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  // Fetch tickets from Freshdesk via Supabase Edge Function
  const { data: freshdeskTickets, isLoading, error } = useQuery<Ticket[], Error>({
    queryKey: ["freshdeskTickets"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-freshdesk-tickets', {
        method: 'POST',
        body: { action: 'getTickets' },
      });
      if (error) throw error;
      return data as Ticket[];
    },
  });

  const metrics = useMemo(() => {
    if (!freshdeskTickets) {
      return {
        totalTickets: 0,
        openTickets: 0,
        newThisPeriod: 0,
        resolvedThisPeriod: 0,
        highPriorityTickets: 0,
        slaBreaches: 0,
      };
    }

    const now = new Date();
    let startDate: Date;

    switch (dateRange) {
      case "last7days":
        startDate = subDays(now, 7);
        break;
      case "last14days":
        startDate = subDays(now, 14);
        break;
      case "last30days":
        startDate = subDays(now, 30);
        break;
      case "last90days":
        startDate = subDays(now, 90);
        break;
      default: // All time or custom, for now default to all time if not specified
        startDate = new Date(0); // Epoch time for "all time"
        break;
    }

    const periodTickets = freshdeskTickets.filter(ticket =>
      isWithinInterval(new Date(ticket.created_at), { start: startDate, end: now })
    );

    const totalTickets = freshdeskTickets.length;
    const openTickets = freshdeskTickets.filter(t => t.status.toLowerCase() === 'open (being processed)').length;
    const newThisPeriod = periodTickets.length;
    const resolvedThisPeriod = freshdeskTickets.filter(t =>
      (t.status.toLowerCase() === 'resolved' || t.status.toLowerCase() === 'closed') &&
      isWithinInterval(new Date(t.updated_at), { start: startDate, end: now })
    ).length;
    const highPriorityTickets = freshdeskTickets.filter(t => t.priority.toLowerCase() === 'high' || t.priority.toLowerCase() === 'urgent').length;
    const slaBreaches = 5; // Placeholder for now, actual calculation would be complex

    return {
      totalTickets,
      openTickets,
      newThisPeriod,
      resolvedThisPeriod,
      highPriorityTickets,
      slaBreaches,
    };
  }, [freshdeskTickets, dateRange]);

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
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-100 dark:bg-gray-900">
      <Sidebar showSidebar={showSidebar} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col p-4 overflow-y-auto"> {/* Added overflow-y-auto here */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg flex flex-col"> {/* Removed h-full */}
          {/* Top Bar */}
          <div className="p-6 pb-4 border-b border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-4">
                <LayoutDashboard className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Support Dashboard</h1>
                <p className="text-base font-semibold text-gray-700 dark:text-gray-300 flex items-center ml-4">
                  Hi {fullName} <HandWaveIcon className="ml-2 h-5 w-5 text-yellow-500" />
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <ThemeToggle />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              {/* Global Date Picker */}
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[180px]">
                  <CalendarDays className="h-4 w-4 mr-2 text-gray-500" />
                  <SelectValue placeholder="Select Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last7days">Last 7 Days</SelectItem>
                  <SelectItem value="last14days">Last 14 Days</SelectItem>
                  <SelectItem value="last30days">Last 30 Days</SelectItem>
                  <SelectItem value="last90days">Last 90 Days</SelectItem>
                  <SelectItem value="alltime">All Time</SelectItem>
                  {/* <SelectItem value="custom">Custom Range</SelectItem> */}
                </SelectContent>
              </Select>

              {/* Quick Filter Chips */}
              <Button variant="outline" className="flex items-center gap-1">
                <Filter className="h-4 w-4" /> My Tickets
              </Button>
              <Button variant="outline" className="flex items-center gap-1">
                <AlertCircle className="h-4 w-4" /> High Priority
              </Button>
              <Button variant="outline" className="flex items-center gap-1">
                <ShieldAlert className="h-4 w-4" /> SLA Breached
              </Button>

              {/* Search Box */}
              <div className="relative flex-grow min-w-[250px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search Ticket ID, Title, Assignee..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full"
                />
              </div>

              {/* Saved Views Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-1">
                    <Bookmark className="h-4 w-4" /> Saved Views <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>My Open Tickets</DropdownMenuItem>
                  <DropdownMenuItem>Team's High Priority</DropdownMenuItem>
                  <DropdownMenuItem>Save Current View</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Export Button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="flex items-center gap-1">
                    <Download className="h-4 w-4" /> Export <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Current Page (CSV)</DropdownMenuItem>
                  <DropdownMenuItem>Filtered Results (CSV)</DropdownMenuItem>
                  <DropdownMenuItem>Aggregated Report (Excel)</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* KPI Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 p-6 pb-4 border-b border-gray-200 dark:border-gray-700 mb-8"> {/* Added mb-8 for spacing */}
            <DashboardMetricCard
              title="Total Tickets"
              value={metrics.totalTickets}
              icon={TicketIcon}
              trend={12} // Example trend
              description="The total number of support tickets received."
            />
            <DashboardMetricCard
              title="Open Tickets"
              value={metrics.openTickets}
              icon={Hourglass}
              trend={-5} // Example trend
              description="Tickets that are currently open and being processed."
            />
            <DashboardMetricCard
              title="New This Period"
              value={metrics.newThisPeriod}
              icon={CalendarDays}
              trend={8} // Example trend
              description={`New tickets created ${dateRange === 'alltime' ? 'overall' : `in the selected period (${dateRange.replace('last', 'last ').replace('days', ' days')})`}.`}
            />
            <DashboardMetricCard
              title="Resolved This Period"
              value={metrics.resolvedThisPeriod}
              icon={CheckCircle}
              trend={15} // Example trend
              description={`Tickets resolved or closed ${dateRange === 'alltime' ? 'overall' : `in the selected period (${dateRange.replace('last', 'last ').replace('days', ' days')})`}.`}
            />
            <DashboardMetricCard
              title="High Priority"
              value={metrics.highPriorityTickets}
              icon={AlertCircle}
              trend={-2} // Example trend
              description="Tickets marked as High or Urgent priority, requiring immediate attention."
            />
            <DashboardMetricCard
              title="SLA Breaches"
              value={metrics.slaBreaches}
              icon={ShieldAlert}
              trend={3} // Example trend
              description="Number of tickets that have exceeded their Service Level Agreement (SLA)."
            />
          </div>

          {/* Charts & Visuals Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-6 pb-4 border-b border-gray-200 dark:border-gray-700 mb-8"> {/* Added mb-8 for spacing */}
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-inner flex flex-col items-center justify-center h-80 text-gray-500 dark:text-gray-400 transition-all duration-300 hover:shadow-lg hover:scale-[1.01]"> {/* Increased height to h-80 and added hover */}
              <h3 className="text-lg font-semibold mb-2 text-foreground">Tickets Over Time</h3>
              <TicketsOverTimeChart tickets={freshdeskTickets || []} dateRange={dateRange} />
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-inner flex flex-col items-center justify-center h-80 text-gray-500 dark:text-gray-400 transition-all duration-300 hover:shadow-lg hover:scale-[1.01]"> {/* Increased height to h-80 and added hover */}
              <h3 className="text-lg font-semibold mb-2 text-foreground">Ticket Type by Customer</h3>
              <TicketTypeByCustomerChart tickets={freshdeskTickets || []} />
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-inner flex flex-col items-center justify-center h-80 text-gray-500 dark:text-gray-400 transition-all duration-300 hover:shadow-lg hover:scale-[1.01]"> {/* Increased height to h-80 and added hover */}
              <h3 className="text-lg font-semibold mb-2 text-foreground">Priority Distribution</h3>
              <PriorityDistributionChart tickets={freshdeskTickets || []} />
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-inner flex flex-col items-center justify-center h-80 text-gray-500 dark:text-gray-400 transition-all duration-300 hover:shadow-lg hover:scale-[1.01]"> {/* Increased height to h-80 and added hover */}
              <h3 className="text-lg font-semibold mb-2 text-foreground">Assignee Load</h3>
              <AssigneeLoadChart tickets={freshdeskTickets || []} />
            </div>
          </div>

          {/* Table (Main listing) Placeholder */}
          <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400 text-xl p-6">
            <p>Ticket Table Listing (Coming Soon!)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;