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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"; // Import Popover components
import { Calendar } from "@/components/ui/calendar"; // Import Calendar component
import { Search, LayoutDashboard, TicketIcon, Hourglass, CalendarDays, CheckCircle, AlertCircle, ShieldAlert, Download, Filter, Bookmark, ChevronDown, Bug, Clock, User, Percent, Users } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Ticket, CustomerBreakdownRow } from "@/types";
import { isWithinInterval, subDays, format, addDays } from 'date-fns'; // Import addDays for date range calculations
import { DateRange } from "react-day-picker"; // Import DateRange type
import { exportToCsv } from '@/utils/export';
import LoadingSpinner from "@/components/LoadingSpinner";

// Import chart components
import TicketsOverTimeChart from "@/components/TicketsOverTimeChart";
import TicketTypeByCustomerChart from "@/components/TicketTypeByCustomerChart";
import PriorityDistributionChart from "@/components/PriorityDistributionChart";
import AssigneeLoadChart from "@/components/AssigneeLoadChart";
import CustomerBreakdownCard from "@/components/CustomerBreakdownCard";
import { MultiSelect } from "@/components/MultiSelect";

const Index = () => {
  const { session } = useSupabase();
  const user = session?.user;
  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email;

  const [showSidebar, setShowSidebar] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  // Changed dateRange to activeDateFilter to handle both string and object
  const [activeDateFilter, setActiveDateFilter] = useState<string | DateRange>("last7days");
  const [filterMyTickets, setFilterMyTickets] = useState(false);
  const [filterHighPriority, setFilterHighPriority] = useState(false);
  const [filterSLABreached, setFilterSLABreached] = useState(false);
  const [selectedCustomerForChart, setSelectedCustomerForChart] = useState<string>("All");
  const [selectedCustomersForBreakdown, setSelectedCustomersForBreakdown] = useState<string[]>([]);
  const [assigneeChartMode, setAssigneeChartMode] = useState<'count' | 'percentage'>('count');

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

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

  const uniqueCompanies = useMemo(() => {
    const companies = new Set<string>();
    freshdeskTickets?.forEach(ticket => {
      if (ticket.cf_company) {
        companies.add(ticket.cf_company);
      }
    });
    return Array.from(companies).sort();
  }, [freshdeskTickets]);

  // Use a ref to track if it's the initial load for selectedCustomersForBreakdown
  const isInitialLoadRef = React.useRef(true);

  // Initialize selectedCustomersForBreakdown with all unique companies once data loads
  useEffect(() => {
    if (isInitialLoadRef.current && uniqueCompanies.length > 0) {
      setSelectedCustomersForBreakdown(uniqueCompanies);
      isInitialLoadRef.current = false; // Mark as not initial load anymore
    }
  }, [uniqueCompanies]);


  // Helper to determine the effective date range for filtering
  const { effectiveStartDate, effectiveEndDate, dateRangeDisplay } = useMemo(() => {
    const now = new Date();
    let start: Date | undefined;
    let end: Date | undefined = now;
    let display: string = "";

    if (typeof activeDateFilter === 'string') {
      switch (activeDateFilter) {
        case "today":
          start = new Date(now.setHours(0, 0, 0, 0));
          end = new Date(now.setHours(23, 59, 59, 999));
          display = "Today";
          break;
        case "last7days":
          start = subDays(now, 7);
          display = "Last 7 Days";
          break;
        case "last14days":
          start = subDays(now, 14);
          display = "Last 14 Days";
          break;
        case "last30days":
          start = subDays(now, 30);
          display = "Last 30 Days";
          break;
        case "last90days":
          start = subDays(now, 90);
          display = "Last 90 Days";
          break;
        case "alltime":
          start = new Date(0); // Epoch
          display = "All Time";
          break;
        default:
          start = subDays(now, 7); // Default to last 7 days
          display = "Last 7 Days";
          break;
      }
    } else { // Custom date range object
      start = activeDateFilter.from;
      end = activeDateFilter.to || now; // If 'to' is not set, default to now
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

  const filteredDashboardTickets = useMemo(() => {
    if (!freshdeskTickets || !effectiveStartDate || !effectiveEndDate) return [];

    let currentTickets = freshdeskTickets;

    // Date filtering based on effectiveStartDate and effectiveEndDate
    currentTickets = currentTickets.filter(ticket =>
      isWithinInterval(new Date(ticket.created_at), { start: effectiveStartDate, end: effectiveEndDate })
    );

    // ... existing filters (filterMyTickets, filterHighPriority, searchTerm)
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


  const metrics = useMemo(() => {
    if (!filteredDashboardTickets || !effectiveStartDate || !effectiveEndDate) {
      return {
        totalTickets: 0,
        openTickets: 0,
        newThisPeriod: 0,
        resolvedThisPeriod: 0,
        highPriorityTickets: 0,
        slaBreaches: 0,
      };
    }

    const totalTickets = filteredDashboardTickets.length;
    const openTickets = filteredDashboardTickets.filter(t => t.status.toLowerCase() === 'open (being processed)').length;
    const newThisPeriod = filteredDashboardTickets.length; // Already filtered by date range
    const resolvedThisPeriod = filteredDashboardTickets.filter(t =>
      (t.status.toLowerCase() === 'resolved' || t.status.toLowerCase() === 'closed') &&
      isWithinInterval(new Date(t.updated_at), { start: effectiveStartDate, end: effectiveEndDate })
    ).length;
    const highPriorityTickets = filteredDashboardTickets.filter(t => t.priority.toLowerCase() === 'high' || t.priority.toLowerCase() === 'urgent').length;
    const slaBreaches = 5; // Placeholder

    return {
      totalTickets,
      openTickets,
      newThisPeriod,
      resolvedThisPeriod,
      highPriorityTickets,
      slaBreaches,
    };
  }, [filteredDashboardTickets, effectiveStartDate, effectiveEndDate]);

  const customerBreakdownData = useMemo(() => {
    if (!filteredDashboardTickets || !effectiveStartDate || !effectiveEndDate) return [];

    const customerMap = new Map<string, CustomerBreakdownRow>();

    filteredDashboardTickets.forEach(ticket => {
      const company = ticket.cf_company || 'Unknown Company';
      
      // Filter by selected customers for breakdown
      if (selectedCustomersForBreakdown.length > 0 && !selectedCustomersForBreakdown.includes(company)) {
        return; // Skip if not in selected customers
      }

      if (!customerMap.has(company)) {
        customerMap.set(company, {
          name: company,
          totalToday: 0,
          resolvedToday: 0,
          open: 0,
          pendingTech: 0,
          bugs: 0,
          otherActive: 0,
        });
      }
      const customerRow = customerMap.get(company)!;

      // Tickets are already filtered by creation date in filteredDashboardTickets
      customerRow.totalToday++;
      const statusLower = ticket.status.toLowerCase();
      if (statusLower === 'resolved' || statusLower === 'closed') {
        customerRow.resolvedToday++;
      } else if (statusLower === 'open (being processed)') {
        customerRow.open++;
      } else if (statusLower === 'on tech') {
        customerRow.pendingTech++;
      } else {
        customerRow.otherActive++;
      }

      if (ticket.type?.toLowerCase() === 'bug') {
        customerRow.bugs++;
      }
    });

    return Array.from(customerMap.values()).sort((a, b) => b.totalToday - a.totalToday);
  }, [filteredDashboardTickets, selectedCustomersForBreakdown]);

  const grandTotalData: CustomerBreakdownRow = useMemo(() => {
    return customerBreakdownData.reduce((acc, curr) => {
      acc.totalToday += curr.totalToday;
      acc.resolvedToday += curr.resolvedToday;
      acc.open += curr.open;
      acc.pendingTech += curr.pendingTech;
      acc.bugs += curr.bugs;
      acc.otherActive += curr.otherActive;
      return acc;
    }, {
      name: "Grand Total",
      totalToday: 0,
      resolvedToday: 0,
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


  if (isLoading) {
    return <LoadingSpinner />;
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
      <div className="flex-1 flex flex-col p-4 overflow-y-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg flex flex-col">
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
              {/* Date Range Select */}
              <Select
                value={typeof activeDateFilter === 'string' ? activeDateFilter : "custom"}
                onValueChange={(value) => {
                  if (value === "custom") {
                    // When "Custom Range" is selected, we don't immediately change activeDateFilter
                    // The Popover's Calendar will handle setting the DateRange object
                    // For now, we can set a placeholder or keep the previous custom range if any
                    setActiveDateFilter({ from: undefined, to: undefined }); // Clear previous custom range
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
                    // Only show this button if "Custom Range" is selected in the Select, or if a custom range is already active
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
                          to: range.to || addDays(range.from, 0), // Default to same day if only 'from' is selected
                        });
                      } else {
                        setActiveDateFilter("last7days"); // Reset to default if range is cleared
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
                  <DropdownMenuItem onClick={handleExportCurrentPage}>Current Page (CSV)</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportFilteredTickets}>Filtered Results (CSV)</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportAggregatedReport}>Aggregated Report (Excel)</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* KPI Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 p-6 pb-4 border-b border-gray-200 dark:border-gray-700 mb-8">
            <DashboardMetricCard
              title="Total Tickets"
              value={metrics.totalTickets}
              icon={TicketIcon}
              trend={12}
              description="The total number of support tickets received."
            />
            <DashboardMetricCard
              title="Open Tickets"
              value={metrics.openTickets}
              icon={Hourglass}
              trend={-5}
              description="Tickets that are currently open and being processed."
            />
            <DashboardMetricCard
              title="New This Period"
              value={metrics.newThisPeriod}
              icon={CalendarDays}
              trend={8}
              description={`New tickets created in the selected period (${dateRangeDisplay}).`}
            />
            <DashboardMetricCard
              title="Resolved This Period"
              value={metrics.resolvedThisPeriod}
              icon={CheckCircle}
              trend={15}
              description={`Tickets resolved or closed in the selected period (${dateRangeDisplay}).`}
            />
            <DashboardMetricCard
              title="High Priority"
              value={metrics.highPriorityTickets}
              icon={AlertCircle}
              trend={-2}
              description="Tickets marked as High or Urgent priority, requiring immediate attention."
            />
            <DashboardMetricCard
              title="SLA Breaches"
              value={metrics.slaBreaches}
              icon={ShieldAlert}
              trend={3}
              description="Number of tickets that have exceeded their Service Level Agreement (SLA)."
            />
          </div>

          {/* Customer Breakdown Section */}
          <div className="p-6 pb-4 border-b border-gray-200 dark:border-gray-700 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-foreground">Customer Breakdown for {dateRangeDisplay}</h3>
              <MultiSelect
                options={uniqueCompanies.map(company => ({ value: company, label: company }))}
                selected={selectedCustomersForBreakdown}
                onSelectedChange={setSelectedCustomersForBreakdown}
                placeholder="Select Customers"
                className="w-[250px]"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {customerBreakdownData.map((customer) => (
                <CustomerBreakdownCard key={customer.name} customerData={customer} />
              ))}
              {customerBreakdownData.length > 0 && (
                <CustomerBreakdownCard customerData={grandTotalData} isGrandTotal={true} />
              )}
            </div>
            {customerBreakdownData.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-3">
                No customer breakdown data for the selected date and filters.
              </p>
            )}
          </div>

          {/* Charts & Visuals Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-6 pb-4 mb-8">
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-inner flex flex-col items-center justify-center h-80 text-gray-500 dark:text-gray-400 transition-all duration-300 hover:shadow-lg hover:scale-[1.01]">
              <h3 className="text-lg font-semibold mb-2 text-foreground w-full text-center">Tickets Over Time</h3>
              <TicketsOverTimeChart tickets={filteredDashboardTickets || []} startDate={effectiveStartDate} endDate={effectiveEndDate} />
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-inner flex flex-col items-center justify-center h-80 text-gray-500 dark:text-gray-400 transition-all duration-300 hover:shadow-lg hover:scale-[1.01]">
              <div className="flex justify-between items-center w-full mb-2">
                <h3 className="text-lg font-semibold text-foreground w-full text-center">Ticket Type by Customer</h3>
                <Select value={selectedCustomerForChart} onValueChange={setSelectedCustomerForChart}>
                  <SelectTrigger className="w-[180px] h-8">
                    <SelectValue placeholder="All Customers" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Options for chart filter, including "All" */}
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