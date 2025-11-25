"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { LayoutDashboard, Filter, CalendarDays, Users, User, Tag, Clock, Download, Loader2, BarChart3, TrendingUp, Scale, ShieldAlert, MessageSquare, Bug, RefreshCw } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useQuery, UseQueryOptions, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Ticket } from "@/types";
import { format, subDays, addDays } from 'date-fns';
import { DateRange } from "react-day-picker";
import { toast } from 'sonner';
import HandWaveIcon from "@/components/HandWaveIcon";
import { MultiSelect } from "@/components/MultiSelect";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Import initial chart components
import TicketVolumeTrendChart from "@/components/TicketVolumeTrendChart";
import TopCustomersChart from "@/components/TopCustomersChart";
import AgentPerformanceChart from "@/components/AgentPerformanceChart";

const Analytics = () => {
  const { session } = useSupabase();
  const user = session?.user;
  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  const [dateRangeFilter, setDateRangeFilter] = useState<string | DateRange>("last30days");
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [selectedTicketTypes, setSelectedTicketTypes] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [topNCustomers, setTopNCustomers] = useState<number | 'all'>(10);

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
        body: { action: 'syncTickets', user_id: user?.id }, // Pass user.id here
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
    return ["Email", "Chat", "Phone", "Web Form"];
  }, []);


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
      <div className="flex-1 flex flex-col p-6 overflow-y-auto"> {/* Removed h-screen and flex-row, adjusted padding */}
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
            <div className="flex flex-wrap gap-4 items-center mt-4">
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
                <SelectTrigger className="w-[180px]">
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
                    className="w-[200px] justify-start text-left font-normal"
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
                  className="w-[200px]"
                />

                {/* Agent Filter */}
                <MultiSelect
                  options={uniqueAssignees.map(agent => ({ value: agent, label: agent }))}
                  selected={selectedAgents}
                  onSelectedChange={setSelectedAgents}
                  placeholder="Filter by Agent"
                  className="w-[200px]"
                />

                {/* Channel Filter (Placeholder) */}
                <MultiSelect
                  options={uniqueChannels.map(channel => ({ value: channel, label: channel }))}
                  selected={selectedChannels}
                  onSelectedChange={setSelectedChannels}
                  placeholder="Filter by Channel"
                  className="w-[180px]"
                />

                {/* Ticket Type Filter */}
                <MultiSelect
                  options={uniqueTicketTypes.map(type => ({ value: type, label: type }))}
                  selected={selectedTicketTypes}
                  onSelectedChange={setSelectedTicketTypes}
                  placeholder="Filter by Type"
                  className="w-[180px]"
                />

                {/* Priority Filter */}
                <MultiSelect
                  options={uniquePriorities.map(priority => ({ value: priority, label: priority }))}
                  selected={selectedPriorities}
                  onSelectedChange={setSelectedPriorities}
                  placeholder="Filter by Priority"
                  className="w-[180px]"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center flex-grow p-8 text-gray-500 dark:text-gray-400">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-lg font-medium">Loading analytics data...</p>
              </div>
            ) : (
              <div className="p-8 space-y-8">
                {/* Section 1: Ticket Trends & Behavior Analytics */}
                <section>
                  <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                    <TrendingUp className="h-6 w-6 mr-3 text-blue-600" /> Ticket Trends & Behavior
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="h-96">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-foreground">Ticket Volume Trend (Created vs Resolved)</CardTitle>
                      </CardHeader>
                      <CardContent className="h-[calc(100%-60px)]">
                        <TicketVolumeTrendChart tickets={filteredTickets} startDate={effectiveStartDate} endDate={effectiveEndDate} />
                      </CardContent>
                    </Card>
                    <Card className="h-96">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-foreground">Ticket Lifecycle Flow</CardTitle>
                      </CardHeader>
                      <CardContent className="flex items-center justify-center h-[calc(100%-60px)] text-muted-foreground">
                        <p>Placeholder for Ticket Lifecycle Flow chart.</p>
                      </CardContent>
                    </Card>
                    <Card className="h-96">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-foreground">Seasonality & Peak Hours</CardTitle>
                      </CardHeader>
                      <CardContent className="flex items-center justify-center h-[calc(100%-60px)] text-muted-foreground">
                        <p>Placeholder for Seasonality & Peak Hours heatmap.</p>
                      </CardContent>
                    </Card>
                  </div>
                </section>

                {/* Section 2: Customer Analytics */}
                <section>
                  <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                    <Users className="h-6 w-6 mr-3 text-green-600" /> Customer Analytics
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="h-96">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-foreground">Top Customers by Ticket Volume</CardTitle>
                        <Select value={String(topNCustomers)} onValueChange={(value) => setTopNCustomers(value === 'all' ? 'all' : Number(value))}>
                          <SelectTrigger className="w-[100px] h-8">
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
                    <Card className="h-96">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-foreground">Issue Type Breakdown by Customer</CardTitle>
                      </CardHeader>
                      <CardContent className="flex items-center justify-center h-[calc(100%-60px)] text-muted-foreground">
                        <p>Placeholder for Issue Type Breakdown by Customer chart.</p>
                      </CardContent>
                    </Card>
                    <Card className="h-96">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-foreground">Customer Ticket Trend Over Time</CardTitle>
                      </CardHeader>
                      <CardContent className="flex items-center justify-center h-[calc(100%-60px)] text-muted-foreground">
                        <p>Placeholder for Customer Ticket Trend Over Time chart.</p>
                      </CardContent>
                    </Card>
                  </div>
                </section>

                {/* Section 3: Agent & Team Performance Analytics */}
                <section>
                  <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                    <User className="h-6 w-6 mr-3 text-purple-600" /> Agent & Team Performance
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
                    <Card className="h-96">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-foreground">First Response & Resolution Times</CardTitle>
                      </CardHeader>
                      <CardContent className="flex items-center justify-center h-[calc(100%-60px)] text-muted-foreground">
                        <p>Placeholder for First Response & Resolution Times charts.</p>
                      </CardContent>
                    </Card>
                    <Card className="h-96">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-foreground">Reopen & Escalation Rates</CardTitle>
                      </CardHeader>
                      <CardContent className="flex items-center justify-center h-[calc(100%-60px)] text-muted-foreground">
                        <p>Placeholder for Reopen & Escalation Rates chart.</p>
                      </CardContent>
                    </Card>
                  </div>
                </section>

                {/* Section 4: Ticket Quality & Issue Insights */}
                <section>
                  <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                    <Bug className="h-6 w-6 mr-3 text-red-600" /> Ticket Quality & Issue Insights
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="h-96">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-foreground">Frequent Tags / Keyword Analysis</CardTitle>
                      </CardHeader>
                      <CardContent className="flex items-center justify-center h-[calc(100%-60px)] text-muted-foreground">
                        <p>Placeholder for Frequent Tags / Keyword Analysis.</p>
                      </CardContent>
                    </Card>
                    <Card className="h-96">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-foreground">Bug Analysis</CardTitle>
                      </CardHeader>
                      <CardContent className="flex items-center justify-center h-[calc(100%-60px)] text-muted-foreground">
                        <p>Placeholder for Bug Analysis charts.</p>
                      </CardContent>
                    </Card>
                    <Card className="h-96">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-foreground">Duplicate & Not Relevant Tickets</CardTitle>
                      </CardHeader>
                      <CardContent className="flex items-center justify-center h-[calc(100%-60px)] text-muted-foreground">
                        <p>Placeholder for Duplicate & Not Relevant Tickets trend.</p>
                      </CardContent>
                    </Card>
                  </div>
                </section>

                {/* Section 5: Efficiency & Forecasting Analytics */}
                <section>
                  <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                    <Scale className="h-6 w-6 mr-3 text-orange-600" /> Efficiency & Forecasting
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="h-96">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-foreground">Backlog Growth Forecast</CardTitle>
                      </CardHeader>
                      <CardContent className="flex items-center justify-center h-[calc(100%-60px)] text-muted-foreground">
                        <p>Placeholder for Backlog Growth Forecast.</p>
                      </CardContent>
                    </Card>
                    <Card className="h-96">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-foreground">SLA Breach Forecasting</CardTitle>
                      </CardHeader>
                      <CardContent className="flex items-center justify-center h-[calc(100%-60px)] text-muted-foreground">
                        <p>Placeholder for SLA Breach Forecasting.</p>
                      </CardContent>
                    </Card>
                    <Card className="h-96">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-foreground">Channel Effectiveness</CardTitle>
                      </CardHeader>
                      <CardContent className="flex items-center justify-center h-[calc(100%-60px)] text-muted-foreground">
                        <p>Placeholder for Channel Effectiveness comparison.</p>
                      </CardContent>
                    </Card>
                  </div>
                </section>

                {/* Section 6: Strategic Summary Analytics */}
                <section>
                  <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                    <LayoutDashboard className="h-6 w-6 mr-3 text-indigo-600" /> Strategic Summary
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="h-64">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-foreground">Month-over-Month Comparison</CardTitle>
                      </CardHeader>
                      <CardContent className="flex items-center justify-center h-[calc(100%-60px)] text-muted-foreground">
                        <p>Placeholder for Month-over-Month comparison.</p>
                      </CardContent>
                    </Card>
                    <Card className="h-64">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-foreground">Top 5 Problem Categories</CardTitle>
                      </CardHeader>
                      <CardContent className="flex items-center justify-center h-[calc(100%-60px)] text-muted-foreground">
                        <p>Placeholder for Top 5 Problem Categories.</p>
                      </CardContent>
                    </Card>
                    <Card className="h-64">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-foreground">Customer Health Score</CardTitle>
                      </CardHeader>
                      <CardContent className="flex items-center justify-center h-[calc(100%-60px)] text-muted-foreground">
                        <p>Placeholder for Customer Health Score.</p>
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