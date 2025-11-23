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
import { Search, LayoutDashboard, TicketIcon, Hourglass, CalendarDays, CheckCircle, AlertCircle, ShieldAlert, Download, Filter, Bookmark, ChevronDown, Bug, Clock, User, Percent, Users, Loader2, BarChart3, TrendingUp, Scale, MessageSquare, RefreshCw } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Ticket } from "@/types";
import { format, subDays, isWithinInterval } from 'date-fns';
import { exportToCsv } from '@/utils/export';
import { toast } from 'sonner';
import HandWaveIcon from "@/components/HandWaveIcon";

// Import chart components (keeping them for now, but they won't be rendered)
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
  const [topNCustomers, setTopNCustomers] = useState<number | 'all'>(5);

  const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
  const dateRangeDisplay = selectedDate ? format(selectedDate, "MMM dd, yyyy") : "Today";


  // Fetch all tickets from Supabase for filtering and aggregation
  const { data: allSupabaseTickets, isLoading: isLoadingAllTickets, error: errorAllTickets } = useQuery<Ticket[], Error>({
    queryKey: ["allSupabaseTickets"],
    queryFn: async () => {
      const { data, error } = await supabase.from('freshdesk_tickets').select('*').limit(10000);
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
    ticketsCreatedOnSelectedDate.forEach(ticket => {
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
                  <LayoutDashboard className="h-8 w-8 text-primary" />
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Revamped Dashboard</h1>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  This is your new dashboard, ready for a fresh design!
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  onClick={handleExportSummary}
                  className="flex items-center gap-1"
                >
                  <Download className="h-4 w-4" /> Export Summary (CSV)
                </Button>
              </div>
            </div>

            {/* Placeholder for new content */}
            <div className="p-8 text-center text-muted-foreground">
              <p className="text-xl mb-4">Start building your amazing new dashboard here!</p>
              <p>You have a clean canvas. Feel free to add new components, charts, and layouts.</p>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default DashboardV2;