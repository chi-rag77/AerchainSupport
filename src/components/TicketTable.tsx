"use client";

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Ticket } from '@/types';
import { format } from 'date-fns';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface TicketTableProps {
  tickets: Ticket[];
  onRowClick: (ticket: Ticket) => void;
}

const TicketTable = ({ tickets, onRowClick }: TicketTableProps) => {
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

  const getPriorityBadgeClasses = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="rounded-md border w-full bg-white dark:bg-gray-800">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px] py-2">Ticket ID</TableHead>
            <TableHead className="py-2">Title</TableHead>
            <TableHead className="py-2">Company</TableHead> {/* New Column */}
            <TableHead className="py-2">Type</TableHead> {/* New Column */}
            <TableHead className="py-2">Dependency</TableHead> {/* New Column */}
            <TableHead className="py-2">Status</TableHead>
            <TableHead className="py-2">Priority</TableHead>
            <TableHead className="py-2">Assignee</TableHead>
            <TableHead className="py-2">Date Created</TableHead>
            <TableHead className="py-2">Last Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.length > 0 ? (
            tickets.map((ticket) => (
              <TableRow 
                key={ticket.id} 
                onClick={() => onRowClick(ticket)} 
                className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  ticket.status.toLowerCase() === 'escalated' ? 'bg-red-50/50 dark:bg-red-950/30' : ''
                }`}
              >
                <TableCell className="font-medium py-2">{ticket.id}</TableCell>
                <TableCell className="py-2">{ticket.subject}</TableCell>
                <TableCell className="py-2">{ticket.cf_company || 'N/A'}</TableCell> {/* Display Company */}
                <TableCell className="py-2">{ticket.type || 'N/A'}</TableCell> {/* Display Type */}
                <TableCell className="py-2">{ticket.cf_dependency || 'N/A'}</TableCell> {/* Display Dependency */}
                <TableCell className="py-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClasses(ticket.status)}`}>
                    {ticket.status === 'Pending (Awaiting your Reply)' ? 'in progress' : ticket.status}
                  </span>
                </TableCell>
                <TableCell className="py-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityBadgeClasses(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </TableCell>
                <TableCell className="flex items-center py-2">
                  {ticket.assignee && ticket.assignee !== "Unassigned" ? (
                    <>
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarFallback className="text-xs bg-gray-200 dark:bg-gray-700">
                          {ticket.assignee.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      {ticket.assignee}
                    </>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">Unassigned</span>
                  )}
                </TableCell>
                <TableCell className="py-2">{format(new Date(ticket.created_at), 'MMM dd, hh:mm a')}</TableCell>
                <TableCell className="py-2">{format(new Date(ticket.updated_at), 'MMM dd, hh:mm a')}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={10} className="h-24 text-center text-gray-500 dark:text-gray-400 py-2">
                No tickets found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TicketTable;