"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  LayoutDashboard, Filter, CalendarDays, Users, User, Tag, Clock, Download, Loader2, BarChart3, TrendingUp, Scale, ShieldAlert, MessageSquare, Bug, RefreshCw,
  Gauge, // New: For performance metrics
  Zap, // New: For quick insights/predictions
  Lightbulb, // New: For AI/smart insights
  Activity, // New: For engagement
  GitFork, // New: For handoff analysis
  Sparkles, // New: For quality score
  ArrowUpRight, ArrowDownRight, TicketIcon, Hourglass, CheckCircle, AlertCircle // Added AlertCircle
} from "lucide-react"; // Updated imports for new icons
import { TooltipProvider } from "@/components/ui/tooltip";
import { useQuery, UseQueryOptions, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Ticket } from "@/types";
import { format, subDays, addDays, differenceInDays } from 'date-fns';
import { DateRange } from "react-day-picker";
import { toast } from 'sonner';
import HandWaveIcon from "@/components/HandWaveIcon";
import { MultiSelect } from "@/components/MultiSelect";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Import initial chart components (existing)
import TicketVolumeTrendChart from "@/components/TicketVolumeTrendChart";
import TopCustomersChart from "@/components/TopCustomersChart";
import AgentPerformanceChart from "@/components/AgentPerformanceChart";
// New chart components
import TicketTypeByCustomerChart from "@/components/TicketTypeByCustomerChart";
import CustomerEngagementTrendChart from "@/components/CustomerEngagementTrendChart";
import DashboardMetricCard from "@/components/DashboardMetricCard"; // Added missing import

const Analytics = () => {
  const { session } = useSupabase();
  const user = session?.user;
  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  const [dateRangeFilter, setDateRangeFilter] = useState<string | DateRange>("last30days");
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]); // Main filter for all charts
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [selectedTicketTypes, setSelectedTicketTypes] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [topNCustomers, setTopNCustomers] = useState<number | 'all'>(10);

  // New states for specific chart filters
  const [selectedCustomersForIssueType, setSelectedCustomersForIssueType] = useState<string[]>([]);
  const [topNCustomersForIssueType, setTopNCustomersForIssueType] = useState<number | 'all'>(5);
  const [selectedCustomersForEngagementTrend, setSelectedCustomersForEngagementTrend] = useState<string[]>([]);


  const queryClient = useQueryClient();

  // Fetch all tickets from Supabase
  const { data: allTickets, isLoading, error, isFetching } = useQuery<Ticket[], Error>({
    queryKey: ["allFreshdeskTickets"],
    queryFn: async () => {
      const { data, error } = await supabase.from('freshdesk_tickets').select('*').order('created_at', { ascending: false }).limit(10000);
      if (error) throw error;
      return data.map(ticket => ({ ...ticket, id: ticket.freshdesk_id })) as Ticket[];
    },
    onSuccess: () => {
      toast.success("Analytics data loaded from Supabase successfully!");
    },
    onError: (err) => {
      toast.error(`Failed to load analytics data from Supabase: ${err.message}`);
    },
  } as UseQueryOptions<Ticket[], Error>);

  const handleSyncTickets = async () => {
    toast.loading("Syncing latest tickets from Freshdesk...", { id: "sync-tickets-analytics" });
    try {
      const { data, error } = await supabase.functions.invoke('fetch-freshdesk-tickets', {
        method: 'POST',
        body: { action: 'syncTickets', user_id: user?.id },
      });

      if (error) {
        throw error;
      }

      toast.success("Tickets synced successfully!", { id: "sync-tickets-analytics" });
      queryClient.invalidateQueries({ queryKey: ["allFreshdeskTickets"] });
    } catch (err: any) {
      toast.error(`Failed to sync tickets: ${err.message}`, { id: "sync-tickets-analytics" });
    }
  };

  const { effectiveStartDate, effectiveEndDate, dateRangeDisplay } = useMemo(() => {
    let start: Date | undefined;
    let end: Date | undefined;
    let display: string = "";

    const now = new Date();

    if (typeof dateRangeFilter === 'string') {
      switch (dateRangeFilter) {
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
          start = subDays(now, 30);
          end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
          display = "Last 30 Days";
          break;
      }
    } else {
      start = dateRangeFilter.from ? new Date(dateRangeFilter.from) : undefined;
      end = dateRangeFilter.to ? new Date(dateRangeFilter.to) : undefined;

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
  }, [dateRangeFilter]);

  const filteredTickets = useMemo(() => {
    if (!allTickets || !effectiveStartDate || !effectiveEndDate) return [];

    let currentTickets: Ticket[] = allTickets.filter(ticket =>
      new Date(ticket.created_at) >= effectiveStartDate && new Date(ticket.created_at) <= effectiveEndDate
    );

    if (selectedCustomers.length > 0) {
      currentTickets = currentTickets.filter(ticket => ticket.cf_company && selectedCustomers.includes(ticket.cf_company));
    }
    if (selectedAgents.length > 0) {
      currentTickets = currentTickets.filter(ticket => ticket.assignee && selectedAgents.includes(ticket.assignee));
    }
    if (selectedTicketTypes.length > 0) {
      currentTickets = currentTickets.filter(ticket => ticket.type && selectedTicketTypes.includes(ticket.type));
    }
    if (selectedPriorities.length > 0) {
      currentTickets = currentTickets.filter(ticket => selectedPriorities.includes(ticket.priority));
    }

    return currentTickets;
  }, [allTickets, effectiveStartDate, effectiveEndDate, selectedCustomers, selectedAgents, selectedChannels, selectedTicketTypes, selectedPriorities]);

  const uniqueCompanies = useMemo(() => {
    const companies = new Set<string>();
    (allTickets || []).forEach(ticket => {
      if (ticket.cf_company) {
        companies.add(ticket.cf_company);
      }
    });
    return Array.from(companies).sort();
  }, [allTickets]);

  const uniqueAssignees = useMemo(() => {
    const assignees = new Set<string>();
    (allTickets || []).forEach(ticket => {
      if (ticket.assignee && ticket.assignee !== "Unassigned") {
        assignees.add(ticket.assignee);
      }
    });
    return Array.from(assignees).sort();
  }, [allTickets]);

  const uniqueTicketTypes = useMemo(() => {
    const types = new Set<string>();
    (allTickets || []).forEach(ticket => {
      if (ticket.type) {
        types.add(ticket.type);
      }
    });
    return Array.from(types).sort();
  }, [allTickets]);

  const uniquePriorities = useMemo(() => {
    const priorities = new Set<string>();
    (allTickets || []).forEach(ticket => {
      priorities.add(ticket.priority);
    });
    return Array.from(priorities).sort();
  }, [allTickets]);

  const uniqueChannels = useMemo(() => {
    return ["Email", "Chat", "Phone", "Web Form"]; // Placeholder channels
  }, []);

  // New KPI calculations
  const averageResolutionTime = useMemo(() => {
    const resolvedTickets = filteredTickets.filter(t => t.status.toLowerCase() === 'resolved' || t.status.toLowerCase() === 'closed');
    if (resolvedTickets.length === 0) return "N/A";
    const totalDays = resolvedTickets.reduce((sum, t) => {
      const created = new Date(t.created_at);
      const updated = new Date(t.updated_at);
      return sum + differenceInDays(updated, created);
    }, 0);
    return (totalDays / resolvedTickets.length).toFixed(1) + " days";
  }, [filteredTickets]);

  const slaAdherenceRate = useMemo(() => {
    const slaApplicableTickets = filteredTickets.filter(t => t.due_by);
    if (slaApplicableTickets.length === 0) return "N/A";
    const metSlaCount = slaApplicableTickets.filter(t => {
      const updated = new Date(t.updated_at);
      const due = new Date(t.due_by!);
      return updated <= due;
    }).length;
    return ((metSlaCount / slaApplicableTickets.length) * 100).toFixed(1) + "%";
  }, [filteredTickets]);

  // Effect to set initial selected customers for charts
  useEffect(() => {
    if (uniqueCompanies.length > 0) {
      if (selectedCustomersForIssueType.length === 0) {
        setSelectedCustomersForIssueType(uniqueCompanies.slice(0, 5)); // Default to top 5 for issue type
      }
      if (selectedCustomersForEngagementTrend.length === 0) {
        setSelectedCustomersForEngagementTrend(uniqueCompanies.slice(0, 3)); // Default to top 3 for engagement trend
      }
    }
  }, [uniqueCompanies, selectedCustomersForIssueType, selectedCustomersForEngagementTrend]);


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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg flex flex-col">
          {/* Title Bar */}
          <div className="p-8 pb-6 border-b border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="flex flex-col items-start">
                <p className="text-lg font-bold text-gray-700 dark:text-gray-300 flex items-center mb-2">
                  Hi {fullName} <HandWaveIcon className="ml-2 h-6 w-6 text-yellow-500" />
                </p>
                <div className="flex items-center space-x-4">
                  <BarChart3 className="h-8 w-8 text-primary" />
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Support Analytics</h1>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Insights for: <span className="font-semibold">{dateRangeDisplay}</span>
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  onClick={handleSyncTickets}
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

            {/* Top Filters */}
            <div className="flex flex-wrap gap-4 items-center mt-4 p-6 pt-4 bg-gray-50 dark:bg-gray-700 rounded-b-xl shadow-inner">
              {/* Time Range */}
              <Select
                value={typeof dateRangeFilter === 'string' ? dateRangeFilter : "custom"}
                onValueChange={(value) => {
                  if (value === "custom") {
                    setDateRangeFilter({ from: undefined, to: undefined });
                    setCustomDateRange(undefined);
                  } else {
                    setDateRangeFilter(value);
                    setCustomDateRange(undefined);
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
                    style={{ display: typeof dateRangeFilter !== 'string' || (typeof dateRangeFilter === 'string' && dateRangeFilter === 'custom') ? 'flex' : 'none' }}
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {customDateRange?.from && customDateRange?.to
                      ? `${format(customDateRange.from, "PPP")} - ${format(customDateRange.to, "PPP")}`
                      : <span>Pick a custom range</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={customDateRange?.from || new Date()}
                    selected={customDateRange}
                    onSelect={(range) => {
                        if (range?.from) {
                          setCustomDateRange({
                            from: range.from,
                            to: range.to || addDays(range.from, 0),
                          });
                          setDateRangeFilter(range);
                        } else {
                          setDateRangeFilter("last30days");
                          setCustomDateRange(undefined);
                        }
                      }}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>

                {/* Customer Filter */}
                <MultiSelect
                  options={uniqueCompanies.map(company => ({ value: company, label: company }))}
                  selected={selectedCustomers}
                  onSelectedChange={setSelectedCustomers}
                  placeholder="Filter by Customer"
                  className="w-[200px] bg-card"
                />

                {/* Agent Filter */}
                <MultiSelect
                  options={uniqueAssignees.map(agent => ({ value: agent, label: agent }))}
                  selected={selectedAgents}
                  onSelectedChange={setSelectedAgents}
                  placeholder="Filter by Agent"
                  className="w-[200px] bg-card"
                />

                {/* Channel Filter (Placeholder) */}
                <MultiSelect
                  options={uniqueChannels.map(channel => ({ value: channel, label: channel }))}
                  selected={selectedChannels}
                  onSelectedChange={setSelectedChannels}
                  placeholder="Filter by Channel"
                  className="w-[180px] bg-card"
                />

                {/* Ticket Type Filter */}
                <MultiSelect
                  options={uniqueTicketTypes.map(type => ({ value: type, label: type }))}
                  selected={selectedTicketTypes}
                  onSelectedChange={setSelectedTicketTypes}
                  placeholder="Filter by Type"
                  className="w-[180px] bg-card"
                />

                {/* Priority Filter */}
                <MultiSelect
                  options={uniquePriorities.map(priority => ({ value: priority, label: priority }))}
                  selected={selectedPriorities}
                  onSelectedChange={setSelectedPriorities}
                  placeholder="Filter by Priority"
                  className="w-[180px] bg-card"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center flex-grow p-8 text-gray-500 dark:text-gray-400">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-lg font-medium">Loading analytics data...</p>
              </div>
            ) : (
              <div className="p-8 space-y-10">
                {/* Section 1: Executive Summary & Core Metrics */}
                <section>
                  <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                    <LayoutDashboard className="h-6 w-6 text-blue-600" /> Executive Summary & Core Metrics
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                    <DashboardMetricCard
                      title="Total Tickets"
                      value={filteredTickets.length}
                      icon={TicketIcon}
                      trend={12} // Placeholder trend
                      description="The total number of support tickets created in the selected period."
                    />
                    <DashboardMetricCard
                      title="Open Tickets"
                      value={filteredTickets.filter(t => t.status.toLowerCase() === 'open (being processed)').length}
                      icon={Hourglass}
                      trend={-5} // Placeholder trend
                      description="Tickets currently open and being processed within the selected period."
                    />
                    <DashboardMetricCard
                      title="Resolved This Period"
                      value={filteredTickets.filter(t => t.status.toLowerCase() === 'resolved' || t.status.toLowerCase() === 'closed').length}
                      icon={CheckCircle}
                      trend={15} // Placeholder trend
                      description={`Tickets resolved or closed in the selected period (${dateRangeDisplay}).`}
                    />
                    <DashboardMetricCard
                      title="Bugs Received"
                      value={filteredTickets.filter(t => t.type?.toLowerCase() === 'bug').length}
                      icon={Bug}
                      trend={8} // Placeholder trend
                      description="Number of tickets categorized as 'Bug' in the selected period."
                    />
                    {/* New KPI Card: Average Resolution Time */}
                    <DashboardMetricCard
                      title="Avg. Resolution Time"
                      value={averageResolutionTime}
                      icon={Clock}
                      trend={-3} // Placeholder trend (negative is good for time)
                      description="Average time taken to resolve tickets in the selected period."
                    />
                    {/* New KPI Card: SLA Adherence Rate */}
                    <DashboardMetricCard
                      title="SLA Adherence Rate"
                      value={slaAdherenceRate}
                      icon={ShieldAlert}
                      trend={2} // Placeholder trend
                      description="Percentage of tickets that met their SLA in the selected period."
                    />
                  </div>
                  <Card className="h-96 mt-6">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-foreground">Ticket Volume Trend (Created vs Resolved)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[calc(100%-60px)]">
                      <TicketVolumeTrendChart tickets={filteredTickets} startDate={effectiveStartDate} endDate={effectiveEndDate} />
                    </CardContent>
                  </Card>
                </section>

                <Separator className="my-10" />

                {/* Section 2: Customer & Issue Deep Dive */}
                <section>
                  <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                    <Users className="h-6 w-6 text-green-600" /> Customer & Issue Deep Dive
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="h-96">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-foreground">Top Customers by Ticket Volume</CardTitle>
                        <Select value={String(topNCustomers)} onValueChange={(value) => setTopNCustomers(value === 'all' ? 'all' : Number(value))}>
                          <SelectTrigger className="w-[100px] h-8 bg-card">
                            <SelectValue placeholder="Top 10" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">Top 5</SelectItem>
                            <SelectItem value="10">Top 10</SelectItem>
                            <SelectItem value="20">Top 20</SelectItem>
                            <SelectItem value="all">All</SelectItem>
                          </SelectContent>
                        </Select>
                      </CardHeader>
                      <CardContent className="h-[calc(100%-60px)]">
                        <TopCustomersChart tickets={filteredTickets} topN={topNCustomers === 'all' ? undefined : topNCustomers} />
                      </CardContent>
                    </Card>
                    {/* New Chart: Issue Type Breakdown by Customer */}
                    <Card className="h-96">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-foreground">Issue Type Breakdown by Customer</CardTitle>
                        <div className="flex items-center gap-2">
                          <MultiSelect
                            options={uniqueCompanies.map(company => ({ value: company, label: company }))}
                            selected={selectedCustomersForIssueType}
                            onSelectedChange={setSelectedCustomersForIssueType}
                            placeholder="Select Customers"
                            className="w-[180px] bg-card"
                          />
                          <Select value={String(topNCustomersForIssueType)} onValueChange={(value) => setTopNCustomersForIssueType(value === 'all' ? 'all' : Number(value))}>
                            <SelectTrigger className="w-[100px] h-8 bg-card">
                              <SelectValue placeholder="Top 5" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="3">Top 3</SelectItem>
                              <SelectItem value="5">Top 5</SelectItem>
                              <SelectItem value="10">Top 10</SelectItem>
                              <SelectItem value="all">All</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardHeader>
                      <CardContent className="h-[calc(100%-60px)]">
                        {filteredTickets.length > 0 ? (
                          <TicketTypeByCustomerChart
                            tickets={filteredTickets.filter(t => selectedCustomersForIssueType.includes(t.cf_company || ''))}
                            topNCustomers={topNCustomersForIssueType}
                          />
                        ) : (
                          <p className="text-center text-muted-foreground py-10">No ticket type data available for selected customers.</p>
                        )}
                      </CardContent>
                    </Card>
                    {/* New Chart: Customer Engagement Trend */}
                    <Card className="h-96">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-foreground">Customer Engagement Trend</CardTitle>
                        <MultiSelect
                          options={uniqueCompanies.map(company => ({ value: company, label: company }))}
                          selected={selectedCustomersForEngagementTrend}
                          onSelectedChange={setSelectedCustomersForEngagementTrend}
                          placeholder="Select Customers"
                          className="w-[180px] bg-card"
                        />
                      </CardHeader>
                      <CardContent className="h-[calc(100%-60px)]">
                        {filteredTickets.length > 0 && selectedCustomersForEngagementTrend.length > 0 ? (
                          <CustomerEngagementTrendChart
                            tickets={filteredTickets}
                            startDate={effectiveStartDate}
                            endDate={effectiveEndDate}
                            selectedCustomers={selectedCustomersForEngagementTrend}
                          />
                        ) : (
                          <p className="text-center text-muted-foreground py-10">Select customers to view their engagement trend.</p>
                        )}
                      </CardContent>
                    </Card>
                    {/* New Feature (Conceptual): Dynamic Issue Clustering */}
                    <Card className="h-96">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                          <Lightbulb className="h-5 w-5 text-yellow-500" /> Emerging Issue Detection (AI-driven)
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex items-center justify-center h-[calc(100%-60px)] text-muted-foreground text-center">
                        <p>This section would conceptually use AI to analyze ticket subjects and descriptions, identifying new, trending problem clusters before they are formally categorized. It helps uncover "unknown unknowns" in your support landscape.</p>
                      </CardContent>
                    </Card>
                  </div>
                </section>

                <Separator className="my-10" />

                {/* Section 3: Agent Performance & Workload Optimization */}
                <section>
                  <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                    <User className="h-6 w-6 text-purple-600" /> Agent Performance & Workload Optimization
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="h-96">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-foreground">Agent Load vs Resolution Efficiency</CardTitle>
                      </CardHeader>
                      <CardContent className="h-[calc(100%-60px)]">
                        <AgentPerformanceChart tickets={filteredTickets} />
                      </CardContent>
                    </Card>
                    {/* New Chart: Agent Workload Distribution */}
                    <Card className="h-96">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-foreground">Agent Workload Distribution</CardTitle>
                      </CardHeader>
                      <CardContent className="flex items-center justify-center h-[calc(100%-60px)] text-muted-foreground">
                        {/* This would be a new component, e.g., <AgentWorkloadDistributionChart tickets={filteredTickets} /> */}
                        <p>A bar chart showing the current number of open tickets per agent, potentially segmented by priority, to visualize workload balance and identify overloaded agents.</p>
                      </CardContent>
                    </Card>
                    {/* New Feature (Conceptual): Agent Skill Gap Analysis */}
                    <Card className="h-96">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                          <Gauge className="h-5 w-5 text-indigo-500" /> Agent Skill Gap Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex items-center justify-center h-[calc(100%-60px)] text-muted-foreground text-center">
                        <p>This section would conceptually identify areas where agents might need training. For example, by correlating longer resolution times for specific ticket types or modules with individual agents, it can pinpoint skill development opportunities.</p>
                      </CardContent>
                    </Card>
                  </div>
                </section>

                <Separator className="my-10" />

                {/* Section 4: Proactive & Predictive Insights */}
                <section>
                  <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                    <Zap className="h-6 w-6 text-orange-600" /> Proactive & Predictive Insights
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* New Feature: SLA Breach Prediction Dashboard */}
                    <Card className="h-96">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                          <AlertCircle className="h-5 w-5 text-red-500" /> SLA Breach Prediction
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex items-center justify-center h-[calc(100%-60px)] text-muted-foreground text-center">
                        {/* This would be a new component, e.g., <SLABreachPredictionTable tickets={filteredTickets} /> */}
                        <p>A dynamic table or chart highlighting active tickets that are at high risk of breaching their SLA within the next 24-48 hours, based on current status, age, and historical resolution patterns. This enables proactive intervention.</p>
                      </CardContent>
                    </Card>
                    {/* New Feature (Conceptual): Backlog Growth Forecast */}
                    <Card className="h-96">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-blue-500" /> Backlog Growth Forecast
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex items-center justify-center h-[calc(100%-60px)] text-muted-foreground text-center">
                        <p>A line chart projecting the expected number of open tickets in the coming days/weeks, based on historical ticket creation and resolution rates, to help anticipate future resource needs.</p>
                      </CardContent>
                    </Card>
                    {/* New Feature (Conceptual): Proactive Customer Outreach Opportunities */}
                    <Card className="h-96">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                          <MessageSquare className="h-5 w-5 text-green-500" /> Proactive Customer Outreach Opportunities
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex items-center justify-center h-[calc(100%-60px)] text-muted-foreground text-center">
                        <p>This section would identify customers with unusual ticket activity patterns (e.g., a sudden drop in tickets indicating disengagement, or a spike indicating a systemic issue), suggesting opportunities for proactive customer success outreach.</p>
                      </CardContent>
                    </Card>
                  </div>
                </section>

                <Separator className="my-10" />

                {/* Section 5: Operational Efficiency & Quality */}
                <section>
                  <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                    <Scale className="h-6 w-6 mr-3 text-indigo-600" /> Operational Efficiency & Quality
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* New Chart: First Response Time Distribution */}
                    <Card className="h-96">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                          <Clock className="h-5 w-5 text-purple-500" /> First Response Time Distribution
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex items-center justify-center h-[calc(100%-60px)] text-muted-foreground text-center">
                        {/* This would be a new component, e.g., <FirstResponseTimeDistributionChart tickets={filteredTickets} /> */}
                        <p>A histogram showing the distribution of first response times (using `fr_due_by` as a proxy for the target, or actual response times if conversation data is available), to identify areas for improvement.</p>
                      </CardContent>
                    </Card>
                    {/* New Feature (Conceptual): Ticket Handoff Analysis */}
                    <Card className="h-96">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                          <GitFork className="h-5 w-5 text-orange-500" /> Ticket Handoff Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex items-center justify-center h-[calc(100%-60px)] text-muted-foreground text-center">
                        <p>This section would conceptually visualize how many times tickets change assignees before resolution, and identify common handoff patterns or problematic transfers that lead to delays or escalations.</p>
                      </CardContent>
                    </Card>
                    {/* New Feature (Conceptual): Ticket Quality Score */}
                    <Card className="h-96">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-yellow-500" /> Ticket Quality Score
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex items-center justify-center h-[calc(100%-60px)] text-muted-foreground text-center">
                        <p>A conceptual metric that scores each ticket based on the completeness and clarity of its initial data (e.g., presence of detailed description, categorization). This helps ensure agents capture sufficient information for efficient resolution.</p>
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

export default Analytics;