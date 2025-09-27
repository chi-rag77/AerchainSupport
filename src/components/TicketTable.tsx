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
      case 'open':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'pending': // Using 'pending' for 'in progress' from mock data
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'escalated':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
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
            <TableHead className="w-[120px]">Ticket ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>Date Created</TableHead>
            <TableHead>Last Updated</TableHead>
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
                <TableCell className="font-medium">{ticket.id}</TableCell>
                <TableCell>{ticket.subject}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClasses(ticket.status)}`}>
                    {ticket.status === 'Pending' ? 'in progress' : ticket.status}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityBadgeClasses(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </TableCell>
                <TableCell className="flex items-center">
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
                <TableCell>{format(new Date(ticket.created_at), 'MMM dd, hh:mm a')}</TableCell>
                <TableCell>{format(new Date(ticket.updated_at), 'MMM dd, hh:mm a')}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-gray-500 dark:text-gray-400">
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