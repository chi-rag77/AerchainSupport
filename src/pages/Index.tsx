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
import { Search } from "lucide-react"; // Removed PanelLeftOpen, PanelRightOpen
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"; // Keep Tooltip for other uses

// Mock Data for demonstration
const MOCK_TICKETS: Ticket[] = [
  {
    id: "TKT-001",
    customer_id: "user123",
    subject: "Login issues with SSO integration",
    priority: "Urgent",
    status: "Open",
    type: "Technical",
    customer: "Acme Corp",
    requester_email: "john.doe@acmecorp.com",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-16T14:22:00Z",
    description_text: "The payment gateway is returning a 500 error on checkout.",
    description_html: "<p>The payment gateway is returning a <strong>500 error</strong> on checkout.</p>",
    assignee: "Sarah Chen",
  },
  {
    id: "TKT-002",
    customer_id: "user123",
    subject: "Payment processing delays",
    priority: "Medium",
    status: "Pending", // Changed from 'Pending' to 'in progress' for visual consistency with image
    type: "Feature Request",
    customer: "Beta Solutions",
    requester_email: "jane.smith@betasolutions.com",
    created_at: "2024-01-14T16:45:00Z",
    updated_at: "2024-01-16T11:15:00Z",
    description_text: "Please add a dark mode option to the user dashboard.",
    description_html: "<p>Please add a dark mode option to the user dashboard.</p>",
    assignee: "Mike Rodriguez",
  },
  {
    id: "TKT-003",
    customer_id: "user123",
    subject: "API rate limiting concerns",
    priority: "Urgent",
    status: "Open", // Changed from 'Open' to 'escalated' for visual consistency with image
    type: "Access Issue",
    customer: "Global Innovations",
    requester_email: "bob.johnson@globalinnovations.com",
    created_at: "2024-01-13T09:15:00Z",
    updated_at: "2024-01-16T08:30:00Z",
    description_text: "My account is locked. I can't log in.",
    description_html: "<p>My account is locked. I can't log in.</p>",
    assignee: "Alex Johnson",
  },
  {
    id: "TKT-004",
    customer_id: "user123",
    subject: "Dashboard performance optimization",
    priority: "Low",
    status: "Resolved",
    type: "Question",
    customer: "Tech Solutions Inc.",
    requester_email: "alice.wong@techsolutions.com",
    created_at: "2024-01-12T13:20:00Z",
    updated_at: "2024-01-15T17:45:00Z",
    description_text: "I have a question regarding the /users endpoint in your API documentation.",
    description_html: "<p>I have a question regarding the <code>/users</code> endpoint in your API documentation.</p>",
    assignee: "Sarah Chen",
  },
  {
    id: "TKT-005",
    customer_id: "user123",
    subject: "Mobile app crash on iOS 17",
    priority: "Medium",
    status: "Open",
    type: "Bug",
    customer: "Mobile Users",
    requester_email: "mobile.user@example.com",
    created_at: "2024-01-16T08:00:00Z",
    updated_at: "2024-01-16T08:00:00Z",
    description_text: "The app crashes when opening on iOS 17.",
    description_html: "<p>The app crashes when opening on iOS 17.</p>",
    assignee: "Unassigned",
  },
];

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

  const handleRowClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTicket(null);
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const userTickets = useMemo(() => {
    const currentUserTickets = MOCK_TICKETS.filter(ticket => ticket.customer_id === session?.user?.id || ticket.customer_id === "user123");

    return currentUserTickets.filter(ticket => {
      const matchesSearch = searchTerm === "" ||
        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.requester_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ticket.assignee && ticket.assignee.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = filterStatus === "All" || ticket.status.toLowerCase() === filterStatus.toLowerCase();
      const matchesPriority = filterPriority === "All" || ticket.priority.toLowerCase() === filterPriority.toLowerCase();
      const matchesAssignee = filterAssignee === "All" || (ticket.assignee && ticket.assignee.toLowerCase() === filterAssignee.toLowerCase());

      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
    });
  }, [session?.user?.id, searchTerm, filterStatus, filterPriority, filterAssignee]);

  const ticketMessages = selectedTicket ? MOCK_MESSAGES.filter(msg => msg.ticket_id === selectedTicket.id) : [];

  const uniqueAssignees = useMemo(() => {
    const assignees = new Set<string>();
    MOCK_TICKETS.forEach(ticket => {
      if (ticket.assignee && ticket.assignee !== "Unassigned") {
        assignees.add(ticket.assignee);
      }
    });
    return ["All", "Unassigned", ...Array.from(assignees).sort()];
  }, []);

  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900">
      <Sidebar showSidebar={showSidebar} toggleSidebar={toggleSidebar} />
      <div className="flex-1 p-8"> {/* Removed relative and absolute positioning for button */}
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
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Pending">In Progress</SelectItem> {/* Adjusted for mock data */}
                  <SelectItem value="Resolved">Resolved</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                  <SelectItem value="Escalated">Escalated</SelectItem> {/* Added for mock data */}
                </SelectContent>
              </Select>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Priority</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
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
        </div>
      </div>
    </div>
  );
};

export default Index;