"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import HandWaveIcon from "@/components/HandWaveIcon";
import DashboardMetricCardV2 from "@/components/DashboardMetricCardV2"; // Updated import
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Search, LayoutDashboard, TicketIcon, Hourglass, CalendarDays, CheckCircle, AlertCircle, ShieldAlert, Download, Filter, Bookmark, ChevronDown, Bug, Clock, User, Percent, Users, Loader2, Table2, LayoutGrid, Info, Lightbulb, RefreshCw, BarChart2, Flag, MapPin, GitFork, SlidersHorizontal, ChevronUp, TrendingUp, Gauge, Building2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useQuery, UseQueryOptions, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Ticket, CustomerBreakdownRow, Insight } from "@/types";
import { isWithinInterval, subDays, format, addDays, differenceInDays, parseISO, isPast, differenceInHours } from 'date-fns';
import { DateRange } from "react-day-picker";
import { exportToCsv } from '@/utils/export';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import VolumeSlaTrendChart from "@/components/VolumeSlaTrendChart";
import TicketBreakdownChart from "@/components/TicketBreakdownChart";
import AgingBucketsChart from "@/components/AgingBucketsChart";
import TopRiskTicketsTable from "@/components/TopRiskTicketsTable";
import CompanyHealthTable from "@/components/CompanyHealthTable";
import TeamLoadTable from "@/components/TeamLoadTable";
import FilteredTicketsModal from "@/components/FilteredTicketsModal";
import { MultiSelect } from "@/components/MultiSelect";
import MyOpenTicketsModal from "@/components/MyOpenTicketsModal";
import InsightsSheet from "@/components/InsightsSheet";
import PriorityDistributionChart from "@/components/PriorityDistributionChart";
import AssigneeLoadChart from "@/components/AssigneeLoadChart";
import TicketDetailModal from "@/components/TicketDetailModal";
import DashboardInsightsOverlay from "@/components/DashboardInsightsOverlay";
import { invokeEdgeFunction } from "@/lib/apiClient";
import { ApiError } from "@/lib/errorHandler";
import OperationalTicker from "@/components/OperationalTicker";
import DashboardCriticalSignals from "@/components/DashboardCriticalSignals"; // New import

const fetchDashboardInsights = async (): Promise<Insight[]> => {
  try {
    const insights = await invokeEdgeFunction<Insight[]>(
      'generate-dashboard-insights',
      { method: 'POST' }
    );
    return insights;
  } catch (err: any) {
    if (err instanceof ApiError) {
      return [{
        id: 'insight-fetch-error',
        type: 'info',
        message: `Failed to load insights (Status ${err.status}): ${err.message}.`,
        severity: 'warning',
        icon: 'Info',
      }];
    }
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
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const [isFilteredTicketsModalOpen, setIsFilteredTicketsModalOpen] = useState(false);
  const [filteredModalTitle, setFilteredModalTitle] = useState("");
  const [filteredModalDescription, setFilteredModalDescription] = useState("");
  const [filteredModalTickets, setFilteredModalTickets] = useState<Ticket[]>([]);
  const [selectedTicketForDetail, setSelectedTicketForDetail] = useState<Ticket | null>(null);
  const [isTicketDetailModalOpen, setIsTicketDetailModalOpen] = useState(false);

  const [isMyOpenTicketsModalOpen, setIsMyOpenTicketsModalOpen] = useState(false);
  const [isInsightsSheetOpen, setIsInsightsSheetOpen] = useState(false);
  const [isDashboardInsightsOverlayOpen, setIsDashboardInsightsOverlayOpen] = useState(false);

  const queryClient = useQueryClient();

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

  const { data: dashboardInsights = [] } = useQuery<Insight[], Error>({
    queryKey: ["dashboardInsights"],
    queryFn: fetchDashboardInsights,
    enabled: !!authToken,
    refetchInterval: 60000, // Refetch every 60 seconds
  } as UseQueryOptions<Insight[], Error>);

  const uniqueCompanies = useMemo(() => {
    const companies = new Set<string>();
    (freshdeskTickets || []).forEach(ticket => {
      if (ticket.cf_company) {
        companies.add(ticket.cf_company);
      }
    });
    return Array.from(companies).sort();
  }, [freshdeskTickets]);

  const uniqueCountries = useMemo(() => {
    const countries = new Set<string>();
    (freshdeskTickets || []).forEach(ticket => {
      if (ticket.cf_country) {
        countries.add(ticket.cf_country);
      }
    });
    return Array.from(countries).sort();
  }, [freshdeskTickets]);

  const uniqueModules = useMemo(() => {
    const modules = new Set<string>();
    (freshdeskTickets || []).forEach(ticket => {
      if (ticket.cf_module) {
        modules.add(ticket.cf_module);
      }
    });
    return Array.from(modules).sort();
  }, [freshdeskTickets]);

  const uniquePriorities = useMemo(() => {
    const priorities = new Set<string>();
    (freshdeskTickets || []).forEach(ticket => {
      priorities.add(ticket.priority);
    });
    return Array.from(priorities).sort();
  }, [freshdeskTickets]);

  const uniqueStatuses = useMemo(() => {
    const statuses = new Set<string>();
    (freshdeskTickets || []).forEach(ticket => {
      statuses.add(ticket.status);
    });
    return Array.from(statuses).sort();
  }, [freshdeskTickets]);

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
      ticket && isWithinInterval(new Date(ticket.created_at), { start: effectiveStartDate, end: effectiveEndDate })
    );

    if (selectedCompanies.length > 0) {
      currentTickets = currentTickets.filter(ticket => ticket && ticket.cf_company && selectedCompanies.includes(ticket.cf_company));
    }
    if (selectedCountries.length > 0) {
      currentTickets = currentTickets.filter(ticket => ticket && ticket.cf_country && selectedCountries.includes(ticket.cf_country));
    }
    if (selectedModules.length > 0) {
      currentTickets = currentTickets.filter(ticket => ticket && ticket.cf_module && selectedModules.includes(ticket.cf_module));
    }
    if (selectedPriorities.length > 0) {
      currentTickets = currentTickets.filter(ticket => ticket && selectedPriorities.includes(ticket.priority));
    }
    if (selectedStatuses.length > 0) {
      currentTickets = currentTickets.filter(ticket => ticket && selectedStatuses.includes(ticket.status));
    }

    if (searchTerm) {
      currentTickets = currentTickets.filter(ticket =>
        ticket && (
          ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.requester_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (ticket.assignee && ticket.assignee.toLowerCase().includes(searchTerm.toLowerCase())) ||
          ticket.id.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    return currentTickets;
  }, [freshdeskTickets, effectiveStartDate, effectiveEndDate, selectedCompanies, selectedCountries, selectedModules, selectedPriorities, selectedStatuses, searchTerm]);

  const previousPeriodTickets: Ticket[] = useMemo(() => {
    if (!freshdeskTickets || !previousEffectiveStartDate || !previousEffectiveEndDate) return [];

    let currentTickets: Ticket[] = freshdeskTickets;

    currentTickets = currentTickets.filter(ticket =>
      ticket && isWithinInterval(new Date(ticket.created_at), { start: previousEffectiveStartDate, end: previousEffectiveEndDate })
    );

    if (selectedCompanies.length > 0) {
      currentTickets = currentTickets.filter(ticket => ticket && ticket.cf_company && selectedCompanies.includes(ticket.cf_company));
    }
    if (selectedCountries.length > 0) {
      currentTickets = currentTickets.filter(ticket => ticket && ticket.cf_country && selectedCountries.includes(ticket.cf_country));
    }
    if (selectedModules.length > 0) {
      currentTickets = currentTickets.filter(ticket => ticket && ticket.cf_module && selectedModules.includes(ticket.cf_module));
    }
    if (selectedPriorities.length > 0) {
      currentTickets = currentTickets.filter(ticket => ticket && selectedPriorities.includes(ticket.priority));
    }
    if (selectedStatuses.length > 0) {
      currentTickets = currentTickets.filter(ticket => ticket && selectedStatuses.includes(ticket.status));
    }

    if (searchTerm) {
      currentTickets = currentTickets.filter(ticket =>
        ticket && (
          ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.requester_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (ticket.assignee && ticket.assignee.toLowerCase().includes(searchTerm.toLowerCase())) ||
          ticket.id.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    return currentTickets;
  }, [freshdeskTickets, previousEffectiveStartDate, previousEffectiveEndDate, selectedCompanies, selectedCountries, selectedModules, selectedPriorities, selectedStatuses, searchTerm]);


  const allOpenTickets = useMemo(() => {
    if (!freshdeskTickets) return [];
    return freshdeskTickets.filter(t =>
      t && t.status && (t.status.toLowerCase() === 'open (being processed)' ||
       t.status.toLowerCase() === 'pending (awaiting your reply)' ||
       t.status.toLowerCase() === 'waiting on customer' ||
       t.status.toLowerCase() === 'on tech' ||
       t.status.toLowerCase() === 'on product' ||
       t.status.toLowerCase() === 'escalated')
    );
  }, [freshdeskTickets]);

  const calculateTrend = (currentCount: number, previousCount: number): number | undefined => {
    if (previousCount === 0) {
      if (currentCount > 0) return 100; // Infinite increase, cap at 100% for display
      return undefined;
    }
    const trend = ((currentCount - previousCount) / previousCount) * 100;
    return parseFloat(trend.toFixed(1));
  };

  const metrics = useMemo(() => {
    if (!freshdeskTickets) {
      return {
        totalTickets: 0,
        openTickets: 0,
        resolvedTickets: 0,
        overdueTickets: 0,
        firstResponseSlaMet: "N/A",
        resolutionSlaMet: "N/A",
        medianResolutionTime: "N/A",
        urgentTicketsAtRisk: 0,
        // Trends
        totalTicketsTrend: undefined,
        openTicketsTrend: undefined,
        resolvedTicketsTrend: undefined,
        // New Overall Metrics
        totalTicketsOverall: 0,
        totalOpenOverall: 0,
        totalBugsOverall: 0,
      };
    }

    const now = new Date();

    // Current Period Counts (Filtered by Date/Filters)
    const totalTickets = filteredDashboardTickets.length;
    const openTickets = filteredDashboardTickets.filter(t =>
      t && t.status && (t.status.toLowerCase() === 'open (being processed)' ||
      t.status.toLowerCase() === 'pending (awaiting your reply)' ||
      t.status.toLowerCase() === 'waiting on customer' ||
      t.status.toLowerCase() === 'on tech' ||
      t.status.toLowerCase() === 'on product' ||
      t.status.toLowerCase() === 'escalated')
    ).length;
    const resolvedTickets = filteredDashboardTickets.filter(t =>
      t && t.status && (t.status.toLowerCase() === 'resolved' || t.status.toLowerCase() === 'closed')
    ).length;

    // Overall Counts (Unfiltered by Date/Filters)
    const totalTicketsOverall = freshdeskTickets.length;
    const totalOpenOverall = freshdeskTickets.filter(t =>
      t && t.status && (t.status.toLowerCase() !== 'resolved' && t.status.toLowerCase() !== 'closed')
    ).length;
    const totalBugsOverall = freshdeskTickets.filter(t => t && t.type?.toLowerCase() === 'bug').length;


    // Previous Period Counts (for trend calculation)
    const prevTotalTickets = previousPeriodTickets.length;
    const prevOpenTickets = previousPeriodTickets.filter(t =>
      t && t.status && (t.status.toLowerCase() !== 'resolved' && t.status.toLowerCase() !== 'closed')
    ).length;
    const prevResolvedTickets = previousPeriodTickets.filter(t =>
      t && t.status && (t.status.toLowerCase() === 'resolved' || t.status.toLowerCase() === 'closed')
    ).length;

    // Trends
    const totalTicketsTrend = calculateTrend(totalTickets, prevTotalTickets);
    const openTicketsTrend = calculateTrend(openTickets, prevOpenTickets);
    const resolvedTicketsTrend = calculateTrend(resolvedTickets, prevResolvedTickets);


    const overdueTickets = filteredDashboardTickets.filter(t =>
      t && t.status && (t.status.toLowerCase() !== 'resolved' && t.status.toLowerCase() !== 'closed') &&
      t.due_by && isPast(parseISO(t.due_by))
    ).length;

    // First Response SLA Met (%) - Using updated_at as proxy for first_response_at
    let frSlaMetCount = 0;
    let frSlaTotalCount = 0;
    filteredDashboardTickets.forEach(ticket => {
      if (ticket && ticket.fr_due_by) {
        frSlaTotalCount++;
        // Assuming updated_at is a proxy for first_response_at if actual field is missing
        if (parseISO(ticket.updated_at) <= parseISO(ticket.fr_due_by)) {
          frSlaMetCount++;
        }
      }
    });
    const firstResponseSlaMet = frSlaTotalCount > 0 ? ((frSlaMetCount / frSlaTotalCount) * 100).toFixed(1) + "%" : "N/A";

    // Resolution SLA Met (%) - Using updated_at as proxy for resolved_at
    let resSlaMetCount = 0;
    let resSlaTotalCount = 0;
    filteredDashboardTickets.forEach(ticket => {
      if (ticket && ticket.due_by && (ticket.status.toLowerCase() === 'resolved' || ticket.status.toLowerCase() === 'closed')) {
        resSlaTotalCount++;
        // Assuming updated_at is a proxy for resolved_at if actual field is missing
        if (parseISO(ticket.updated_at) <= parseISO(ticket.due_by)) {
          resSlaMetCount++;
        }
      }
    });
    const resolutionSlaMet = resSlaTotalCount > 0 ? ((resSlaMetCount / resSlaTotalCount) * 100).toFixed(1) + "%" : "N/A";

    // Median Resolution Time
    const resolvedTicketsForMedian = filteredDashboardTickets.filter(t => t && t.status && (t.status.toLowerCase() === 'resolved' || t.status.toLowerCase() === 'closed'));
    let medianResolutionTime: string = "N/A";
    if (resolvedTicketsForMedian.length > 0) {
      const resolutionTimesHours = resolvedTicketsForMedian.map(t =>
        differenceInHours(parseISO(t.updated_at), parseISO(t.created_at))
      ).sort((a, b) => a - b);

      const mid = Math.floor(resolutionTimesHours.length / 2);
      const medianHours = resolutionTimesHours.length % 2 === 0
        ? (resolutionTimesHours[mid - 1] + resolutionTimesHours[mid]) / 2
        : resolutionTimesHours[mid];
      medianResolutionTime = `${medianHours.toFixed(1)} hrs`;
    }

    // Urgent Tickets at Risk
    const urgentTicketsAtRisk = filteredDashboardTickets.filter(t => {
      if (!t || !t.status || !t.priority) return false;
      const statusLower = t.status.toLowerCase();
      const isActive = statusLower !== 'resolved' && statusLower !== 'closed';
      const isUrgent = t.priority.toLowerCase() === 'urgent';
      const isNearDue = t.due_by && differenceInHours(parseISO(t.due_by), now) <= 2; // 2-hour threshold

      return isActive && isUrgent && isNearDue;
    }).length;

    return {
      totalTickets,
      openTickets,
      resolvedTickets,
      overdueTickets,
      firstResponseSlaMet,
      resolutionSlaMet,
      medianResolutionTime,
      urgentTicketsAtRisk,
      totalTicketsTrend,
      openTicketsTrend,
      resolvedTicketsTrend,
      totalTicketsOverall,
      totalOpenOverall,
      totalBugsOverall,
    };
  }, [filteredDashboardTickets, freshdeskTickets, previousPeriodTickets]);

  const handleSyncTickets = async () => {
    toast.loading("Syncing latest tickets from Freshdesk...", { id: "sync-tickets-dashboard" });
    try {
      // Use apiClient for Edge Function invocation
      await invokeEdgeFunction(
        'fetch-freshdesk-tickets',
        {
          method: 'POST',
          body: { action: 'syncTickets', user_id: user?.id },
        }
      );

      toast.success("Tickets synced successfully!", { id: "sync-tickets-dashboard" });
      queryClient.invalidateQueries({ queryKey: ["freshdeskTickets"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardInsights"] });
    } catch (err: any) {
      let errorMessage = err.message;
      if (err instanceof ApiError) {
        errorMessage = `Sync failed (Status ${err.status}): ${err.message}`;
      }
      toast.error(errorMessage, { id: "sync-tickets-dashboard" });
    }
  };

  const handleExportFilteredTickets = () => {
    exportToCsv(filteredDashboardTickets, `tickets_dashboard_filtered_${format(new Date(), 'yyyyMMdd_HHmmss')}`);
  };

  const handleExportAggregatedReport = () => {
    exportToCsv(filteredDashboardTickets, `tickets_dashboard_aggregated_report_${format(new Date(), 'yyyyMMdd_HHmmss')}`);
  };

  const handleKPIDrilldown = (title: string, description: string, tickets: Ticket[]) => {
    setFilteredModalTitle(title);
    setFilteredModalDescription(description);
    setFilteredModalTickets(tickets);
    setIsFilteredTicketsModalOpen(true);
  };

  const handleViewTicketDetails = (ticket: Ticket) => {
    setSelectedTicketForDetail(ticket);
    setIsTicketDetailModalOpen(true);
  };

  const handleCloseTicketDetailModal = () => {
    setIsTicketDetailModalOpen(false);
    setSelectedTicketForDetail(null);
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-red-500">Error loading tickets: {error.message}</p>
        <p className="text-red-500">Please ensure FRESHDESK_API_KEY and FRESHDESK_DOMAIN are set as Supabase secrets.</p>
      </div>
    );
  }

  const overdueTicketsList = filteredDashboardTickets.filter(t =>
    t && t.status && (t.status.toLowerCase() !== 'resolved' && t.status.toLowerCase() !== 'closed') &&
    t.due_by && isPast(parseISO(t.due_by))
  );

  const urgentTicketsAtRiskList = filteredDashboardTickets.filter(t => {
    if (!t || !t.status || !t.priority) return false;
    const statusLower = t.status.toLowerCase();
    const isActive = statusLower !== 'resolved' && statusLower !== 'closed';
    const isUrgent = t.priority.toLowerCase() === 'urgent';
    const isNearDue = t.due_by && differenceInHours(parseISO(t.due_by), new Date()) <= 2;
    return isActive && isUrgent && isNearDue;
  });

  // --- Filter Definitions ---
  const defaultFilters = useMemo(() => [
    {
      key: 'date-range',
      component: (
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
            <SelectItem value="last30days">Last 30 Days</SelectItem>
            <SelectItem value="last90days">Last 90 Days</SelectItem>
            <SelectItem value="alltime">All Time</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>
      )
    },
    {
      key: 'company',
      component: (
        <MultiSelect
          options={uniqueCompanies.map(company => ({ value: company, label: company }))}
          selected={selectedCompanies}
          onSelectedChange={setSelectedCompanies}
          placeholder="Filter by Company"
          icon={Building2}
          className="w-[200px] bg-card"
        />
      )
    },
    {
      key: 'status',
      component: (
        <MultiSelect
          options={uniqueStatuses.map(status => ({ value: status, label: status }))}
          selected={selectedStatuses}
          onSelectedChange={setSelectedStatuses}
          placeholder="Filter by Status"
          icon={Flag}
          className="w-[200px] bg-card"
        />
      )
    },
  ], [activeDateFilter, dateRangeDisplay, uniqueCompanies, selectedCompanies, uniqueStatuses, selectedStatuses]);

  const moreFilters = useMemo(() => [
    {
      key: 'country',
      component: (
        <MultiSelect
          options={uniqueCountries.map(country => ({ value: country, label: country }))}
          selected={selectedCountries}
          onSelectedChange={setSelectedCountries}
          placeholder="Filter by Country"
          icon={MapPin}
          className="w-[180px] bg-card"
        />
      )
    },
    {
      key: 'module',
      component: (
        <MultiSelect
          options={uniqueModules.map(module => ({ value: module, label: module }))}
          selected={selectedModules}
          onSelectedChange={setSelectedModules}
          placeholder="Filter by Module"
          icon={GitFork}
          className="w-[180px] bg-card"
        />
      )
    },
    {
      key: 'priority',
      component: (
        <MultiSelect
          options={uniquePriorities.map(priority => ({ value: priority, label: priority }))}
          selected={selectedPriorities}
          onSelectedChange={setSelectedPriorities}
          placeholder="Filter by Priority"
          icon={AlertCircle}
          className="w-[180px] bg-card"
        />
      )
    },
  ], [uniqueCountries, selectedCountries, uniqueModules, selectedModules, uniquePriorities, selectedPriorities]);
  // --- End Filter Definitions ---


  // New KPI Cards for Dashboard V2
  const coreMetricsV2 = [
    {
      title: "Tickets Created",
      value: metrics.totalTickets,
      icon: TicketIcon,
      archetype: 'volume' as const,
      trend: metrics.totalTicketsTrend,
      subtext: `Tickets created in the selected period.`,
      cta: "View all tickets",
      onClick: () => handleKPIDrilldown("Tickets Created", "All tickets created within the selected date range.", filteredDashboardTickets),
    },
    {
      title: "Open Backlog",
      value: metrics.totalOpenOverall,
      icon: Hourglass,
      archetype: metrics.totalOpenOverall > 20 ? 'attention' as const : 'volume' as const,
      trend: metrics.openTicketsTrend,
      subtext: `Total active tickets across all time.`,
      cta: "View active queue",
      onClick: () => handleKPIDrilldown("Total Open Tickets (Overall)", "All tickets currently in an active status.", allOpenTickets),
    },
    {
      title: "Avg. Resolution Time",
      value: metrics.medianResolutionTime,
      icon: Clock,
      archetype: 'health' as const,
      trend: -5, // Placeholder trend for time (negative is good)
      subtext: `Median time to resolve tickets this period.`,
      cta: "Analyze efficiency",
      onClick: () => handleKPIDrilldown("Resolved Tickets", "Tickets resolved or closed within the selected date range.", filteredDashboardTickets.filter(t => t && t.status && (t.status.toLowerCase() === 'resolved' || t.status.toLowerCase() === 'closed'))),
    },
    {
      title: "SLA Adherence (Res)",
      value: metrics.resolutionSlaMet,
      icon: ShieldAlert,
      archetype: metrics.resolutionSlaMet.includes('N/A') || parseFloat(metrics.resolutionSlaMet) < 90 ? 'health' as const : 'volume' as const,
      trend: 2, // Placeholder trend
      subtext: `Percentage of resolved tickets meeting SLA.`,
      cta: "View SLA breaches",
      onClick: () => handleKPIDrilldown("SLA Met Tickets", "Tickets resolved within their SLA.", filteredDashboardTickets.filter(t => t && t.due_by && t.updated_at && parseISO(t.updated_at) <= parseISO(t.due_by))),
    },
    {
      title: "Overdue Tickets",
      value: overdueTicketsList.length,
      icon: CalendarDays,
      archetype: overdueTicketsList.length > 0 ? 'attention' as const : 'normal' as const,
      trend: calculateTrend(overdueTicketsList.length, previousPeriodTickets.filter(t => t && t.due_by && isPast(parseISO(t.due_by))).length),
      subtext: `Tickets past their due date.`,
      cta: "Review overdue list",
      onClick: () => handleKPIDrilldown("Overdue Tickets", "Tickets currently past their due date.", overdueTicketsList),
    },
    {
      title: "Urgent Tickets at Risk",
      value: urgentTicketsAtRiskList.length,
      icon: AlertCircle,
      archetype: urgentTicketsAtRiskList.length > 0 ? 'attention' as const : 'normal' as const,
      trend: undefined,
      subtext: `Urgent tickets due within 2 hours.`,
      cta: "Prioritize now",
      onClick: () => handleKPIDrilldown("Urgent Tickets at Risk", "Urgent tickets due within the next 2 hours.", urgentTicketsAtRiskList),
    },
  ];


  return (
    <>
      <div className="flex-1 flex overflow-hidden bg-background">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col p-6 overflow-y-auto">
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
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Global Executive Overview</h1>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Insights for: <span className="font-semibold">{dateRangeDisplay}</span>
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <Button
                    onClick={() => setIsDashboardInsightsOverlayOpen(true)}
                    className="h-10 px-5 text-base font-semibold relative overflow-hidden group bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <SlidersHorizontal className="mr-2 h-4 w-4" /> View Insights
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                  </Button>
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
                    Sync Freshdesk
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                  </Button>
                </div>
              </div>

              {/* Filter Bar */}
              <div className="flex flex-wrap gap-4 items-center p-6 pt-4 bg-gray-50 dark:bg-gray-700 rounded-b-xl shadow-inner">
                {/* Default Filters (Date, Company, Status) */}
                {defaultFilters.map((filter, index) => (
                  <React.Fragment key={index}>
                    {filter.component}
                  </React.Fragment>
                ))}

                {/* More Filters Toggle */}
                <Button variant="outline" onClick={() => setShowMoreFilters(!showMoreFilters)} className="flex items-center gap-1 bg-card">
                  {showMoreFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  More Filters
                </Button>

                {/* Custom Date Picker Popover (Hidden by default, shown if custom is selected) */}
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

                {/* Expanded Filters */}
                {showMoreFilters && (
                  <>
                    {moreFilters.map((filter, index) => (
                      <React.Fragment key={index}>
                        {filter.component}
                      </React.Fragment>
                    ))}
                  </>
                )}

                {/* Search Input (Moved to the right end) */}
                <div className="relative flex-grow max-w-[250px] ml-auto">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    type="text"
                    placeholder="Search tickets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-3 py-2 w-full bg-card"
                  />
                </div>

                {/* Saved Views Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-1 bg-card">
                      <Bookmark className="h-4 w-4" /> Saved Views <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Exec Summary</DropdownMenuItem>
                    <DropdownMenuItem>Customer Success</DropdownMenuItem>
                    <DropdownMenuItem>Ops / Support Manager</DropdownMenuItem>
                    <DropdownMenuSeparator />
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
                
                {/* Executive Summary Strip (New Section) */}
                <section>
                  <OperationalTicker 
                    insights={dashboardInsights || []} 
                    allTickets={freshdeskTickets || []}
                    onSignalClick={handleKPIDrilldown}
                  />
                </section>

                {/* Row 1: High-level KPI cards */}
                <section>
                  <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                    <LayoutDashboard className="h-6 w-6 text-blue-600" /> Key Performance Indicators
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                    {coreMetricsV2.map((metric, index) => (
                      <DashboardMetricCardV2
                        key={index}
                        {...metric}
                        isLoading={isLoading}
                      />
                    ))}
                  </div>
                </section>

                <Separator className="my-10" />

                {/* Row 2: Critical Signals Panel */}
                <section>
                  <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                    <AlertCircle className="h-6 w-6 text-red-600" /> Top Critical Signals
                  </h2 >
                  <DashboardCriticalSignals 
                    insights={dashboardInsights || []} 
                    allTickets={freshdeskTickets || []} 
                    onViewTicketDetails={handleViewTicketDetails} 
                  />
                </section>

                <Separator className="my-10" />

                {/* Row 3: Charts */}
                <section>
                  <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                    <BarChart2 className="h-6 w-6 text-indigo-600" /> Key Visualizations
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="h-96 p-6 bg-card border border-border shadow-sm">
                      <CardTitle className="text-lg font-semibold mb-2 text-foreground w-full text-center">Ticket Volume & SLA Trend</CardTitle>
                      <CardContent className="h-[calc(100%-40px)] p-0 relative">
                        <VolumeSlaTrendChart tickets={freshdeskTickets || []} startDate={effectiveStartDate} endDate={effectiveEndDate} />
                        {/* Placeholder for Annotation Markers */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs text-muted-foreground opacity-50 pointer-events-none">
                          [Placeholder: Annotation markers for major releases/incidents]
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="h-96 p-6 bg-card border border-border shadow-sm">
                      <CardTitle className="text-lg font-semibold mb-2 text-foreground w-full text-center">Ticket Breakdown by Dimension</CardTitle>
                      <CardContent className="h-[calc(100%-40px)] p-0">
                        <TicketBreakdownChart
                          tickets={filteredDashboardTickets || []}
                          uniqueCompanies={uniqueCompanies}
                          uniqueModules={uniqueModules}
                          uniqueCountries={uniqueCountries}
                        />
                        {/* One-line insight placeholder */}
                        <p className="text-sm font-medium text-center mt-2 text-blue-600 dark:text-blue-400">
                          <Info className="h-4 w-4 inline mr-1" /> Insight: Cloudnine accounts for 32% of urgent tickets this week.
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="h-96 p-6 bg-card border border-border shadow-sm">
                      <CardTitle className="text-lg font-semibold mb-2 text-foreground w-full text-center">Ticket Aging Buckets (Open Tickets)</CardTitle>
                      <CardContent className="h-[calc(100%-40px)] p-0">
                        <AgingBucketsChart tickets={filteredDashboardTickets || []} onBarClick={handleKPIDrilldown} />
                      </CardContent>
                    </Card>
                    <Card className="h-96 p-6 bg-card border border-border shadow-sm">
                      <CardTitle className="text-lg font-semibold mb-2 text-foreground w-full text-center">Priority Distribution</CardTitle>
                      <CardContent className="h-[calc(100%-40px)] p-0">
                        <PriorityDistributionChart tickets={filteredDashboardTickets || []} />
                      </CardContent>
                    </Card>
                  </div>
                </section>

                <Separator className="my-10" />

                {/* Row 4: Tables & Risk/Escalation Panels */}
                <section>
                  <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                    <Table2 className="h-6 w-6 text-orange-600" /> Detailed Views & Risk Panels
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="h-[450px] p-6 bg-card border border-border shadow-sm">
                      <CardTitle className="text-lg font-semibold mb-2 text-foreground">Top Risk Tickets</CardTitle>
                      <CardContent className="h-[calc(100%-40px)] p-0">
                        <TopRiskTicketsTable tickets={freshdeskTickets || []} onRowClick={handleViewTicketDetails} />
                      </CardContent>
                    </Card>
                    <Card className="h-[450px] p-6 bg-card border border-border shadow-sm">
                      <CardTitle className="text-lg font-semibold mb-2 text-foreground">Company Health View</CardTitle>
                      <CardContent className="h-[calc(100%-40px)] p-0">
                        <CompanyHealthTable tickets={freshdeskTickets || []} />
                      </CardContent>
                    </Card>
                    <Card className="h-[450px] p-6 bg-card border border-border shadow-sm">
                      <CardTitle className="text-lg font-semibold mb-2 text-foreground">Team Load View</CardTitle>
                      <CardContent className="h-[calc(100%-40px)] p-0">
                        <TeamLoadTable tickets={freshdeskTickets || []} />
                      </CardContent>
                    </Card>
                    <Card className="h-[450px] p-6 bg-card border border-border shadow-sm">
                      <CardTitle className="text-lg font-semibold mb-2 text-foreground">Assignee Load Chart</CardTitle>
                      <CardContent className="h-[calc(100%-40px)] p-0">
                        <AssigneeLoadChart tickets={filteredDashboardTickets || []} displayMode="count" />
                      </CardContent>
                    </Card>
                  </div>
                </section>
              </div>
            )}
          </Card>
        </div>
      </div>

      <FilteredTicketsModal
        isOpen={isFilteredTicketsModalOpen}
        onClose={() => setIsFilteredTicketsModalOpen(false)}
        title={filteredModalTitle}
        description={filteredModalDescription}
        tickets={filteredModalTickets}
        onViewTicketDetails={handleViewTicketDetails}
      />
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
      {selectedTicketForDetail && (
        <TicketDetailModal
          isOpen={isTicketDetailModalOpen}
          onClose={handleCloseTicketDetailModal}
          ticket={selectedTicketForDetail}
        />
      )}
      <DashboardInsightsOverlay
        isOpen={isDashboardInsightsOverlayOpen}
        onClose={() => setIsDashboardInsightsOverlayOpen(false)}
        tickets={freshdeskTickets || []}
        onViewTicketDetails={handleViewTicketDetails}
        selectedCompanyForMap={selectedCompanies.length === 1 ? selectedCompanies[0] : undefined}
        onOpenFilteredTicketsModal={handleKPIDrilldown}
      />
    </>
  );
};

export default Index;