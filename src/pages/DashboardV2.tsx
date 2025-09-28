"use client";

import React, { useState, useMemo } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import Sidebar from "@/components/Sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import DashboardMetricCard from "@/components/DashboardMetricCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Search, LayoutDashboard, TicketIcon, Hourglass, CalendarDays, CheckCircle, AlertCircle, ShieldAlert, Download, Filter, Bookmark, ChevronDown, Bug, Clock, User, Percent, Users } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip"; // Ensure TooltipProvider is imported
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Ticket } from "@/types";
import { format, subDays } from 'date-fns';
import { exportToCsv } from '@/utils/export';

// Import chart components
import TicketsOverTimeChart from "@/components/TicketsOverTimeChart";
import TicketTypeByCustomerChart from "@/components/TicketTypeByCustomerChart";
import PriorityDistributionChart from "@/components/PriorityDistributionChart";
import AssigneeLoadChart from "@/components/AssigneeLoadChart";
import CustomerBreakdownTable from "@/components/CustomerBreakdownTable"; // New component

// Define the type for the aggregated summary data from the Edge Function
interface TicketSummaryData {
  date: string;
  customer: string;
  totalTicketsToday: number;
  resolvedToday: number;
  openCount: number;
  pendingOnTech: number;
  typeBreakdown: { [key: string]: number };
  statusBreakdown: { [key: string]: number };
  customerBreakdown: Array<{
    name: string;
    totalToday: number;
    resolvedToday: number;
    open: number;
    pendingTech: number;
    bugs: number;
    tasks: number;
    queries: number;
  }>;
  rawTickets: Ticket[]; // Raw tickets for charts that need them
}

const DashboardV2 = () => {
  const { session } = useSupabase();
  const user = session?.user;
  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  const [showSidebar, setShowSidebar] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedCustomerFilter, setSelectedCustomerFilter] = useState<string>("All");
  const [assigneeChartMode, setAssigneeChartMode] = useState<'count' | 'percentage'>('count');

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');

  // Fetch aggregated ticket summary from the new Edge Function
  const { data: summaryData, isLoading, error } = useQuery<TicketSummaryData, Error>({
    queryKey: ["ticketSummary", formattedDate, selectedCustomerFilter],
    queryFn: async () => {
      console.log("Invoking ticket-summary with:", { date: formattedDate, customer: selectedCustomerFilter }); // Client-side log

      const { data, error } = await supabase.functions.invoke('ticket-summary', {
        method: 'POST', // Changed to POST
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ // Parameters now in body
          date: formattedDate,
          customer: selectedCustomerFilter,
        }),
      });
      if (error) throw error;
      return data as TicketSummaryData;
    },
    enabled: !!selectedDate, // Only fetch if a date is selected
  });

  const uniqueCompanies = useMemo(() => {
    if (!summaryData?.customerBreakdown) return ["All"];
    const companies = summaryData.customerBreakdown.map(c => c.name);
    return ["All", ...companies.sort()];
  }, [summaryData]);

  const handleExportSummary = () => {
    if (!summaryData) {
      console.warn("No summary data to export.");
      return;
    }

    const exportableData = [
      {
        Metric: "Date",
        Value: summaryData.date,
      },
      {
        Metric: "Customer Filter",
        Value: summaryData.customer,
      },
      {
        Metric: "Total Tickets Today",
        Value: summaryData.totalTicketsToday,
      },
      {
        Metric: "Resolved Today",
        Value: summaryData.resolvedToday,
      },
      {
        Metric: "Open Count",
        Value: summaryData.openCount,
      },
      {
        Metric: "Pending on Tech",
        Value: summaryData.pendingOnTech,
      },
      ...Object.entries(summaryData.typeBreakdown).map(([type, count]) => ({
        Metric: `Type: ${type}`,
        Value: count,
      })),
      ...Object.entries(summaryData.statusBreakdown).map(([status, count]) => ({
        Metric: `Status: ${status}`,
        Value: count,
      })),
    ];

    exportToCsv(exportableData, `daily_ticket_summary_${formattedDate}_${selectedCustomerFilter}_${format(new Date(), 'yyyyMMdd_HHmmss')}`);
  };

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

  const rawTicketsForCharts = summaryData?.rawTickets || [];

  return (
    <TooltipProvider>
      <div className="h-screen flex bg-gray-100 dark:bg-gray-900">
        <Sidebar showSidebar={showSidebar} toggleSidebar={toggleSidebar} />
        <div className="flex-1 flex flex-col p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg flex flex-col">
            {/* Top Bar */}
            <div className="p-6 pb-4 border-b border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-4">
                  <LayoutDashboard className="h-8 w-8 text-primary" />
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Daily Support Dashboard</h1>
                  <p className="text-base font-semibold text-gray-700 dark:text-gray-300 flex items-center ml-4">
                    Hi {fullName}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <ThemeToggle />
                </div>
              </div>

              <div className="flex flex-wrap gap-3 items-center">
                {/* Date Picker */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className="w-[200px] justify-start text-left font-normal"
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                {/* Customer Filter */}
                <Select value={selectedCustomerFilter} onValueChange={setSelectedCustomerFilter}>
                  <SelectTrigger className="w-[200px]">
                    <Users className="h-4 w-4 mr-2 text-gray-500" />
                    <SelectValue placeholder="All Customers" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueCompanies.map(company => (
                      <SelectItem key={company} value={company}>
                        {company === "All" ? "All Customers" : company}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Export Button */}
                <Button onClick={handleExportSummary} className="flex items-center gap-1">
                  <Download className="h-4 w-4" /> Export Summary (CSV)
                </Button>
              </div>
            </div>

            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 p-6 pb-4 border-b border-gray-200 dark:border-gray-700 mb-8">
              <DashboardMetricCard
                title="Total Tickets Today"
                value={summaryData?.totalTicketsToday || 0}
                icon={TicketIcon}
                description={`Total tickets created on ${formattedDate}`}
              />
              <DashboardMetricCard
                title="Resolved Today"
                value={summaryData?.resolvedToday || 0}
                icon={CheckCircle}
                description={`Tickets resolved or closed on ${formattedDate}`}
              />
              <DashboardMetricCard
                title="Open Tickets"
                value={summaryData?.openCount || 0}
                icon={Hourglass}
                description="Tickets currently in 'Open' status"
              />
              <DashboardMetricCard
                title="Pending on Tech"
                value={summaryData?.pendingOnTech || 0}
                icon={Clock}
                description="Tickets currently 'On Tech' status"
              />
              <DashboardMetricCard
                title="Bugs Today"
                value={summaryData?.typeBreakdown?.Bug || 0}
                icon={Bug}
                description={`Bugs created on ${formattedDate}`}
              />
              <DashboardMetricCard
                title="Tasks Today"
                value={summaryData?.typeBreakdown?.Task || 0}
                icon={ShieldAlert} // Using ShieldAlert for Task as a placeholder
                description={`Tasks created on ${formattedDate}`}
              />
            </div>

            {/* Customer Breakdown Table */}
            <div className="p-6 pb-4 border-b border-gray-200 dark:border-gray-700 mb-8">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Customer Breakdown for {formattedDate}</h3>
              <CustomerBreakdownTable data={summaryData?.customerBreakdown || []} />
            </div>

            {/* Charts & Visuals Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-6 pb-4 mb-8">
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-inner flex flex-col items-center justify-center h-80 text-gray-500 dark:text-gray-400 transition-all duration-300 hover:shadow-lg hover:scale-[1.01]">
                <h3 className="text-lg font-semibold mb-2 text-foreground w-full text-center">Tickets Over Time (Last 30 Days)</h3>
                <TicketsOverTimeChart tickets={rawTicketsForCharts} dateRange="last30days" />
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-inner flex flex-col items-center justify-center h-80 text-gray-500 dark:text-gray-400 transition-all duration-300 hover:shadow-lg hover:scale-[1.01]">
                <div className="flex justify-between items-center w-full mb-2">
                  <h3 className="text-lg font-semibold text-foreground w-full text-center">Ticket Type by Customer</h3>
                  <Select value={selectedCustomerFilter} onValueChange={setSelectedCustomerFilter}>
                    <SelectTrigger className="w-[180px] h-8">
                      <SelectValue placeholder="All Customers" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueCompanies.map(company => (
                        <SelectItem key={company} value={company}>
                          {company === "All" ? "All Customers" : company}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <TicketTypeByCustomerChart tickets={rawTicketsForCharts} selectedCustomer={selectedCustomerFilter} />
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-inner flex flex-col items-center justify-center h-80 text-gray-500 dark:text-gray-400 transition-all duration-300 hover:shadow-lg hover:scale-[1.01]">
                <h3 className="text-lg font-semibold mb-2 text-foreground w-full text-center">Priority Distribution</h3>
                <PriorityDistributionChart tickets={rawTicketsForCharts} />
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-inner flex flex-col items-center justify-center h-80 text-gray-500 dark:text-gray-400 transition-all duration-300 hover:shadow-lg hover:scale-[1.01]">
                <div className="flex justify-between items-center w-full mb-2">
                  <h3 className="text-lg font-semibold text-foreground w-full text-center">Assignee Load</h3>
                  <Select value={assigneeChartMode} onValueChange={(value: 'count' | 'percentage') => setAssigneeChartMode(value)}>
                    <SelectTrigger className="w-[120px] h-8">
                      <SelectValue placeholder="Display Mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="count">Count</SelectItem>
                      <SelectItem value="percentage">Percentage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <AssigneeLoadChart tickets={rawTicketsForCharts} displayMode={assigneeChartMode} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default DashboardV2;