"use client";

import React, { useMemo } from 'react'; // Added useMemo
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Ticket } from '@/types';
import { format, formatDistanceToNowStrict, differenceInMinutes, parseISO, isPast } from 'date-fns';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle, Hourglass, Laptop, AlertCircle, XCircle, Clock, Users, Shield, MessageSquare, Tag, ArrowUpDown, Filter, CalendarX, Flag } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';

interface TopRiskTicketsTableProps {
  tickets: Ticket[];
  onRowClick: (ticket: Ticket) => void;
}

const TopRiskTicketsTable = ({ tickets, onRowClick }: TopRiskTicketsTableProps) => {
  const getStatusBadgeClasses = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open (being processed)':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'pending (awaiting your reply)':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'escalated':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'waiting on customer':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'on tech':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'on product':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'resolved':
        return <CheckCircle className="h-3 w-3 mr-1" />;
      case 'open (being processed)':
        return <Hourglass className="h-3 w-3 mr-1" />;
      case 'pending (awaiting your reply)':
        return <Clock className="h-3 w-3 mr-1" />;
      case 'on tech':
        return <Laptop className="h-3 w-3 mr-1" />;
      case 'escalated':
        return <AlertCircle className="h-3 w-3 mr-1" />;
      case 'closed':
        return <XCircle className="h-3 w-3 mr-1" />;
      case 'waiting on customer':
        return <Users className="h-3 w-3 mr-1" />;
      case 'on product':
        return <Shield className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return <AlertCircle className="h-3 w-3 mr-1 text-red-500" />;
      case 'high':
        return <AlertCircle className="h-3 w-3 mr-1 text-orange-500" />;
      case 'medium':
        return <MessageSquare className="h-3 w-3 mr-1 text-yellow-500" />;
      case 'low':
        return <Clock className="h-3 w-3 mr-1 text-gray-500" />;
      default:
        return null;
    }
  };

  const calculateAgeing = (ticket: Ticket) => {
    const createdAt = parseISO(ticket.created_at);
    const now = new Date();
    const statusLower = ticket.status.toLowerCase();

    if (statusLower === 'resolved' || statusLower === 'closed') {
      const updatedAt = parseISO(ticket.updated_at);
      return differenceInMinutes(updatedAt, createdAt);
    } else {
      return differenceInMinutes(now, createdAt);
    }
  };

  const formatAgeing = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  const getSlaDueStatus = (ticket: Ticket) => {
    if (!ticket.due_by || ticket.status.toLowerCase() === 'resolved' || ticket.status.toLowerCase() === 'closed') {
      return { text: 'N/A', color: 'text-muted-foreground' };
    }

    const dueDate = parseISO(ticket.due_by);
    const now = new Date();
    const diffMinutes = differenceInMinutes(dueDate, now);

    if (isPast(dueDate)) {
      return { text: `Overdue by ${formatAgeing(Math.abs(diffMinutes))}`, color: 'text-red-600 dark:text-red-400 font-semibold' };
    } else if (diffMinutes <= 2 * 60) { // 2 hours
      return { text: `Due in ${formatAgeing(diffMinutes)}`, color: 'text-orange-600 dark:text-orange-400 font-semibold' };
    } else if (diffMinutes <= 24 * 60) { // 24 hours
      return { text: `Due in ${formatAgeing(diffMinutes)}`, color: 'text-yellow-600 dark:text-yellow-400' };
    } else {
      return { text: format(dueDate, 'MMM dd, HH:mm'), color: 'text-muted-foreground' };
    }
  };

  const sortedTickets = useMemo(() => {
    const openTickets = tickets.filter(t =>
      t.status.toLowerCase() !== 'resolved' && t.status.toLowerCase() !== 'closed'
    );

    return openTickets.sort((a, b) => {
      // Sort by priority (Urgent > High > Medium > Low)
      const priorityOrder: { [key: string]: number } = { 'urgent': 4, 'high': 3, 'medium': 2, 'low': 1 };
      const priorityA = priorityOrder[a.priority.toLowerCase()] || 0;
      const priorityB = priorityOrder[b.priority.toLowerCase()] || 0;
      if (priorityA !== priorityB) return priorityB - priorityA; // Descending priority

      // Then by due_by (nearest or most overdue first)
      if (a.due_by && b.due_by) {
        const dueA = parseISO(a.due_by);
        const dueB = parseISO(b.due_by);
        return dueA.getTime() - dueB.getTime(); // Ascending due date
      }
      if (a.due_by) return -1; // a has due_by, b doesn't
      if (b.due_by) return 1;  // b has due_by, a doesn't

      return 0;
    }).slice(0, 20); // Limit to top 20 risk tickets
  }, [tickets]);

  return (
    <div className="w-full flex flex-col h-full">
      <div className="flex-grow overflow-y-auto">
        <Table className="min-w-full">
          <TableHeader className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-700">
            <TableRow>
              <TableHead className="w-[100px] py-2 whitespace-nowrap">Ticket ID</TableHead>
              <TableHead className="py-2 whitespace-nowrap">Subject</TableHead>
              <TableHead className="py-2 whitespace-nowrap">Company</TableHead>
              <TableHead className="py-2 whitespace-nowrap">Priority</TableHead>
              <TableHead className className="py-2 whitespace-nowrap">Status</TableHead>
              <TableHead className="py-2 text-right whitespace-nowrap">Age</TableHead>
              <TableHead className="py-2 text-right whitespace-nowrap">SLA Due</TableHead>
              <TableHead className="py-2 whitespace-nowrap">Assignee</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTickets.length > 0 ? (
              sortedTickets.map((ticket, index) => {
                const slaStatus = getSlaDueStatus(ticket);
                return (
                  <TableRow
                    key={ticket.id}
                    onClick={() => onRowClick(ticket)}
                    className={`cursor-pointer transition-all duration-200 ease-in-out hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-[1.005]
                      ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'}
                      ${ticket.priority.toLowerCase() === 'urgent' ? 'bg-red-50/50 dark:bg-red-950/30' : ''}
                    `}
                  >
                    <TableCell className="font-medium py-2">
                      <Button variant="link" className="p-0 h-auto text-blue-600 dark:text-blue-400" onClick={(e) => { e.stopPropagation(); onRowClick(ticket); }}>
                        {ticket.id}
                      </Button>
                    </TableCell>
                    <TableCell className="py-2">{ticket.subject}</TableCell>
                    <TableCell className="py-2">{ticket.cf_company || 'N/A'}</TableCell>
                    <TableCell className="py-2">
                      <Badge className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusBadgeClasses(ticket.priority)}`}>
                        {getPriorityIcon(ticket.priority)}
                        {ticket.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-2">
                      <Badge className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusBadgeClasses(ticket.status)}`}>
                        {getStatusIcon(ticket.status)}
                        {ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-2 text-right font-semibold">
                      {formatAgeing(calculateAgeing(ticket))}
                    </TableCell>
                    <TableCell className={cn("py-2 text-right", slaStatus.color)}>
                      {slaStatus.text}
                    </TableCell>
                    <TableCell className="py-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center">
                            {ticket.assignee && ticket.assignee !== "Unassigned" ? (
                              <>
                                <Avatar className="h-6 w-6 mr-2 border border-gray-200 dark:border-gray-600 shadow-sm">
                                  <AvatarFallback className="text-xs bg-gray-200 dark:bg-gray-700">
                                    {ticket.assignee.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                {ticket.assignee}
                              </>
                            ) : (
                              <span className="text-gray-500 dark:text-gray-400">Unassigned</span>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          {ticket.assignee || "Unassigned"}
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-gray-500 dark:text-gray-400 py-3">
                  No high-risk tickets found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TopRiskTicketsTable;