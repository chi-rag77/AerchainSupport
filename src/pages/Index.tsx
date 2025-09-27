"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupabase } from "@/components/SupabaseProvider";
import TicketTable from "@/components/TicketTable";
import TicketDetailModal from "@/components/TicketDetailModal";
import Sidebar from "@/components/Sidebar";
import { Ticket, TicketMessage } from "@/types";
import { Search, RefreshCw } from "lucide-react";
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

// Mock Messages for demonstration (since we're not fetching messages from Freshdesk yet)
const MOCK_MESSAGES: TicketMessage[] = [
  {
    id: "M-001-1",
    ticket_id: "TKT-001",
    sender: "John Doe",
    body_html: "<p>Hi team, the payment gateway is consistently failing with a 500 error when customers try to complete their purchases. This is urgent.</p>",
    created_at: "2024-01-15T10:30:00Z",
    is_agent: false,
  },
  {
    id: "M-001-2",
    ticket_id: "TKT-001",
    sender: "Agent Sarah",
    body_html: "<p>Hi John, thanks for reporting this. I've escalated it to our engineering team. We'll investigate immediately.</p>",
    created_at: "2024-01-15T10:45:00Z",
    is_agent: true,
  },
  {
    id: "M-001-3",
    ticket_id: "TKT-001",
    sender: "Agent Sarah",
    body_html: "<p>Update: We've identified a configuration issue with the payment gateway. Working on a fix now.</p>",
    created_at: "2024-01-16T11:00:00Z",
    is_agent: true,
  },
  {
    id: "M-002-1",
    ticket_id: "TKT-002",
    sender: "Jane Smith",
    body_html: "<p>It would be great if the dashboard had a dark mode option. The current light theme is a bit harsh on the eyes during late-night work.</p>",
    created_at: "2024-01-14T16:45:00Z",
    is_agent: false,
  },
  {
    id: "M-003-1",
    ticket_id: "TKT-003",
    sender: "Bob Johnson",
    body_html: "<p>I tried logging in multiple times and now my account is locked. Please help me regain access.</p>",
    created_at: "2024-01-13T09:15:00Z",
    is_agent: false,
  },
  {
    id: "M-003-2",
    ticket_id: "TKT-003",
    sender: "Agent Mark",
    body_html: "<p>Hi Bob, I've unlocked your account. Please try logging in again. If you continue to have issues, please reset your password.</p>",
    created_at: "2024-01-13T09:30:00Z",
    is_agent: true,
  },
  {
    id: "M-004-1",
    ticket_id: "TKT-004",
    sender: "Alice Wong",
    body_html: "<p>The API documentation for the <code>/users</code> endpoint is a bit unclear. Could you provide an example of how to filter users by their creation date?</p>",
    created_at: "2024-01-12T13:20:00Z",
    is_agent: false,
  },
  {
    id: "M-004-2",
    ticket_id: "TKT-004",
    sender: "Agent Emily",
    body_html: "<p>Hi Alice, certainly! To filter users by creation date, you can use the <code>created_at_gte</code> and <code>created_at_lte</code> parameters. For example: <code>/users?created_at_gte=2023-01-01&created_at_lte=2023-01-31</code></p>",
    created_at: "2024-01-12T13:50:00Z",
    is_agent: true,
  },
];


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
        method: 'GET',
      });
      if (error) throw error;
      return data as Ticket[];
    },
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

  const ticketMessages = selectedTicket ? MOCK_MESSAGES.filter(msg => msg.ticket_id === selectedTicket.id) : [];

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
    <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900">
      <Sidebar showSidebar={showSidebar} toggleSidebar={toggleSidebar} />
      <div className="flex-1 p-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 h-full flex flex-col">
          <div className="w-full max-w-full mb-8 mx-auto">
            <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white text-left">
              Support & Ticketing
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-400 mb-6 text-left">
              Manage and track customer support tickets
            </p>

            <div className="flex flex-col md:flex-row gap-4 mb-6 w-full items-center">
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
                <SelectTrigger className="w-[160px]">
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
                <SelectTrigger className="w-[160px]">
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
                <SelectTrigger className="w-[160px]">
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
              <Button onClick={handleRefreshTickets} disabled={isFetching} className="w-full md:w-auto">
                {isFetching ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Fetch Latest Tickets
              </Button>
            </div>

            <div className="mt-8">
              <TicketTable tickets={currentTickets} onRowClick={handleRowClick} />
            </div>

            {totalPages > 1 && (
              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={currentPage === 1 ? undefined : () => paginate(currentPage - 1)}
                      aria-disabled={currentPage === 1}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        onClick={() => paginate(i + 1)}
                        isActive={currentPage === i + 1}
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
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
          
          {selectedTicket && (
            <TicketDetailModal
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              ticket={selectedTicket}
              messages={ticketMessages}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;