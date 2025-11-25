"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupabase } from "@/components/SupabaseProvider";
import TicketTable from "@/components/TicketTable";
import TicketDetailModal from "@/components/TicketDetailModal";
import QueueSummaryCard from "@/components/QueueSummaryCard"; // Changed from DashboardMetricCard
import { Ticket, ConversationMessage } from "@/types";
import { Search, RefreshCw, Filter, ChevronLeft, ChevronRight, TicketIcon, Hourglass, CheckCircle, XCircle, AlertCircle, Bug, Loader2, Download, LayoutDashboard, Eraser, ListFilter, PlusCircle, ArrowUpDown, Settings, Inbox } from "lucide-react"; // Added ListFilter, PlusCircle, ArrowUpDown, Settings, Inbox
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MultiSelect } from "@/components/MultiSelect";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Added Tabs components
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet"; // Added Sheet components

const TicketsPage = () => {
  const { session } = useSupabase();
  const user = session?.user;
  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterPriority, setFilterPriority] = useState<string>("All");
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedDependencies, setSelectedDependencies] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all"); // New state for tabs
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false); // New state for filter sheet
  const [showSearchInput, setShowSearchInput] = useState(false); // State to toggle search input visibility

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

  const handleCreateIntake = () => {
    // Placeholder for creating a new intake/ticket
    toast.info("Functionality to create a new intake/ticket will be implemented here!");
  };

  const handleRowClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTicket(null);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilterStatus("All");
    setFilterPriority("All");
    setSelectedAssignees([]);
    setSelectedCompanies([]);
    setSelectedTypes([]);
    setSelectedDependencies([]);
    setCurrentPage(1);
    setIsFilterSheetOpen(false); // Close sheet after clearing
  };

  const filteredTickets = useMemo(() => {
    if (!freshdeskTickets) return [];

    let currentTickets: Ticket[] = freshdeskTickets;

    // Apply tab filter
    if (activeTab === "myPendingApproval" && user?.email) {
      // This is a placeholder. Real "pending approval" would require specific ticket statuses or custom fields.
      // For now, let's filter by tickets assigned to the user and not yet resolved/closed.
      currentTickets = currentTickets.filter(ticket =>
        ticket.assignee?.toLowerCase().includes(fullName.toLowerCase()) &&
        ticket.status.toLowerCase() !== 'resolved' &&
        ticket.status.toLowerCase() !== 'closed'
      );
    }

    return currentTickets.filter(ticket => {
      const matchesSearch = searchTerm === "" ||
        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.requester_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ticket.assignee && ticket.assignee.toLowerCase().includes(searchTerm.toLowerCase())) ||
        ticket.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === "All" || ticket.status.toLowerCase().includes(filterStatus.toLowerCase());
      const matchesPriority = filterPriority === "All" || ticket.priority.toLowerCase() === filterPriority.toLowerCase();
      const matchesAssignee = selectedAssignees.length === 0 || (ticket.assignee && selectedAssignees.includes(ticket.assignee));
      const matchesCompany = selectedCompanies.length === 0 || (ticket.cf_company && selectedCompanies.includes(ticket.cf_company));
      const matchesType = selectedTypes.length === 0 || (ticket.type && selectedTypes.includes(ticket.type));
      const matchesDependency = selectedDependencies.length === 0 || (ticket.cf_dependency && selectedDependencies.includes(ticket.cf_dependency));


      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee && matchesCompany && matchesType && matchesDependency;
    });
  }, [freshdeskTickets, searchTerm, filterStatus, filterPriority, selectedAssignees, selectedCompanies, selectedTypes, selectedDependencies, activeTab, user?.email, fullName]);

  const metrics = useMemo(() => {
    if (!freshdeskTickets) {
      return {
        totalTickets: 0,
        openTickets: 0,
        bugsReceived: 0,
        resolvedClosedTickets: 0,
        highPriorityTickets: 0,
        draftTickets: 0, // New metric
        awaitingActions: 0, // New metric
        activeReleased: 0, // New metric
      };
    }

    const totalTickets = freshdeskTickets.length;
    const openTickets = freshdeskTickets.filter(t => t.status.toLowerCase() === 'open (being processed)').length;
    const bugsReceived = freshdeskTickets.filter(t => t.type?.toLowerCase() === 'bug').length;
    const resolvedClosedTickets = freshdeskTickets.filter(t => t.status.toLowerCase() === 'resolved' || t.status.toLowerCase() === 'closed').length;
    const highPriorityTickets = freshdeskTickets.filter(t => t.priority.toLowerCase() === 'high' || t.priority.toLowerCase() === 'urgent').length;

    // Placeholder metrics for the new summary cards
    const draftTickets = freshdeskTickets.filter(t => t.status.toLowerCase().includes('draft')).length; // Assuming a 'draft' status
    const awaitingActions = freshdeskTickets.filter(t => t.status.toLowerCase().includes('pending') || t.status.toLowerCase().includes('waiting')).length;
    const activeReleased = freshdeskTickets.filter(t => t.status.toLowerCase().includes('open') || t.status.toLowerCase().includes('on tech') || t.status.toLowerCase().includes('on product')).length;


    return {
      totalTickets,
      openTickets,
      bugsReceived,
      resolvedClosedTickets,
      highPriorityTickets,
      draftTickets,
      awaitingActions,
      activeReleased,
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
    return Array.from(assignees).sort();
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
    return Array.from(companies).sort();
  }, [freshdeskTickets]);

  const uniqueTypes = useMemo(() => {
    const types = new Set<string>();
    (freshdeskTickets || []).forEach(ticket => {
      if (ticket.type) {
        types.add(ticket.type);
      }
    });
    return Array.from(types).sort();
  }, [freshdeskTickets]);

  const uniqueDependencies = useMemo(() => {
    const dependencies = new Set<string>();
    (freshdeskTickets || []).forEach(ticket => {
      if (ticket.cf_dependency) {
        dependencies.add(ticket.cf_dependency);
      }
    });
    return Array.from(dependencies).sort();
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
    <div className="flex-1 flex flex-col p-6 overflow-y-auto bg-background">
      <Card className="flex flex-col h-full p-0 overflow-hidden border-none shadow-xl">
        {/* Header Section */}
        <div className="p-6 pb-4 bg-gradient-to-br from-blue-500/5 to-purple-500/5 border-b border-border shadow-sm">
          <div className="flex justify-between items-center">
            <div className="flex flex-col items-start">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Support & Ticketing Queue</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manage and track customer support tickets efficiently.
              </p>
            </div>
          </div>
        </div>

        {/* Summary Metrics */}
        <section className="p-6 pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <QueueSummaryCard
              title="Draft"
              value={metrics.draftTickets}
              icon={Settings} // Changed icon to Settings
              description="Tickets currently in draft status."
              colorClass="bg-gray-50 dark:bg-gray-700"
            />
            <QueueSummaryCard
              title="Awaiting Actions"
              value={metrics.awaitingActions}
              icon={Hourglass}
              description="Tickets waiting for an action from agents or customers."
              colorClass="bg-yellow-50 dark:bg-yellow-950/30"
            />
            <QueueSummaryCard
              title="Active/Released"
              value={metrics.activeReleased}
              icon={CheckCircle}
              description="Tickets that are currently active or have been released."
              colorClass="bg-blue-50 dark:bg-blue-950/30"
            />
            <QueueSummaryCard
              title="Total Tickets"
              value={metrics.totalTickets}
              icon={Inbox} // Changed icon to Inbox
              description="All tickets in the system."
              colorClass="bg-purple-50 dark:bg-purple-950/30"
            />
          </div>
        </section>

        <Separator className="mx-6" />

        {/* Control Bar (Tabs, Filters, Search, Actions) */}
        <div className="p-6 pt-4 flex flex-wrap items-center justify-between gap-3 bg-gray-50 dark:bg-gray-700 rounded-b-xl shadow-inner">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow-0">
            <TabsList className="bg-card">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="myPendingApproval">My Pending Approval</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-3 flex-grow justify-end">
            {showSearchInput && (
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-[200px] bg-card transition-all duration-300"
              />
            )}
            <Button variant="ghost" size="icon" onClick={() => setShowSearchInput(!showSearchInput)}>
              <Search className="h-5 w-5 text-muted-foreground" />
            </Button>

            <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 bg-card">
                  <ListFilter className="h-5 w-5" /> Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
                <SheetHeader>
                  <SheetTitle className="text-2xl font-bold">Filter Tickets</SheetTitle>
                  <SheetDescription>
                    Apply filters to narrow down the ticket list.
                  </SheetDescription>
                </SheetHeader>
                <div className="flex-grow overflow-y-auto py-4 space-y-4">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full bg-card">
                      <Filter className="h-4 w-4 mr-2 text-gray-500" />
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
                    <SelectTrigger className="w-full bg-card">
                      <Filter className="h-4 w-4 mr-2 text-gray-500" />
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
                  <MultiSelect
                    options={uniqueAssignees.map(assignee => ({ value: assignee, label: assignee }))}
                    selected={selectedAssignees}
                    onSelectedChange={setSelectedAssignees}
                    placeholder="Filter by Assignee"
                    className="w-full bg-card"
                  />
                  <MultiSelect
                    options={uniqueCompanies.map(company => ({ value: company, label: company }))}
                    selected={selectedCompanies}
                    onSelectedChange={setSelectedCompanies}
                    placeholder="Filter by Company"
                    className="w-full bg-card"
                  />
                  <MultiSelect
                    options={uniqueTypes.map(type => ({ value: type, label: type }))}
                    selected={selectedTypes}
                    onSelectedChange={setSelectedTypes}
                    placeholder="Filter by Type"
                    className="w-full bg-card"
                  />
                  <MultiSelect
                    options={uniqueDependencies.map(dependency => ({ value: dependency, label: dependency }))}
                    selected={selectedDependencies}
                    onSelectedChange={setSelectedDependencies}
                    placeholder="Filter by Dependency"
                    className="w-full bg-card"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t border-border">
                  <Button variant="outline" onClick={handleClearFilters}>
                    <Eraser className="h-4 w-4 mr-2" /> Clear Filters
                  </Button>
                  <Button onClick={() => setIsFilterSheetOpen(false)}>Apply</Button>
                </div>
              </SheetContent>
            </Sheet>

            <Button variant="ghost" size="icon" onClick={handleSyncTickets} disabled={isFetching}>
              {isFetching ? (
                <RefreshCw className="h-5 w-5 animate-spin text-primary" />
              ) : (
                <RefreshCw className="h-5 w-5 text-muted-foreground" />
              )}
            </Button>
            <Button onClick={handleCreateIntake} className="flex items-center gap-2 bg-primary text-primary-foreground">
              <PlusCircle className="h-5 w-5" /> Create Intake
            </Button>
          </div>
        </div>

        {/* Main content area for filter notification and scrollable table */}
        <div className="flex-grow p-6 pt-4 flex flex-col">
          <FilterNotification
            filteredCount={filteredTickets.length}
            totalCount={(freshdeskTickets || []).length || 0}
            searchTerm={searchTerm}
            filterStatus={filterStatus}
            filterPriority={filterPriority}
            filterAssignee={selectedAssignees.length > 0 ? selectedAssignees.join(', ') : "All"}
            filterCompany={selectedCompanies.length > 0 ? selectedCompanies.join(', ') : "All"}
            filterType={selectedTypes.length > 0 ? selectedTypes.join(', ') : "All"}
            filterDependency={selectedDependencies.length > 0 ? selectedDependencies.join(', ') : "All"}
            className="mb-4"
          />
          {/* This div will now be the scrollable container for the table */}
          <div className="flex-grow overflow-y-auto rounded-lg border border-border shadow-md"> 
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
      </Card>
    </div>
  );
};

export default TicketsPage;