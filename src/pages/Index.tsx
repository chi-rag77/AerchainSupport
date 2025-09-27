"use client";

import React, { useState, useMemo } from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupabase } from "@/components/SupabaseProvider";
import { supabase } from "@/integrations/supabase/client";
import TicketTable from "@/components/TicketTable";
import TicketDetailModal from "@/components/TicketDetailModal";
import { Ticket, TicketMessage } from "@/types";

// Mock Data for demonstration
const MOCK_TICKETS: Ticket[] = [
  {
    id: "T-001",
    customer_id: "user123",
    subject: "Issue with payment gateway integration",
    priority: "High",
    status: "Open",
    type: "Technical",
    customer: "Acme Corp",
    requester_email: "john.doe@acmecorp.com",
    created_at: "2023-10-26T10:00:00Z",
    updated_at: "2023-10-26T11:30:00Z",
    description_text: "The payment gateway is returning a 500 error on checkout.",
    description_html: "<p>The payment gateway is returning a <strong>500 error</strong> on checkout.</p>",
  },
  {
    id: "T-002",
    customer_id: "user123",
    subject: "Feature request: Dark mode for dashboard",
    priority: "Low",
    status: "Pending",
    type: "Feature Request",
    customer: "Beta Solutions",
    requester_email: "jane.smith@betasolutions.com",
    created_at: "2023-10-25T14:15:00Z",
    updated_at: "2023-10-25T14:15:00Z",
    description_text: "Please add a dark mode option to the user dashboard.",
    description_html: "<p>Please add a dark mode option to the user dashboard.</p>",
  },
  {
    id: "T-003",
    customer_id: "user123",
    subject: "Account lockout after multiple failed attempts",
    priority: "Urgent",
    status: "Open",
    type: "Access Issue",
    customer: "Global Innovations",
    requester_email: "bob.johnson@globalinnovations.com",
    created_at: "2023-10-27T09:00:00Z",
    updated_at: "2023-10-27T09:15:00Z",
    description_text: "My account is locked. I can't log in.",
    description_html: "<p>My account is locked. I can't log in.</p>",
  },
  {
    id: "T-004",
    customer_id: "user123",
    subject: "Question about API documentation",
    priority: "Medium",
    status: "Resolved",
    type: "Question",
    customer: "Tech Solutions Inc.",
    requester_email: "alice.wong@techsolutions.com",
    created_at: "2023-10-24T16:00:00Z",
    updated_at: "2023-10-24T17:00:00Z",
    description_text: "I have a question regarding the /users endpoint in your API documentation.",
    description_html: "<p>I have a question regarding the <code>/users</code> endpoint in your API documentation.</p>",
  },
];

const MOCK_MESSAGES: TicketMessage[] = [
  {
    id: "M-001-1",
    ticket_id: "T-001",
    sender: "John Doe",
    body_html: "<p>Hi team, the payment gateway is consistently failing with a 500 error when customers try to complete their purchases. This is urgent.</p>",
    created_at: "2023-10-26T10:00:00Z",
    is_agent: false,
  },
  {
    id: "M-001-2",
    ticket_id: "T-001",
    sender: "Agent Sarah",
    body_html: "<p>Hi John, thanks for reporting this. I've escalated it to our engineering team. We'll investigate immediately.</p>",
    created_at: "2023-10-26T10:30:00Z",
    is_agent: true,
  },
  {
    id: "M-001-3",
    ticket_id: "T-001",
    sender: "Agent Sarah",
    body_html: "<p>Update: We've identified a configuration issue with the payment gateway. Working on a fix now.</p>",
    created_at: "2023-10-26T11:00:00Z",
    is_agent: true,
  },
  {
    id: "M-002-1",
    ticket_id: "T-002",
    sender: "Jane Smith",
    body_html: "<p>It would be great if the dashboard had a dark mode option. The current light theme is a bit harsh on the eyes during late-night work.</p>",
    created_at: "2023-10-25T14:15:00Z",
    is_agent: false,
  },
  {
    id: "M-003-1",
    ticket_id: "T-003",
    sender: "Bob Johnson",
    body_html: "<p>I tried logging in multiple times and now my account is locked. Please help me regain access.</p>",
    created_at: "2023-10-27T09:00:00Z",
    is_agent: false,
  },
  {
    id: "M-003-2",
    ticket_id: "T-003",
    sender: "Agent Mark",
    body_html: "<p>Hi Bob, I've unlocked your account. Please try logging in again. If you continue to have issues, please reset your password.</p>",
    created_at: "2023-10-27T09:15:00Z",
    is_agent: true,
  },
  {
    id: "M-004-1",
    ticket_id: "T-004",
    sender: "Alice Wong",
    body_html: "<p>The API documentation for the <code>/users</code> endpoint is a bit unclear. Could you provide an example of how to filter users by their creation date?</p>",
    created_at: "2023-10-24T16:00:00Z",
    is_agent: false,
  },
  {
    id: "M-004-2",
    ticket_id: "T-004",
    sender: "Agent Emily",
    body_html: "<p>Hi Alice, certainly! To filter users by creation date, you can use the <code>created_at_gte</code> and <code>created_at_lte</code> parameters. For example: <code>/users?created_at_gte=2023-01-01&created_at_lte=2023-01-31</code></p>",
    created_at: "2023-10-24T16:30:00Z",
    is_agent: true,
  },
];


const Index = () => {
  const { session } = useSupabase();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleRowClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTicket(null);
  };

  // Filter mock tickets to only show those associated with the current user's ID
  // In a real app, this would be handled by RLS on the Supabase query
  const userTickets = useMemo(() => {
    const currentUserTickets = MOCK_TICKETS.filter(ticket => ticket.customer_id === session?.user?.id || ticket.customer_id === "user123"); // "user123" is a placeholder for now

    return currentUserTickets.filter(ticket => {
      const matchesSearch = searchTerm === "" ||
        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.requester_email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === "All" || ticket.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [MOCK_TICKETS, session?.user?.id, searchTerm, filterStatus]);

  const ticketMessages = selectedTicket ? MOCK_MESSAGES.filter(msg => msg.ticket_id === selectedTicket.id) : [];

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-6xl text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
          Freshdesk Ticket Dashboard
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Welcome, {session?.user?.email}!
        </p>
        <Button onClick={handleLogout} variant="destructive" className="mb-8">
          Logout
        </Button>

        <div className="flex flex-col md:flex-row gap-4 mb-6 w-full max-w-6xl mx-auto">
          <Input
            placeholder="Search by subject or requester email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow"
          />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Resolved">Resolved</SelectItem>
              <SelectItem value="Closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-8">
          <TicketTable tickets={userTickets} onRowClick={handleRowClick} />
        </div>
      </div>
      
      {selectedTicket && (
        <TicketDetailModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          ticket={selectedTicket}
          messages={ticketMessages}
        />
      )}

      <MadeWithDyad />
    </div>
  );
};

export default Index;