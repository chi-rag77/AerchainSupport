"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import HandWaveIcon from "@/components/HandWaveIcon";
import DashboardMetricCard from "@/components/DashboardMetricCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Search, LayoutDashboard, TicketIcon, Hourglass, CalendarDays, CheckCircle, AlertCircle, ShieldAlert, Download, Filter, Bookmark, ChevronDown, Bug, Clock, User, Percent, Users, Loader2, Table2, LayoutGrid, Info, Lightbulb, RefreshCw, BarChart2, Flag } from "lucide-react"; // Added Flag icon
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Ticket, CustomerBreakdownRow, Insight } from "@/types";
import { isWithinInterval, subDays, format, addDays, differenceInDays } from 'date-fns';
import { DateRange } from "react-day-picker";
import { exportToCsv } from '@/utils/export';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Import Card components
import { Separator } from "@/components/ui/separator"; // Import Separator

// Import chart components
import TicketsOverTimeChart from "@/components/TicketsOverTimeChart";
import TicketTypeByCustomerChart from "@/components/TicketTypeByCustomerChart";
import PriorityDistributionChart from "@/components/PriorityDistributionChart";
import AssigneeLoadChart from "@/components/AssigneeLoadChart";
import CustomerBreakdownCard from "@/components/CustomerBreakdownCard";
import CustomerBreakdownTable from "@/components/CustomerBreakdownTable";
import { MultiSelect } from "@/components/MultiSelect";
import MyOpenTicketsModal from "@/components/MyOpenTicketsModal";
import InsightsSheet from "@/components/InsightsSheet";

const fetchDashboardInsights = async (token: string | undefined): Promise<Insight[]> => {
  if (!token) return [];

  try {
    const { data, error } = await supabase.functions.invoke('generate-dashboard-insights', {
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

  const [activeDateFilter, setActiveDateFilter] = useState<string | DateRange>("last7days");
  const [filterMyTickets, setFilterMyTickets] = useState(false);
  const [filterHighPriority, setFilterHighPriority] = useState(false);
  const [filterSLABreached, setFilterSLABreached] = useState(false);
  const [selectedCustomerForChart, setSelectedCustomerForChart] = useState<string>("All");
  const [selectedCustomersForBreakdown, setSelectedCustomersForBreakdown] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]); // New state for priority multi-select
  const [assigneeChartMode, setAssigneeChartMode] = useState<'count' | 'percentage'>('count');
  const [customerBreakdownView, setCustomerBreakdownView] = useState<'cards' | 'table'>('cards');
  const [isMyOpenTicketsModalOpen, setIsMyOpenTicketsModalOpen] = useState(false);
  const [isInsightsSheetOpen, setIsInsightsSheetOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: freshdeskTickets, isLoading, error, isFetching } = useQuery<Ticket[], Error>({
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

  const uniqueCompanies = useMemo(() => {
    const companies = new Set<string>();
    (freshdeskTickets || []).forEach(ticket => {
      if (ticket.cf_company) {
        companies.add(ticket.cf_company);
      }
    });
    return Array.from(companies).sort();
  }, [freshdeskTickets]);

  const uniquePriorities = useMemo(() => {
    const priorities = new Set<string>();
    (freshdeskTickets || []).forEach(ticket => {
      priorities.add(ticket.priority);
    });
    return Array.from(priorities).sort();
  }, [freshdeskTickets]);

  const isInitialLoadRef = React.useRef(true);

  useEffect(() => {
    if (isInitialLoadRef.current && uniqueCompanies.length > 0) {
      setSelectedCustomersForBreakdown(uniqueCompanies);
      isInitialLoadRef.current = false;
    }
  }, [uniqueCompanies]);

  const { effectiveStartDate, effectiveEndDate, dateRangeDisplay, previousEffectiveStartDate, previousEffectiveEndDate } = useMemo(() => {
    let start: Date | undefined;
    let end: Date | undefined;
    let prevStart: Date | undefined;
    let prevEnd: Date | undefined;
    let display: string = "";

    const now = new Date();

    if (typeof activeDateFilter === 'string') {
      switch (activeDateFilter) {
        case "today":
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
          end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
          prevStart = subDays(start, 1);
          prevEnd = subDays(end, 1);
          display = "Today";
          break;
        case "last7days":
          start = subDays(now, 7);
          end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
          prevStart = subDays(start, 7);
          prevEnd = subDays(end, 7);
          display = "Last 7 Days";
          break;
        case "last14days":
          start = subDays(now, 14);
          end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
          prevStart = subDays(start, 14);
          prevEnd = subDays(end, 14);
          display = "Last 14 Days";
          break;
        case "last30days":
          start = subDays(now, 30);
          end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
          prevStart = subDays(start, 30);
          prevEnd = subDays(end, 30);
          display = "Last 30 Days";
          break;
        case "last90days":
          start = subDays(now, 90);
          end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
          prevStart = subDays(start, 90);
          prevEnd = subDays(end, 90);
          display = "Last 90 Days";
          break;
        case "alltime":
          start = new Date(0);
          end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
          prevStart = undefined;
          prevEnd = undefined;
          display = "All Time";
          break;
        default:
          start = subDays(now, 7);
          end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
          prevStart = subDays(start, 7);
          prevEnd = subDays(end, 7);
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
        const duration = differenceInDays(end, start) + 1;
        prevStart = subDays(start, duration);
        prevEnd = subDays(end, duration);
        display = `${format(start, "MMM dd, yyyy")} - ${format(end, "MMM dd, yyyy")}`;
      } else if (start) {
        display = `From ${format(start, "MMM dd, yyyy")}`;
        prevStart = undefined;
        prevEnd = undefined;
      } else {
        display = "Custom Range";
        prevStart = undefined;
        prevEnd = undefined;
      }
    }

    return { effectiveStartDate: start, effectiveEndDate: end, dateRangeDisplay: display, previousEffectiveStartDate: prevStart, previousEffectiveEndDate: prevEnd };
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
    if (filterSLABreached) {
      currentTickets = currentTickets.filter(ticket => {
        if (ticket.due_by) {
          const dueDate = parseISO(ticket.due_by);
          const now = new Date();
          const statusLower = ticket.status.toLowerCase();
          return isPast(dueDate) && statusLower !== 'resolved' && statusLower !== 'closed';
        }
        return false;
      });
    }
    if (selectedPriorities.length > 0) {
      currentTickets = currentTickets.filter(ticket => selectedPriorities.includes(ticket.priority));
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
  }, [freshdeskTickets, effectiveStartDate, effectiveEndDate, filterMyTickets, filterHighPriority, filterSLABreached, selectedPriorities, searchTerm, fullName, userEmail]);

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
        averageResolutionTime: "N/A",
        slaAdherenceRate: "N/A",
      };
    }

    const totalTickets = filteredDashboardTickets.length;
    const openTickets = filteredDashboardTickets.filter(t => t.status.toLowerCase() === 'open (being processed)').length;
    const resolvedThisPeriod = filteredDashboardTickets.filter(t =>
      (t.status.toLowerCase() === 'resolved' || t.status.toLowerCase() === 'closed') &&
      isWithinInterval(new Date(t.updated_at), { start: effectiveStartDate, end: effectiveEndDate })
    ).length;
    
    const bugsReceived = filteredDashboardTickets.filter(t => t.type?.toLowerCase() === 'bug').length;

    const totalOpenTicketsOverall = (freshdeskTickets || []).filter(t => t.status.toLowerCase() !== 'resolved' && t.status.toLowerCase() !== 'closed').length;

    // Calculate Average Resolution Time
    const resolvedTicketsForAvgTime = filteredDashboardTickets.filter(t => t.status.toLowerCase() === 'resolved' || t.status.toLowerCase() === 'closed');
    let averageResolutionTime: string = "N/A";
    if (resolvedTicketsForAvgTime.length > 0) {
      const totalDays = resolvedTicketsForAvgTime.reduce((sum, t) => {
        const created = new Date(t.created_at);
        const updated = new Date(t.updated_at);
        return sum + differenceInDays(updated, created);
      }, 0);
      averageResolutionTime = (totalDays / resolvedTicketsForAvgTime.length).toFixed(1) + " days";
    }

    // Calculate SLA Adherence Rate
    const slaApplicableTickets = filteredDashboardTickets.filter(t => t.due_by);
    let slaAdherenceRate: string = "N/A";
    if (slaApplicableTickets.length > 0) {
      const metSlaCount = slaApplicableTickets.filter(t => {
        const updated = new Date(t.updated_at);
        const due = new Date(t.due_by!);
        return updated <= due;
      }).length;
      slaAdherenceRate = ((metSlaCount / slaApplicableTickets.length) * 100).toFixed(1) + "%";
    }

    return {
      totalTickets,
      openTickets,
      resolvedThisPeriod,
      bugsReceived,
      totalOpenTicketsOverall,
      averageResolutionTime,
      slaAdherenceRate,
    };
  }, [filteredDashboardTickets, freshdeskTickets, effectiveStartDate, effectiveEndDate]);

  const customerBreakdownData = useMemo(() => {
    if (!filteredDashboardTickets || !freshdeskTickets || !effectiveStartDate || !effectiveEndDate) return [];

    const customerMap = new Map<string, CustomerBreakdownRow>();
    const previousCustomerMap = new Map<string, number>();

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

    if (previousEffectiveStartDate && previousEffectiveEndDate) {
      freshdeskTickets.forEach(ticket => {
        const company = ticket.cf_company || 'Unknown Company';
        if (selectedCustomersForBreakdown.length > 0 && !selectedCustomersForBreakdown.includes(company)) {
          return;
        }
        if (isWithinInterval(new Date(ticket.created_at), { start: previousEffectiveStartDate, end: previousEffectiveEndDate })) {
          previousCustomerMap.set(company, (previousCustomerMap.get(company) || 0) + 1);
        }
      });
    }

    const dataWithTrend = Array.from(customerMap.values()).map(customerRow => {
      const previousTotal = previousCustomerMap.get(customerRow.name) || 0;
      let trend: number | undefined;
      if (previousTotal > 0) {
        trend = ((customerRow.totalInPeriod - previousTotal) / previousTotal) * 100;
      } else if (customerRow.totalInPeriod > 0) {
        trend = 100;
      } else {
        trend = 0;
      }
      return { ...customerRow, totalTicketsTrend: trend };
    }).sort((a, b) => b.totalInPeriod - a.totalInPeriod);

    return dataWithTrend;
  }, [filteredDashboardTickets, freshdeskTickets, selectedCustomersForBreakdown, effectiveStartDate, effectiveEndDate, previousEffectiveStartDate, previousEffectiveEndDate]);

  const grandTotalData: CustomerBreakdownRow = useMemo(() => {
    const currentTotal = customerBreakdownData.reduce((acc, curr) => acc + curr.totalInPeriod, 0);
    const resolvedTotal = customerBreakdownData.reduce((acc, curr) => acc + curr.resolvedInPeriod, 0);
    const openTotal = customerBreakdownData.reduce((acc, curr) => acc + curr.open, 0);
    const pendingTechTotal = customerBreakdownData.reduce((acc, curr) => acc + curr.pendingTech, 0);
    const bugsTotal = customerBreakdownData.reduce((acc, curr) => acc + curr.bugs, 0);
    const otherActiveTotal = customerBreakdownData.reduce((acc, curr) => acc + curr.otherActive, 0);

    let grandTotalTrend: number | undefined;
    if (previousEffectiveStartDate && previousEffectiveEndDate) {
      const previousGrandTotal = freshdeskTickets?.filter(ticket =>
        isWithinInterval(new Date(ticket.created_at), { start: previousEffectiveStartDate, end: previousEffectiveEndDate }) &&
        (selectedCustomersForBreakdown.length === 0 || (ticket.cf_company && selectedCustomersForBreakdown.includes(ticket.cf_company)))
      ).length || 0;

      if (previousGrandTotal > 0) {
        grandTotalTrend = ((currentTotal - previousGrandTotal) / previousGrandTotal) * 100;
      } else if (currentTotal > 0) {
        grandTotalTrend = 100;
      } else {
        grandTotalTrend = 0;
      }
    }

    return {
      name: "Grand Total",
      totalInPeriod: currentTotal,
      resolvedInPeriod: resolvedTotal,
      open: openTotal,
      pendingTech: pendingTechTotal,
      bugs: bugsTotal,
      otherActive: otherActiveTotal,
      totalTicketsTrend: grandTotalTrend,
    };
  }, [customerBreakdownData, freshdeskTickets, previousEffectiveStartDate, previousEffectiveEndDate, selectedCustomersForBreakdown]);

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
                <LayoutDashboard className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Support Dashboard</h1>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Insights for: <span className="font-semibold">{dateRangeDisplay}</span>
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => { /* handle sync tickets */ }}
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

          {/* Filter Bar */}
          <div className="flex flex-wrap gap-4 items-center p-6 pt-4 bg-gray-50 dark:bg-gray-700 rounded-b-xl shadow-inner">
            {/* Date Range */}
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
              <SelectTrigger className="w-[180px] bg-card">
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
                  className="w-[200px] justify-start text-left font-normal bg-card"
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

            {/* Priority Multi-Select */}
            <MultiSelect
              options={uniquePriorities.map(priority => ({ value: priority, label: priority }))}
              selected={selectedPriorities}
              onSelectedChange={setSelectedPriorities}
              placeholder="Filter by Priority"
              className="w-[180px] bg-card"
              icon={Flag}
            />

            {/* Quick Filter Chips */}
            <Button
              variant={filterMyTickets ? "secondary" : "outline"}
              onClick={() => setFilterMyTickets(!filterMyTickets)}
              className="flex items-center gap-1 bg-card"
            >
              <User className="h-4 w-4" /> My Tickets
            </Button>
            <Button
              variant={filterHighPriority ? "secondary" : "outline"}
              onClick={() => setFilterHighPriority(!filterHighPriority)}
              className="flex items-center gap-1 bg-card"
            >
              <AlertCircle className="h-4 w-4" /> High Priority
            </Button>
            <Button
              variant={filterSLABreached ? "secondary" : "outline"}
              onClick={() => setFilterSLABreached(!filterSLABreached)}
              className="flex items-center gap-1 bg-card"
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

            {/* View Open Tickets Button */}
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
                <Button variant="outline" className="flex items-center gap-1 bg-card">
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
                <Button className="flex items-center gap-1 bg-primary text-primary-foreground">
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
          <div className="flex flex-col items-center justify-center flex-grow p-8 text-gray-500 dark:text-gray-400">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg font-medium">Loading dashboard data...</p>
          </div>
        ) : (
          <div className="flex-grow p-8 space-y-10 bg-gray-50 dark:bg-gray-900/50">
            {/* KPI Cards Row */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                <LayoutDashboard className="h-6 w-6 text-blue-600" /> Key Performance Indicators
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6"> {/* Adjusted grid for 6-8 cards */}
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
                <DashboardMetricCard
                  title="Avg. Resolution Time"
                  value={metrics.averageResolutionTime}
                  icon={Clock}
                  trend={-3} // Negative trend is good for time
                  description="Average time taken to resolve tickets in the selected period."
                />
                <DashboardMetricCard
                  title="SLA Adherence Rate"
                  value={metrics.slaAdherenceRate}
                  icon={ShieldAlert}
                  trend={2}
                  description="Percentage of tickets that met their Service Level Agreement (SLA) in the selected period."
                />
              </div>
            </section>

            <Separator className="my-10" />

            {/* Customer Breakdown Section */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                <Users className="h-6 w-6 text-green-600" /> Customer Breakdown
              </h2>
              <Card className="p-6 bg-card border border-border shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <CardTitle className="text-lg font-semibold text-foreground">Customer Breakdown for {dateRangeDisplay}</CardTitle>
                  <div className="flex items-center gap-3">
                    <MultiSelect
                      options={uniqueCompanies.map(company => ({ value: company, label: company }))}
                      selected={selectedCustomersForBreakdown}
                      onSelectedChange={setSelectedCustomersForBreakdown}
                      placeholder="Select Customers"
                      className="w-[250px] bg-card"
                    />
                    <Select value={customerBreakdownView} onValueChange={(value: 'cards' | 'table') => setCustomerBreakdownView(value)}>
                      <SelectTrigger className="w-[120px] bg-card">
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
              </Card>
            </section>

            <Separator className="my-10" />

            {/* Charts & Visuals Row */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                <BarChart2 className="h-6 w-6 text-indigo-600" /> Key Visualizations
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="h-96 p-6 bg-card border border-border shadow-sm">
                  <CardTitle className="text-lg font-semibold mb-2 text-foreground w-full text-center">Ticket Volume Trend (Created vs Resolved)</CardTitle>
                  <CardContent className="h-[calc(100%-40px)] p-0">
                    <TicketsOverTimeChart tickets={freshdeskTickets || []} startDate={effectiveStartDate} endDate={effectiveEndDate} />
                  </CardContent>
                </Card>
                <Card className="h-96 p-6 bg-card border border-border shadow-sm">
                  <div className="flex justify-between items-center w-full mb-2">
                    <CardTitle className="text-lg font-semibold text-foreground w-full text-center">Ticket Type by Customer</CardTitle>
                    <Select value={selectedCustomerForChart} onValueChange={setSelectedCustomerForChart}>
                      <SelectTrigger className="w-[180px] h-8 bg-card">
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
                  <CardContent className="h-[calc(100%-40px)] p-0">
                    <TicketTypeByCustomerChart tickets={filteredDashboardTickets || []} selectedCustomer={selectedCustomerForChart} />
                  </CardContent>
                </Card>
                <Card className="h-96 p-6 bg-card border border-border shadow-sm">
                  <CardTitle className="text-lg font-semibold mb-2 text-foreground w-full text-center">Priority Distribution</CardTitle>
                  <CardContent className="h-[calc(100%-40px)] p-0">
                    <PriorityDistributionChart tickets={filteredDashboardTickets || []} />
                  </CardContent>
                </Card>
                <Card className="h-96 p-6 bg-card border border-border shadow-sm">
                  <div className="flex justify-between items-center w-full mb-2">
                    <CardTitle className="text-lg font-semibold text-foreground w-full text-center">Assignee Load</CardTitle>
                    <Select value={assigneeChartMode} onValueChange={(value: 'count' | 'percentage') => setAssigneeChartMode(value)}>
                      <SelectTrigger className="w-[120px] h-8 bg-card">
                        <SelectValue placeholder="Display Mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="count">Count</SelectItem>
                        <SelectItem value="percentage">Percentage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <CardContent className="h-[calc(100%-40px)] p-0">
                    <AssigneeLoadChart tickets={filteredDashboardTickets || []} displayMode={assigneeChartMode} />
                  </CardContent>
                </Card>
              </div>
            </section>
          </div>
        )}
      </Card>
      <MyOpenTicketsModal
        isOpen={isMyOpenTicketsModalOpen}
        onClose={() => setIsMyOpenTicketsModalOpen(false)}
        tickets={allOpenTickets}
      />
      <InsightsSheet
        isOpen={isInsightsSheetOpen}
        onClose={() => setIsInsightsSheetOpen(false)}
        insights={dashboardInsights || []}
        uniqueCompanies={uniqueCompanies}
      />
    </div>
  );
};

export default Index;