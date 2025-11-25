"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupabase } from "@/components/SupabaseProvider";
import TicketTable from "@/components/TicketTable";
import TicketDetailModal from "@/components/TicketDetailModal";
import DashboardMetricCard from "@/components/DashboardMetricCard";
import { Ticket, ConversationMessage } from "@/types";
import { Search, RefreshCw, Filter, ChevronLeft, ChevronRight, TicketIcon, Hourglass, CheckCircle, XCircle, AlertCircle, Bug, Loader2, Download } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import FilterNotification from "@/components/FilterNotification";
import { toast } from 'sonner';
import { exportCsvTemplate } from '@/utils/export';

const TicketsPage = () => {
  const { session } = useSupabase();
  const user = session?.user;
  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterPriority, setFilterPriority] = useState<string>("All");
  const [filterAssignee, setFilterAssignee] = useState<string>("All");
  const [filterCompany, setFilterCompany] = useState<string>("All");
  const [filterType, setFilterType] = useState<string>("All");
  const [filterDependency, setFilterDependency] = useState<string>("All");

  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 25;

  const queryClient = useQueryClient();

  // Fetch tickets from Supabase database
  const { data: freshdeskTickets, isLoading, error, isFetching } = useQuery<Ticket[], Error>({
    queryKey: ["freshdeskTickets"],
    queryFn: async () => {
      const { data, error } = await supabase.from('freshdesk_tickets').select('*').order('updated_at', { ascending: false }).limit(10000);
      if (error) throw error;
      return data.map(ticket => ({ ...ticket, id: ticket.freshdesk_id })) as Ticket[];
    },
    onSuccess: () => {
      toast.success("Tickets loaded from Supabase successfully!");
    },
    onError: (err) => {
      toast.error(`Failed to load tickets from Supabase: ${err.message}`);
    },
  } as UseQueryOptions<Ticket[], Error>);

  const handleSyncTickets = async () => {
    toast.loading("Syncing latest tickets from Freshdesk...", { id: "sync-tickets" });
    try {
      const { data, error } = await supabase.functions.invoke('fetch-freshdesk-tickets', {
        method: 'POST',
        body: { action: 'syncTickets' },
      });

      if (error) {
        throw error;
      }

      toast.success("Tickets synced successfully!", { id: "sync-tickets" });
      queryClient.invalidateQueries({ queryKey: ["freshdeskTickets"] });
      setCurrentPage(1);
    } catch (err: any) {
      toast.error(`Failed to sync tickets: ${err.message}`, { id: "sync-tickets" });
    }
  };

  const handleDownloadTemplate = () => {
    const headers = [
      "freshdesk_id", "subject", "priority", "status", "type", "requester_email",
      "created_at", "updated_at", "due_by", "fr_due_by", "description_text",
      "description_html", "assignee", "cf_company", "cf_country", "cf_module",
      "cf_dependency", "cf_recurrence", "custom_fields"
    ];
    exportCsvTemplate(headers, "freshdesk_tickets_template");
    toast.info("CSV template downloaded. Fill it with your historical data and upload to Supabase.");
  };

  const handleRowClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTicket(null);
  };

  const filteredTickets = useMemo(() => {
    if (!freshdeskTickets) return [];

    let currentTickets: Ticket[] = freshdeskTickets;

    return currentTickets.filter(ticket => {
      const matchesSearch = searchTerm === "" ||
        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.requester_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ticket.assignee && ticket.assignee.toLowerCase().includes(searchTerm.toLowerCase())) ||
        ticket.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === "All" || ticket.status.toLowerCase().includes(filterStatus.toLowerCase());
      const matchesPriority = filterPriority === "All" || ticket.priority.toLowerCase() === filterPriority.toLowerCase();
      const matchesAssignee = filterAssignee === "All" || (ticket.assignee && ticket.assignee.toLowerCase() === filterAssignee.toLowerCase());
      const matchesCompany = filterCompany === "All" || (ticket.cf_company && ticket.cf_company.toLowerCase() === filterCompany.toLowerCase());
      const matchesType = filterType === "All" || (ticket.type && ticket.type.toLowerCase() === filterType.toLowerCase());
      const matchesDependency = filterDependency === "All" || (ticket.cf_dependency && ticket.cf_dependency.toLowerCase() === filterDependency.toLowerCase());


      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee && matchesCompany && matchesType && matchesDependency;
    });
  }, [freshdeskTickets, searchTerm, filterStatus, filterPriority, filterAssignee, filterCompany, filterType, filterDependency]);

  const metrics = useMemo(() => {
    if (!freshdeskTickets) {
      return {
        totalTickets: 0,
        openTickets: 0,
        bugsReceived: 0,
        resolvedClosedTickets: 0,
        highPriorityTickets: 0,
      };
    }

    const totalTickets = freshdeskTickets.length;
    const openTickets = freshdeskTickets.filter(t => t.status.toLowerCase() === 'open (being processed)').length;
    const bugsReceived = freshdeskTickets.filter(t => t.type?.toLowerCase() === 'bug').length;
    const resolvedClosedTickets = freshdeskTickets.filter(t => t.status.toLowerCase() === 'resolved' || t.status.toLowerCase() === 'closed').length;
    const highPriorityTickets = freshdeskTickets.filter(t => t.priority.toLowerCase() === 'high' || t.priority.toLowerCase() === 'urgent').length;

    return {
      totalTickets,
      openTickets,
      bugsReceived,
      resolvedClosedTickets,
      highPriorityTickets,
    };
  }, [freshdeskTickets]);

  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = filteredTickets.slice(indexOfFirstTicket, indexOfLastTicket);
  const totalPages = Math.ceil(filteredTickets.length / ticketsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const getPageNumbers = (currentPage: number, totalPages: number, maxPageNumbersToShow: number = 5) => {
    const pageNumbers: (number | 'ellipsis')[] = [];
    const half = Math.floor(maxPageNumbersToShow / 2);

    let startPage = Math.max(1, currentPage - half);
    let endPage = Math.min(totalPages, currentPage + half);

    if (endPage - startPage + 1 < maxPageNumbersToShow) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + maxPageNumbersToShow - 1);
      } else if (endPage === totalPages) {
        startPage = Math.max(1, totalPages - maxPageNumbersToShow + 1);
      }
    }

    if (startPage > 1) {
      pageNumbers.push(1);
      if (startPage > 2) {
        pageNumbers.push('ellipsis');
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbers.push('ellipsis');
      }
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  const displayedPageNumbers = getPageNumbers(currentPage, totalPages);


  const uniqueAssignees = useMemo(() => {
    const assignees = new Set<string>();
    (freshdeskTickets || []).forEach(ticket => {
      if (ticket.assignee && ticket.assignee !== "Unassigned") {
        assignees.add(ticket.assignee);
      }
    });
    return ["All", "Unassigned", ...Array.from(assignees).sort()];
  }, [freshdeskTickets]);

  const uniqueStatuses = useMemo(() => {
    const statuses = new Set<string>();
    (freshdeskTickets || []).forEach(ticket => {
      statuses.add(ticket.status);
    });
    return ["All", ...Array.from(statuses).sort()];
  }, [freshdeskTickets]);

  const uniquePriorities = useMemo(() => {
    const priorities = new Set<string>();
    (freshdeskTickets || []).forEach(ticket => {
      priorities.add(ticket.priority);
    });
    return ["All", ...Array.from(priorities).sort()];
  }, [freshdeskTickets]);

  const uniqueCompanies = useMemo(() => {
    const companies = new Set<string>();
    (freshdeskTickets || []).forEach(ticket => {
      if (ticket.cf_company) {
        companies.add(ticket.cf_company);
      }
    });
    return ["All", ...Array.from(companies).sort()];
  }, [freshdeskTickets]);

  const uniqueTypes = useMemo(() => {
    const types = new Set<string>();
    (freshdeskTickets || []).forEach(ticket => {
      if (ticket.type) {
        types.add(ticket.type);
      }
    });
    return ["All", ...Array.from(types).sort()];
  }, [freshdeskTickets]);

  const uniqueDependencies = useMemo(() => {
    const dependencies = new Set<string>();
    (freshdeskTickets || []).forEach(ticket => {
      if (ticket.cf_dependency) {
        dependencies.add(ticket.cf_dependency);
      }
    });
    return ["All", ...Array.from(dependencies).sort()];
  }, [freshdeskTickets]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-red-500">Error loading tickets: {error.message}</p>
        <p className="text-red-500">Please ensure FRESHDESK_API_KEY and FRESHDESK_DOMAIN are set as Supabase secrets.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg flex flex-col h-full px-4">
        {/* Header Section */}
        <div className="pt-6 pb-3 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <hgroup>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Support & Ticketing
              </h1>
            </hgroup>
            <div className="flex gap-3">
              <Button
                onClick={handleDownloadTemplate}
                className="h-10 px-5 text-base font-semibold relative overflow-hidden group"
                variant="outline"
              >
                <Download className="mr-2 h-4 w-4" />
                Download CSV Template
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
                Sync Latest Tickets
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage and track customer support tickets
          </p>
        </div>

        {/* Metrics Overview Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 py-4 pb-2">
          <DashboardMetricCard
            title="Total Tickets"
            value={metrics.totalTickets}
            icon={TicketIcon}
            trend={12}
            description="All tickets in the system"
          />
          <DashboardMetricCard
            title="Open Tickets"
            value={metrics.openTickets}
            icon={Hourglass}
            trend={-5}
            description="Currently being processed"
          />
          <DashboardMetricCard
            title="Bugs Received"
            value={metrics.bugsReceived}
            icon={Bug}
            trend={8}
            description="Tickets categorized as bugs"
          />
          <DashboardMetricCard
            title="Resolved/Closed"
            value={metrics.resolvedClosedTickets}
            icon={CheckCircle}
            trend={15}
            description="Successfully handled"
          />
          <DashboardMetricCard
            title="High Priority"
            value={metrics.highPriorityTickets}
            icon={XCircle}
            trend={-2}
            description="Requiring immediate attention"
          />
        </div>

        {/* Search & Filters Bar */}
        <div className="py-4 pt-2 bg-gray-50 dark:bg-gray-700 rounded-b-xl shadow-inner">
          <div className="flex flex-wrap gap-2 w-full items-center">
            <div className="relative flex-grow min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by Ticket ID, Title, or Assignee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px] group">
                <Filter className="h-4 w-4 mr-2 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" />
                <span className="text-sm font-medium">Status:</span>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                {uniqueStatuses.map(status => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-[150px] group">
                <Filter className="h-4 w-4 mr-2 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" />
                <span className="text-sm font-medium">Priority:</span>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                {uniquePriorities.map(priority => (
                  <SelectItem key={priority} value={priority}>
                    {priority}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterAssignee} onValueChange={setFilterAssignee}>
              <SelectTrigger className="w-[150px] group">
                <Filter className="h-4 w-4 mr-2 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" />
                <span className="text-sm font-medium">Assignee:</span>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                {uniqueAssignees.map(assignee => (
                  <SelectItem key={assignee} value={assignee}>
                    {assignee}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterCompany} onValueChange={setFilterCompany}>
              <SelectTrigger className="w-[150px] group">
                <Filter className="h-4 w-4 mr-2 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" />
                <span className="text-sm font-medium">Company:</span>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                {uniqueCompanies.map(company => (
                  <SelectItem key={company} value={company}>
                    {company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[150px] group">
                <Filter className="h-4 w-4 mr-2 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" />
                <span className="text-sm font-medium">Type:</span>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                {uniqueTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterDependency} onValueChange={setFilterDependency}>
              <SelectTrigger className="w-[150px] group">
                <Filter className="h-4 w-4 mr-2 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" />
                <span className="text-sm font-medium">Dependency:</span>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                {uniqueDependencies.map(dependency => (
                  <SelectItem key={dependency} value={dependency}>
                    {dependency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Main content area for filter notification and scrollable table */}
        <div className="flex-grow py-4 flex flex-col">
          <FilterNotification
            filteredCount={filteredTickets.length}
            totalCount={(freshdeskTickets || []).length || 0}
            searchTerm={searchTerm}
            filterStatus={filterStatus}
            filterPriority={filterPriority}
            filterAssignee={filterAssignee}
            filterCompany={filterCompany}
            filterType={filterType}
            filterDependency={filterDependency}
            className="mb-2"
          />
          {/* This div will now be the scrollable container for the table */}
          <div className="flex-grow relative"> 
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
                <p className="text-lg font-medium">Loading tickets...</p>
              </div>
            ) : (
              <TicketTable tickets={currentTickets} onRowClick={handleRowClick} />
            )}
          </div>
        </div>

        {totalPages > 1 && (
          <Pagination className="mt-auto sticky bottom-0 z-10 bg-white dark:bg-gray-800 py-3 shadow-[0_-4px_6px_-1px_rgb(0_0_0/0.1),0_-2px_4px_-2px_rgb(0_0_0/0.1)] rounded-b-xl">
            <PaginationContent className="rounded-lg shadow-md bg-white dark:bg-gray-800 p-2">
              <PaginationItem>
                <PaginationPrevious
                  onClick={currentPage === 1 ? undefined : () => paginate(currentPage - 1)}
                  aria-disabled={currentPage === 1}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </PaginationPrevious>
              </PaginationItem>
              {displayedPageNumbers.map((pageNumber, index) => (
                pageNumber === 'ellipsis' ? (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      onClick={() => paginate(pageNumber as number)}
                      isActive={currentPage === pageNumber}
                      className={currentPage === pageNumber ? "bg-primary text-primary-foreground rounded-full" : "rounded-full"}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                )
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={currentPage === totalPages ? undefined : () => paginate(currentPage + 1)}
                  aria-disabled={currentPage === totalPages}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </PaginationNext>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
        
        {selectedTicket && (
          <TicketDetailModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            ticket={selectedTicket}
          />
        )}
      </div>
    </div>
  );
};

export default TicketsPage;