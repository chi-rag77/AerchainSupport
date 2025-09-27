"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupabase } from "@/components/SupabaseProvider";
import TicketTable from "@/components/TicketTable";
import TicketDetailModal from "@/components/TicketDetailModal";
import Sidebar from "@/components/Sidebar";
import { Ticket } from "@/types";
import { Search, RefreshCw, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Define the type for the conversation summary returned by the new endpoint
type ConversationSummary = {
  initialMessage: string;
  lastAgentReply: string;
};

const Index = () => {
  const { session } = useSupabase();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterPriority, setFilterPriority] = useState<string>("All");
  const [filterAssignee, setFilterAssignee] = useState<string>("All");
  const [showSidebar, setShowSidebar] = useState(true); // State for sidebar visibility

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 25;

  const queryClient = useQueryClient(); // Initialize query client

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  // Fetch tickets from Freshdesk via Supabase Edge Function
  const { data: freshdeskTickets, isLoading, error, isFetching } = useQuery<Ticket[], Error>({
    queryKey: ["freshdeskTickets"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-freshdesk-tickets', {
        method: 'POST', // Changed to POST
        body: { action: 'getTickets' }, // Added action to body
      });
      if (error) throw error;
      return data as Ticket[];
    },
  });

  // Fetch conversation summary for the selected ticket
  const { data: conversationSummary, isLoading: isLoadingSummary, error: summaryError, refetch: refetchConversationSummary } = useQuery<ConversationSummary, Error>({
    queryKey: ["conversationSummary", selectedTicket?.id],
    queryFn: async () => {
      if (!selectedTicket?.id) return { initialMessage: "N/A", lastAgentReply: "N/A" };
      const { data, error } = await supabase.functions.invoke('fetch-freshdesk-tickets', {
        method: 'POST', // Changed to POST
        body: { action: 'getConversationSummary', ticketId: selectedTicket.id }, // Added action and ticketId to body
      });
      if (error) throw error;
      return data as ConversationSummary;
    },
    enabled: !!selectedTicket?.id && isModalOpen, // Only fetch when a ticket is selected and modal is open
  });


  const handleRefreshTickets = () => {
    queryClient.invalidateQueries({ queryKey: ["freshdeskTickets"] }); // Invalidate and re-fetch
    setCurrentPage(1); // Reset to first page on refresh
  };

  const handleRowClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTicket(null);
    queryClient.invalidateQueries({ queryKey: ["conversationSummary"] }); // Clear summary when modal closes
  };

  const filteredTickets = useMemo(() => {
    if (!freshdeskTickets) return [];

    let currentTickets = freshdeskTickets;

    return currentTickets.filter(ticket => {
      const matchesSearch = searchTerm === "" ||
        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.requester_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ticket.assignee && ticket.assignee.toLowerCase().includes(searchTerm.toLowerCase())) ||
        ticket.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === "All" || ticket.status.toLowerCase().includes(filterStatus.toLowerCase());
      const matchesPriority = filterPriority === "All" || ticket.priority.toLowerCase() === filterPriority.toLowerCase();
      const matchesAssignee = filterAssignee === "All" || (ticket.assignee && ticket.assignee.toLowerCase() === filterAssignee.toLowerCase());

      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
    });
  }, [freshdeskTickets, searchTerm, filterStatus, filterPriority, filterAssignee]);

  // Pagination logic
  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = filteredTickets.slice(indexOfFirstTicket, indexOfLastTicket);
  const totalPages = Math.ceil(filteredTickets.length / ticketsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);


  const uniqueAssignees = useMemo(() => {
    const assignees = new Set<string>();
    freshdeskTickets?.forEach(ticket => {
      if (ticket.assignee && ticket.assignee !== "Unassigned") {
        assignees.add(ticket.assignee);
      }
    });
    return ["All", "Unassigned", ...Array.from(assignees).sort()];
  }, [freshdeskTickets]);

  const uniqueStatuses = useMemo(() => {
    const statuses = new Set<string>();
    freshdeskTickets?.forEach(ticket => {
      statuses.add(ticket.status);
    });
    return ["All", ...Array.from(statuses).sort()];
  }, [freshdeskTickets]);

  const uniquePriorities = useMemo(() => {
    const priorities = new Set<string>();
    freshdeskTickets?.forEach(ticket => {
      priorities.add(ticket.priority);
    });
    return ["All", ...Array.from(priorities).sort()];
  }, [freshdeskTickets]);


  if (isLoading && !isFetching) { // Only show full loading screen on initial load
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-gray-700 dark:text-gray-300">Loading tickets from Freshdesk...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-red-500">Error loading tickets: {error.message}</p>
        <p className="text-red-500">Please ensure FRESHDESK_API_KEY and FRESHDESK_DOMAIN are set as Supabase secrets.</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-100 dark:bg-gray-900">
      <Sidebar showSidebar={showSidebar} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg flex flex-col h-full">
          {/* Header Section */}
          <div className="p-8 pb-4 border-b border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Support & Ticketing
              </h1>
              <Button
                onClick={handleRefreshTickets}
                disabled={isFetching}
                className="h-12 px-6 text-lg font-semibold relative overflow-hidden group"
              >
                {isFetching ? (
                  <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-5 w-5" />
                )}
                Fetch Latest Tickets
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
              </Button>
            </div>
            <p className="text-base text-gray-600 dark:text-gray-400">
              Manage and track customer support tickets
            </p>
          </div>

          {/* Search & Filters Bar */}
          <div className="p-8 pt-4 bg-gray-50 dark:bg-gray-700 rounded-b-xl shadow-inner">
            <div className="flex flex-col md:flex-row gap-4 w-full items-center">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by Ticket ID, Title, or Assignee..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[160px] group">
                  <Filter className="h-4 w-4 mr-2 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" />
                  <SelectValue placeholder="All Status" />
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
                <SelectTrigger className="w-[160px] group">
                  <Filter className="h-4 w-4 mr-2 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" />
                  <SelectValue placeholder="All Priority" />
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
                <SelectTrigger className="w-[160px] group">
                  <Filter className="h-4 w-4 mr-2 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" />
                  <SelectValue placeholder="All Assignees" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueAssignees.map(assignee => (
                    <SelectItem key={assignee} value={assignee}>
                      {assignee}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex-grow overflow-y-auto p-8">
            <TicketTable tickets={currentTickets} onRowClick={handleRowClick} />
          </div>

          {totalPages > 1 && (
            <Pagination className="mt-auto sticky bottom-0 z-10 bg-white dark:bg-gray-800 py-4 shadow-[0_-4px_6px_-1px_rgb(0_0_0/0.1),0_-2px_4px_-2px_rgb(0_0_0/0.1)] rounded-b-xl">
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
                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      onClick={() => paginate(i + 1)}
                      isActive={currentPage === i + 1}
                      className={currentPage === i + 1 ? "bg-primary text-primary-foreground rounded-full" : "rounded-full"}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
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
              conversationSummary={conversationSummary}
              isLoadingSummary={isLoadingSummary}
              summaryError={summaryError}
              onRefreshSummary={refetchConversationSummary}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;