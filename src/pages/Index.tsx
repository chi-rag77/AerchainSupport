"use client";

import React, { useState, useMemo, useEffect } from "react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Search, LayoutDashboard, TicketIcon, Hourglass, CalendarDays, CheckCircle, AlertCircle, ShieldAlert, Download, Filter, Bookmark, ChevronDown, Bug, Clock, User, Percent, Users, Loader2, Table2, LayoutGrid, Info, Lightbulb } from "lucide-react"; // Added Lightbulb icon
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Ticket, CustomerBreakdownRow, Insight } from "@/types";
import { isWithinInterval, subDays, format, addDays, differenceInDays } from 'date-fns';
import { DateRange } from "react-day-picker";
import { exportToCsv } from '@/utils/export';
import { toast } from 'sonner';

// Import chart components
import TicketsOverTimeChart from "@/components/TicketsOverTimeChart";
import TicketTypeByCustomerChart from "@/components/TicketTypeByCustomerChart";
import PriorityDistributionChart from "@/components/PriorityDistributionChart";
import AssigneeLoadChart from "@/components/AssigneeLoadChart";
import CustomerBreakdownCard from "@/components/CustomerBreakdownCard";
import CustomerBreakdownTable from "@/components/CustomerBreakdownTable";
import { MultiSelect } from "@/components/MultiSelect";
import MyOpenTicketsModal from "@/components/MyOpenTicketsModal";
import InsightsSheet from "@/components/InsightsSheet"; // Import the new InsightsSheet

// This function will now primarily fetch insights from the Edge Function
const fetchDashboardInsights = async (token: string | undefined): Promise<Insight[]> => {
  if (!token) return [];

  try {
    const { data, error } = await supabase.functions.invoke('generate-dashboard-insights', { // Updated function name
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (error) {
      console.error("Error fetching insights from Edge Function:", error);
      throw error;
    }
    return data as Insight[];
  } catch (err: any) {
    console.error("Failed to fetch insights:", err.message);
    return [{
      id: 'insight-fetch-error',
      type: 'info',
      message: `Failed to load insights: ${err.message}. Please try again.`,
      severity: 'warning',
      icon: 'Info',
    }];
  }
};

const Index = () => {
  const { session } = useSupabase();
  const user = session?.user;
  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email;
  const authToken = session?.access_token;

  const [showSidebar, setShowSidebar] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeDateFilter, setActiveDateFilter] = useState<string | DateRange>("last7days");
  const [filterMyTickets, setFilterMyTickets] = useState(false);
  const [filterHighPriority, setFilterHighPriority] = useState(false);
  const [filterSLABreached, setFilterSLABreached] = useState(false);
  const [selectedCustomerForChart, setSelectedCustomerForChart] = useState<string>("All");
  const [selectedCustomersForBreakdown, setSelectedCustomersForBreakdown] = useState<string[]>([]);
  const [assigneeChartMode, setAssigneeChartMode] = useState<'count' | 'percentage'>('count');
  const [customerBreakdownView, setCustomerBreakdownView] = useState<'cards' | 'table'>('cards');
  const [isMyOpenTicketsModalOpen, setIsMyOpenTicketsModalOpen] = useState(false);
  const [isInsightsSheetOpen, setIsInsightsSheetOpen] = useState(false);

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const { data: freshdeskTickets, isLoading, error } = useQuery<Ticket[], Error>({
    queryKey: ["freshdeskTickets"],
    queryFn: async () => {
      const { data, error } = await supabase.from('freshdesk_tickets').select('*').order('updated_at', { ascending: false }).limit(10000);
      if (error) throw error;
      return data.map(ticket => ({ ...ticket, id: ticket.freshdesk_id })) as Ticket[];
    },
    onSuccess: () => {
      toast.success("Dashboard data loaded from Supabase successfully!");
    },
    onError: (err) => {
      toast.error(`Failed to load dashboard data from Supabase: ${err.message}`);
    },
  } as UseQueryOptions<Ticket[], Error>);

  const insightsQueryOptions = { // Removed explicit UseQueryOptions type annotation
    queryKey: ["dashboardInsights", authToken as string],
    queryFn: async ({ queryKey }) => {
      const [, token] = queryKey;
      return fetchDashboardInsights(token);
    },
    enabled: !!authToken,
    onSuccess: (data: Insight[]) => {
      if (data.length > 0 && data[0].id !== 'insight-fetch-error') {
        toast.info(`Found ${data.length} new insights!`);
      }
    },
    onError: (err: Error) => {
      toast.error(`Error fetching insights: ${err.message}`);
    },
  };

  const { data: dashboardInsights, isLoading: isLoadingInsights, error: insightsError } = useQuery(insightsQueryOptions);

  const uniqueCompanies = useMemo(() => {
    const companies = new Set<string>();
    (freshdeskTickets || []).forEach(ticket => {
      if (ticket.cf_company) {
        companies.add(ticket.cf_company);
      }
    });
    return Array.from(companies).sort();
  }, [freshdeskTickets]);

  const isInitialLoadRef = React.useRef(true);

  useEffect(() => {
    if (isInitialLoadRef.current && uniqueCompanies.length > 0) {
      setSelectedCustomersForBreakdown(uniqueCompanies);
      isInitialLoadRef.current = false;
    }
  }, [uniqueCompanies]);

  const { effectiveStartDate, effectiveEndDate, dateRangeDisplay } = useMemo(() => {
    let start: Date | undefined;
    let end: Date | undefined;
    let display: string = "";

    const now = new Date();

    if (typeof activeDateFilter === 'string') {
      switch (activeDateFilter) {
        case "today":
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
          end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
          display = "Today";
          break;
        case "last7days":
          start = subDays(now, 7);
          end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
          display = "Last 7 Days";
          break;
        case "last14days":
          start = subDays(now, 14);
          end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
          display = "Last 14 Days";
          break;
        case "last30days":
          start = subDays(now, 30);
          end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
          display = "Last 30 Days";
          break;
        case "last90days":
          start = subDays(now, 90);
          end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
          display = "Last 90 Days";
          break;
        case "alltime":
          start = new Date(0);
          end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
          display = "All Time";
          break;
        default:
          start = subDays(now, 7);
          end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
          display = "Last 7 Days";
          break;
      }
    } else {
      start = activeDateFilter.from ? new Date(activeDateFilter.from) : undefined;
      end = activeDateFilter.to ? new Date(activeDateFilter.to) : undefined;

      if (start) start.setHours(0, 0, 0, 0);
      if (end) end.setHours(23, 59, 59, 999);
      else end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

      if (start && end) {
        display = `${format(start, "MMM dd, yyyy")} - ${format(end, "MMM dd, yyyy")}`;
      } else if (start) {
        display = `From ${format(start, "MMM dd, yyyy")}`;
      } else {
        display = "Custom Range";
      }
    }

    return { effectiveStartDate: start, effectiveEndDate: end, dateRangeDisplay: display };
  }, [activeDateFilter]);

  const filteredDashboardTickets: Ticket[] = useMemo(() => {
    if (!freshdeskTickets || !effectiveStartDate || !effectiveEndDate) return [];

    let currentTickets: Ticket[] = freshdeskTickets;

    currentTickets = currentTickets.filter(ticket =>
      isWithinInterval(new Date(ticket.created_at), { start: effectiveStartDate, end: effectiveEndDate })
    );

    if (filterMyTickets && userEmail) {
      currentTickets = currentTickets.filter(ticket => ticket.requester_email === userEmail || ticket.assignee?.toLowerCase().includes(fullName.toLowerCase()));
    }
    if (filterHighPriority) {
      currentTickets = currentTickets.filter(ticket => ticket.priority.toLowerCase() === 'high' || ticket.priority.toLowerCase() === 'urgent');
    }

    if (searchTerm) {
      currentTickets = currentTickets.filter(ticket =>
        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.requester_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ticket.assignee && ticket.assignee.toLowerCase().includes(searchTerm.toLowerCase())) ||
        ticket.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return currentTickets;
  }, [freshdeskTickets, effectiveStartDate, effectiveEndDate, filterMyTickets, filterHighPriority, searchTerm, fullName, userEmail]);

  const allOpenTickets = useMemo(() => {
    if (!freshdeskTickets) return [];
    return freshdeskTickets.filter(ticket =>
      (ticket.status.toLowerCase() === 'open (being processed)' ||
       ticket.status.toLowerCase() === 'pending (awaiting your reply)' ||
       ticket.status.toLowerCase() === 'waiting on customer' ||
       ticket.status.toLowerCase() === 'on tech' ||
       ticket.status.toLowerCase() === 'on product' ||
       ticket.status.toLowerCase() === 'escalated')
    );
  }, [freshdeskTickets]);

  const metrics = useMemo(() => {
    if (!freshdeskTickets) {
      return {
        totalTickets: 0,
        openTickets: 0,
        resolvedThisPeriod: 0,
        bugsReceived: 0,
        totalOpenTicketsOverall: 0,
      };
    }

    const totalTickets = filteredDashboardTickets.length;
    const openTickets = filteredDashboardTickets.filter(t => t.status.toLowerCase() === 'open (being processed)').length;
    const resolvedThisPeriod = filteredDashboardTickets.filter(t =>
      (t.status.toLowerCase() === 'resolved' || t.status.toLowerCase() === 'closed') &&
      isWithinInterval(new Date(t.updated_at), { start: effectiveStartDate, end: effectiveEndDate })
    ).length;
    
    const bugsReceived = filteredDashboardTickets.filter(t => t.type?.toLowerCase() === 'bug').length;

    const totalOpenTicketsOverall = (freshdeskTickets || []).filter(t => t.status.toLowerCase() === 'open (being processed)').length;

    return {
      totalTickets,
      openTickets,
      resolvedThisPeriod,
      bugsReceived,
      totalOpenTicketsOverall,
    };
  }, [filteredDashboardTickets, freshdeskTickets, effectiveStartDate, effectiveEndDate]);

  const customerBreakdownData = useMemo(() => {
    if (!filteredDashboardTickets || !effectiveStartDate || !effectiveEndDate) return [];

    const customerMap = new Map<string, CustomerBreakdownRow>();

    filteredDashboardTickets.forEach(ticket => {
      const company = ticket.cf_company || 'Unknown Company';
      
      if (selectedCustomersForBreakdown.length > 0 && !selectedCustomersForBreakdown.includes(company)) {
        return;
      }

      if (!customerMap.has(company)) {
        customerMap.set(company, {
          name: company,
          totalInPeriod: 0,
          resolvedInPeriod: 0,
          open: 0,
          pendingTech: 0,
          bugs: 0,
          otherActive: 0,
        });
      }
      const customerRow = customerMap.get(company)!;

      customerRow.totalInPeriod++;
      const statusLower = ticket.status.toLowerCase();
      if (statusLower === 'resolved' || statusLower === 'closed') {
        customerRow.resolvedInPeriod++;
      } else if (statusLower === 'open (being processed)') {
        customerRow.open++;
      } else {
        customerRow.otherActive++;
      }

      if (ticket.type?.toLowerCase() === 'bug') {
        customerRow.bugs++;
      }
      if (statusLower === 'on tech') {
        customerRow.pendingTech++;
      }
    });

    return Array.from(customerMap.values()).sort((a, b) => b.totalInPeriod - a.totalInPeriod);
  }, [filteredDashboardTickets, selectedCustomersForBreakdown]);

  const grandTotalData: CustomerBreakdownRow = useMemo(() => {
    return customerBreakdownData.reduce((acc, curr) => {
      acc.totalInPeriod += curr.totalInPeriod;
      acc.resolvedInPeriod += curr.resolvedInPeriod;
      acc.open += curr.open;
      acc.pendingTech += curr.pendingTech;
      acc.bugs += curr.bugs;
      acc.otherActive += curr.otherActive;
      return acc;
    }, {
      name: "Grand Total",
      totalInPeriod: 0,
      resolvedInPeriod: 0,
      open: 0,
      pendingTech: 0,
      bugs: 0,
      otherActive: 0,
    });
  }, [customerBreakdownData]);

  const handleExportFilteredTickets = () => {
    exportToCsv(filteredDashboardTickets, `tickets_dashboard_filtered_${format(new Date(), 'yyyyMMdd_HHmmss')}`);
  };

  const handleExportCurrentPage = () => {
    exportToCsv(filteredDashboardTickets, `tickets_dashboard_current_page_${format(new Date(), 'yyyyMMdd_HHmmss')}`);
  };

  const handleExportAggregatedReport = () => {
    exportToCsv(filteredDashboardTickets, `tickets_dashboard_aggregated_report_${format(new Date(), 'yyyyMMdd_HHmmss')}`);
  };

  return (
    <div className="h-screen flex bg-gray-100 dark:bg-gray-900">
      <Sidebar showSidebar={showSidebar} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col p-4 overflow-y-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg flex flex-col">
          {/* Top Bar */}
          <div className="p-6 pb-4 border-b border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="flex flex-col items-start">
                <p className="text-lg font-bold text-gray-700 dark:text-gray-300 flex items-center mb-2">
                  Hi {fullName} <HandWaveIcon className="ml-2 h-6 w-6 text-yellow-500" />
                </p>
                <div className="flex items-center space-x-4">
                  <LayoutDashboard className="h-8 w-8 text-primary" />
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Support Dashboard</h1>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <ThemeToggle />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              {/* Date Range Select */}
              <Select
                value={typeof activeDateFilter === 'string' ? activeDateFilter : "custom"}
                onValueChange={(value) => {
                  if (value === "custom") {
                    setActiveDateFilter({ from: undefined, to: undefined });
                  } else {
                    setActiveDateFilter(value);
                  }
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <CalendarDays className="h-4 w-4 mr-2 text-gray-500" />
                  <SelectValue placeholder="Select Date Range">
                    {dateRangeDisplay}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="last7days">Last 7 Days</SelectItem>
                  <SelectItem value="last14days">Last 14 Days</SelectItem>
                  <SelectItem value="last30days">Last 30 Days</SelectItem>
                  <SelectItem value="last90days">Last 90 Days</SelectItem>
                  <SelectItem value="alltime">All Time</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>

              {/* Custom Date Picker Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-[200px] justify-start text-left font-normal"
                    style={{ display: typeof activeDateFilter !== 'string' || (typeof activeDateFilter === 'string' && activeDateFilter === 'custom') ? 'flex' : 'none' }}
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {effectiveStartDate && effectiveEndDate
                      ? `${format(effectiveStartDate, "PPP")} - ${format(effectiveEndDate, "PPP")}`
                      : <span>Pick a custom range</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={effectiveStartDate || new Date()}
                    selected={typeof activeDateFilter !== 'string' ? activeDateFilter : undefined}
                    onSelect={(range) => {
                      if (range?.from) {
                        setActiveDateFilter({
                          from: range.from,
                          to: range.to || addDays(range.from, 0),
                        });
                      } else {
                        setActiveDateFilter("last7days");
                      }
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>

              {/* Quick Filter Chips */}
              <Button
                variant={filterMyTickets ? "secondary" : "outline"}
                onClick={() => setFilterMyTickets(!filterMyTickets)}
                className="flex items-center gap-1"
              >
                <User className="h-4 w-4" /> My Tickets
              </Button>
              <Button
                variant={filterHighPriority ? "secondary" : "outline"}
                onClick={() => setFilterHighPriority(!filterHighPriority)}
                className="flex items-center gap-1"
              >
                <AlertCircle className="h-4 w-4" /> High Priority
              </Button>
              <Button
                variant={filterSLABreached ? "secondary" : "outline"}
                onClick={() => setFilterSLABreached(!filterSLABreached)}
                className="flex items-center gap-1"
              >
                <ShieldAlert className="h-4 w-4" /> SLA Breached
              </Button>

              {/* Insights Button */}
              <Button
                variant="default"
                onClick={() => setIsInsightsSheetOpen(true)}
                className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Lightbulb className="h-4 w-4" /> Insights
              </Button>

              {/* New: View Open Tickets Button */}
              <Button
                variant="default"
                onClick={() => setIsMyOpenTicketsModalOpen(true)}
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <TicketIcon className="h-4 w-4" /> View Open Tickets
              </Button>

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
                  <DropdownMenuItem onClick={handleExportCurrentPage}>Current Page (CSV)</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportFilteredTickets}>Filtered Results (CSV)</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportAggregatedReport}>Aggregated Report (Excel)</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center flex-grow p-6 text-gray-500 dark:text-gray-400">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-lg font-medium">Loading dashboard data...</p>
            </div>
          ) : (
            <>
              {/* KPI Cards Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 p-6 pb-4 border-b border-gray-200 dark:border-gray-700 mb-8">
                <DashboardMetricCard
                  title="Total Tickets"
                  value={metrics.totalTickets}
                  icon={TicketIcon}
                  trend={12}
                  description="The total number of support tickets created in the selected period."
                />
                <DashboardMetricCard
                  title="Total Open Tickets"
                  value={metrics.totalOpenTicketsOverall}
                  icon={Clock}
                  trend={-5}
                  description="Total number of open tickets across all time, regardless of date filter."
                />
                <DashboardMetricCard
                  title="Open Tickets"
                  value={metrics.openTickets}
                  icon={Hourglass}
                  trend={-5}
                  description="Tickets that are currently open and being processed within the selected period."
                />
                <DashboardMetricCard
                  title="Resolved This Period"
                  value={metrics.resolvedThisPeriod}
                  icon={CheckCircle}
                  trend={15}
                  description={`Tickets resolved or closed in the selected period (${dateRangeDisplay}).`}
                />
                <DashboardMetricCard
                  title="Bugs Received"
                  value={metrics.bugsReceived}
                  icon={Bug}
                  trend={8}
                  description="Number of tickets categorized as 'Bug' in the selected period."
                />
              </div>

              {/* Customer Breakdown Section */}
              <div className="p-6 pb-4 border-b border-gray-200 dark:border-gray-700 mb-8"> {/* Removed grid and col-span */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Customer Breakdown for {dateRangeDisplay}</h3>
                  <div className="flex items-center gap-3">
                    <MultiSelect
                      options={uniqueCompanies.map(company => ({ value: company, label: company }))}
                      selected={selectedCustomersForBreakdown}
                      onSelectedChange={setSelectedCustomersForBreakdown}
                      placeholder="Select Customers"
                      className="w-[250px]"
                    />
                    <Select value={customerBreakdownView} onValueChange={(value: 'cards' | 'table') => setCustomerBreakdownView(value)}>
                      <SelectTrigger className="w-[120px]">
                        {customerBreakdownView === 'cards' ? <LayoutGrid className="h-4 w-4 mr-2" /> : <Table2 className="h-4 w-4 mr-2" />}
                        <SelectValue placeholder="View As" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cards">Cards</SelectItem>
                        <SelectItem value="table">Table</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {customerBreakdownData.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-3">
                    No customer breakdown data for the selected date and filters.
                  </p>
                ) : (
                  customerBreakdownView === 'cards' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                      {customerBreakdownData.map((customer) => (
                        <CustomerBreakdownCard key={customer.name} customerData={customer} />
                      ))}
                      {customerBreakdownData.length > 0 && (
                        <CustomerBreakdownCard customerData={grandTotalData} isGrandTotal={true} />
                      )}
                    </div>
                  ) : (
                    <CustomerBreakdownTable data={[...customerBreakdownData, grandTotalData]} />
                  )
                )}
              </div>

              {/* Charts & Visuals Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-6 pb-4 mb-8">
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-inner flex flex-col items-center justify-center h-80 text-gray-500 dark:text-gray-400 transition-all duration-300 hover:shadow-lg hover:scale-[1.01]">
                  <h3 className="text-lg font-semibold mb-2 text-foreground w-full text-center">Tickets Over Time</h3>
                  <TicketsOverTimeChart tickets={freshdeskTickets || []} startDate={effectiveStartDate} endDate={effectiveEndDate} />
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-inner flex flex-col items-center justify-center h-80 text-gray-500 dark:text-gray-400 transition-all duration-300 hover:shadow-lg hover:scale-[1.01]">
                  <div className="flex justify-between items-center w-full mb-2">
                    <h3 className="text-lg font-semibold text-foreground w-full text-center">Ticket Type by Customer</h3>
                    <Select value={selectedCustomerForChart} onValueChange={setSelectedCustomerForChart}>
                      <SelectTrigger className="w-[180px] h-8">
                        <SelectValue placeholder="All Customers" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Customers</SelectItem>
                        {uniqueCompanies.map(company => (
                          <SelectItem key={company} value={company}>
                            {company}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <TicketTypeByCustomerChart tickets={filteredDashboardTickets || []} selectedCustomer={selectedCustomerForChart} />
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-inner flex flex-col items-center justify-center h-80 text-gray-500 dark:text-gray-400 transition-all duration-300 hover:shadow-lg hover:scale-[1.01]">
                  <h3 className="text-lg font-semibold mb-2 text-foreground w-full text-center">Priority Distribution</h3>
                  <PriorityDistributionChart tickets={filteredDashboardTickets || []} />
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
                  <AssigneeLoadChart tickets={filteredDashboardTickets || []} displayMode={assigneeChartMode} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <MyOpenTicketsModal
        isOpen={isMyOpenTicketsModalOpen}
        onClose={() => setIsMyOpenTicketsModalOpen(false)}
        tickets={allOpenTickets}
      />
      <InsightsSheet
        isOpen={isInsightsSheetOpen}
        onClose={() => setIsInsightsSheetOpen(false)}
        insights={dashboardInsights || []}
      />
    </div>
  );
};

export default Index;