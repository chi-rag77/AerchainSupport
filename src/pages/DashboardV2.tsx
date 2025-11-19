"use client";

import React, { useState, useMemo } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import DashboardMetricCard from "@/components/DashboardMetricCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Search, LayoutDashboard, TicketIcon, Hourglass, CalendarDays, CheckCircle, AlertCircle, ShieldAlert, Download, Filter, Bookmark, ChevronDown, Bug, Clock, User, Percent, Users, Loader2 } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Ticket } from "@/types";
import { format, subDays, isWithinInterval } from 'date-fns';
import { exportToCsv } from '@/utils/export';
import { toast } from 'sonner';
import HandWaveIcon from "@/components/HandWaveIcon";

// Import chart components
import TicketsOverTimeChart from "@/components/TicketsOverTimeChart";
import TicketTypeByCustomerChart from "@/components/TicketTypeByCustomerChart";
import AssigneeLoadChart from "@/components/AssigneeLoadChart";
import PriorityDistributionChart from "@/components/PriorityDistributionChart";

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
  rawTickets: Ticket[];
}

const DashboardV2 = () => {
  const { session } = useSupabase();
  const user = session?.user;
  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedCustomerFilter, setSelectedCustomerFilter] = useState<string>("All");
  const [assigneeChartMode, setAssigneeChartMode] = useState<'count' | 'percentage'>('count');
  const [topNCustomers, setTopNCustomers] = useState<number | 'all'>(5); // New state for Top N Customers filter

  const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
  const dateRangeDisplay = selectedDate ? format(selectedDate, "MMM dd, yyyy") : "Today";


  // Fetch all tickets from Supabase for filtering and aggregation
  const { data: allSupabaseTickets, isLoading: isLoadingAllTickets, error: errorAllTickets } = useQuery<Ticket[], Error>({
    queryKey: ["allSupabaseTickets"],
    queryFn: async () => {
      const { data, error } = await supabase.from('freshdesk_tickets').select('*').limit(10000); // Added .limit(10000)
      if (error) throw error;
      return data.map(ticket => ({ ...ticket, id: ticket.freshdesk_id })) as Ticket[];
    },
    onSuccess: () => {
      toast.success("All tickets loaded from Supabase for daily dashboard processing!");
    },
    onError: (err) => {
      toast.error(`Failed to load all tickets from Supabase for daily dashboard: ${err.message}`);
    },
  } as UseQueryOptions<Ticket[], Error>);

  const processedSummaryData: TicketSummaryData | undefined = useMemo(() => {
    if (!allSupabaseTickets || !selectedDate) return undefined;

    const targetCreationDate = new Date(selectedDate);
    targetCreationDate.setUTCHours(0, 0, 0, 0);
    const targetCreationEndDate = new Date(targetCreationDate);
    targetCreationEndDate.setUTCDate(targetCreationDate.getUTCDate() + 1);

    let ticketsCreatedOnSelectedDate = allSupabaseTickets.filter(ticket => {
      const ticketCreatedAt = new Date(ticket.created_at);
      return isWithinInterval(ticketCreatedAt, { start: targetCreationDate, end: targetCreationEndDate });
    });

    let filteredTickets = ticketsCreatedOnSelectedDate;
    if (selectedCustomerFilter && selectedCustomerFilter !== "All") {
      filteredTickets = ticketsCreatedOnSelectedDate.filter(ticket => ticket.cf_company === selectedCustomerFilter);
    }

    const totalTicketsToday = filteredTickets.length;
    const resolvedToday = filteredTickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;
    const openCount = filteredTickets.filter(t => t.status === 'Open (Being Processed)').length;
    const pendingOnTech = filteredTickets.filter(t => t.status === 'On Tech').length;

    const typeBreakdown: { [key: string]: number } = {};
    filteredTickets.forEach(t => {
      typeBreakdown[t.type || 'Unknown Type'] = (typeBreakdown[t.type || 'Unknown Type'] || 0) + 1;
    });

    const statusBreakdown: { [key: string]: number } = {};
    filteredTickets.forEach(t => {
      statusBreakdown[t.status] = (statusBreakdown[t.status] || 0) + 1;
    });

    const customerBreakdownMap: { [key: string]: { totalToday: number; resolvedToday: number; open: number; pendingTech: number; bugs: number; tasks: number; queries: number; otherActive: number; } } = {};
    ticketsCreatedOnSelectedDate.forEach(ticket => { // Use ticketsCreatedOnSelectedDate for customer breakdown
      const company = ticket.cf_company || 'Unknown Company';
      if (!customerBreakdownMap[company]) {
        customerBreakdownMap[company] = { totalToday: 0, resolvedToday: 0, open: 0, pendingTech: 0, bugs: 0, tasks: 0, queries: 0, otherActive: 0 };
      }
      customerBreakdownMap[company].totalToday++;
      if (ticket.status === 'Resolved' || ticket.status === 'Closed') customerBreakdownMap[company].resolvedToday++;
      if (ticket.status === 'Open (Being Processed)') customerBreakdownMap[company].open++;
      if (ticket.status === 'On Tech') customerBreakdownMap[company].pendingTech++;
      if (ticket.type === 'Bug') customerBreakdownMap[company].bugs++;
      if (ticket.type === 'Task') customerBreakdownMap[company].tasks++;
      if (ticket.type === 'Query') customerBreakdownMap[company].queries++;
      // Calculate otherActive for DashboardV2
      const statusLower = ticket.status.toLowerCase();
      if (!['resolved', 'closed', 'open (being processed)', 'on tech'].includes(statusLower)) {
        customerBreakdownMap[company].otherActive++;
      }
    });

    return {
      date: formattedDate,
      customer: selectedCustomerFilter || "All",
      totalTicketsToday,
      resolvedToday,
      openCount,
      pendingOnTech,
      typeBreakdown,
      statusBreakdown,
      customerBreakdown: Object.entries(customerBreakdownMap).map(([company, data]) => ({ name: company, ...data })),
      rawTickets: filteredTickets,
    };
  }, [allSupabaseTickets, selectedDate, selectedCustomerFilter, formattedDate]);

  const uniqueCompanies = useMemo(() => {
    if (!allSupabaseTickets) return ["All"];
    const companies = (allSupabaseTickets || []).map(c => c.cf_company || 'Unknown Company');
    return ["All", ...Array.from(new Set(companies)).sort()];
  }, [allSupabaseTickets]);

  const handleExportSummary = () => {
    if (!processedSummaryData) {
      console.warn("No summary data to export.");
      return;
    }

    const exportableData = [
      {
        Metric: "Date",
        Value: processedSummaryData.date,
      },
      {
        Metric: "Customer Filter",
        Value: processedSummaryData.customer,
      },
      {
        Metric: "Total Tickets Today",
        Value: processedSummaryData.totalTicketsToday,
      },
      {
        Metric: "Resolved Today",
        Value: processedSummaryData.resolvedToday,
      },
      {
        Metric: "Open Count",
        Value: processedSummaryData.openCount,
      },
      {
        Metric: "Pending on Tech",
        Value: processedSummaryData.pendingOnTech,
      },
      ...Object.entries(processedSummaryData.typeBreakdown || {}).map(([type, count]) => ({
        Metric: `Type: ${type}`,
        Value: count,
      })),
      ...Object.entries(processedSummaryData.statusBreakdown || {}).map(([status, count]) => ({
        Metric: `Status: ${status}`,
        Value: count,
      })),
    ];

    exportToCsv(exportableData, `daily_ticket_summary_${formattedDate}_${selectedCustomerFilter}_${format(new Date(), 'yyyyMMdd_HHmmss')}`);
  };

  const rawTicketsForCharts = processedSummaryData?.rawTickets || [];

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg flex flex-col">
        {/* Title Bar */}
        <div className="p-8 pb-6 border-b border-gray-200 dark:border-gray-700 shadow-sm"> {/* Increased padding */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex flex-col items-start">
              <p className="text-lg font-bold text-gray-700 dark:text-gray-300 flex items-center mb-2">
                Hi {fullName} <HandWaveIcon className="ml-2 h-6 w-6 text-yellow-500" />
              </p>
              <div className="flex items-center space-x-4">
                <LayoutDashboard className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Ticket Analytics Dashboard</h1> {/* Updated Title */}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Data for: <span className="font-semibold">{dateRangeDisplay}</span>
              </p>
            </div>
            {/* ThemeToggle is now in Navbar */}
          </div>

          <div className="flex flex-wrap gap-4 items-center mt-4"> {/* Increased gap */}
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

            {/* Top N Customers Filter */}
            <Select value={String(topNCustomers)} onValueChange={(value) => setTopNCustomers(value === 'all' ? 'all' : Number(value))}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2 text-gray-500" />
                <SelectValue placeholder="Top N Customers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                <SelectItem value="5">Top 5</SelectItem>
                <SelectItem value="10">Top 10</SelectItem>
                <SelectItem value="20">Top 20</SelectItem>
              </SelectContent>
            </Select>

            {/* Export Button */}
            <Button onClick={handleExportSummary} className="flex items-center gap-1">
              <Download className="h-4 w-4" /> Export Summary (CSV)
            </Button>
          </div>
        </div>

        {isLoadingAllTickets ? (
          <div className="flex flex-col items-center justify-center flex-grow p-8 text-gray-500 dark:text-gray-400"> {/* Increased padding */}
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg font-medium">Loading daily dashboard data...</p>
          </div>
        ) : (
          <>
            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 p-8 pb-6 border-b border-gray-200 dark:border-gray-700"> {/* Increased padding and gap */}
              <DashboardMetricCard
                title="Total Tickets Today"
                value={processedSummaryData?.totalTicketsToday || 0}
                icon={TicketIcon}
                description={`Total tickets created on ${formattedDate}`}
              />
              <DashboardMetricCard
                title="Resolved Today"
                value={processedSummaryData?.resolvedToday || 0}
                icon={CheckCircle}
                description={`Tickets resolved or closed on ${formattedDate}`}
              />
              <DashboardMetricCard
                title="Open Tickets"
                value={processedSummaryData?.openCount || 0}
                icon={Hourglass}
                description="Tickets currently in 'Open' status"
              />
              <DashboardMetricCard
                title="Pending on Tech"
                value={processedSummaryData?.pendingOnTech || 0}
                icon={Clock}
                description="Tickets currently 'On Tech' status"
              />
              <DashboardMetricCard
                title="Bugs Today"
                value={processedSummaryData?.typeBreakdown?.Bug || 0}
                icon={Bug}
                description={`Bugs created on ${formattedDate}`}
              />
              <DashboardMetricCard
                title="Tasks Today"
                value={processedSummaryData?.typeBreakdown?.Task || 0}
                icon={ShieldAlert}
                description={`Tasks created on ${formattedDate}`}
              />
            </div>

            {/* Customer Breakdown Table */}
            <div className="p-8 pb-6 border-b border-gray-200 dark:border-gray-700"> {/* Increased padding */}
              <h3 className="text-lg font-semibold mb-4 text-foreground">Customer Breakdown for {formattedDate}</h3>
              {/* <CustomerBreakdownTable data={processedSummaryData?.customerBreakdown || []} /> */}
            </div>

            {/* Charts & Visuals Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-8"> {/* Increased padding and gap */}
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-inner flex flex-col items-center justify-center h-80 text-gray-500 dark:text-gray-400 transition-all duration-300 hover:shadow-lg hover:scale-[1.01]">
                <h3 className="text-lg font-semibold mb-2 text-foreground w-full text-center">Assignee Load</h3>
                <Select value={assigneeChartMode} onValueChange={(value: 'count' | 'percentage') => setAssigneeChartMode(value)}>
                  <SelectTrigger className="w-[120px] h-8">
                    <SelectValue placeholder="Display Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="count">Count</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                  </SelectContent>
                </Select>
                <AssigneeLoadChart tickets={rawTicketsForCharts} displayMode={assigneeChartMode} />
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-inner flex flex-col items-center justify-center h-80 text-gray-500 dark:text-gray-400 transition-all duration-300 hover:shadow-lg hover:scale-[1.01]">
                <div className="flex justify-between items-center w-full mb-2">
                  <h3 className="text-lg font-semibold text-foreground">Priority Distribution</h3>
                  <Select onValueChange={() => {}}>
                    <SelectTrigger className="w-[150px] h-8">
                      <SelectValue placeholder="Date Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Aug 25-Sept 25">Aug 25-Sept 25</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <PriorityDistributionChart tickets={rawTicketsForCharts} />
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-inner flex flex-col items-center justify-center h-80 text-gray-500 dark:text-gray-400 transition-all duration-300 hover:shadow-lg hover:scale-[1.01]">
                <h3 className="text-lg font-semibold mb-2 text-foreground w-full text-center">Tickets Over Time</h3>
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
                <TicketTypeByCustomerChart tickets={rawTicketsForCharts} selectedCustomer={selectedCustomerFilter} topNCustomers={topNCustomers} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardV2;