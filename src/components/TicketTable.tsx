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
import { format, formatDistanceToNowStrict, differenceInDays } from 'date-fns'; // Import differenceInDays
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle, Hourglass, Laptop, AlertCircle, XCircle, Clock, Users, Shield, MessageSquare } from 'lucide-react';

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
        return <AlertCircle className="h-3 w-3 mr-1" />;
      case 'high':
        return <AlertCircle className="h-3 w-3 mr-1" />;
      case 'medium':
        return <MessageSquare className="h-3 w-3 mr-1" />;
      case 'low':
        return <Clock className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistanceToNowStrict(date, { addSuffix: true });
  };

  const calculateAgeing = (ticket: Ticket) => {
    const createdAt = new Date(ticket.created_at);
    const now = new Date();
    const statusLower = ticket.status.toLowerCase();

    if (statusLower === 'resolved' || statusLower === 'closed') {
      const updatedAt = new Date(ticket.updated_at);
      return differenceInDays(updatedAt, createdAt);
    } else {
      return differenceInDays(now, createdAt);
    }
  };

  return (
    <div className="rounded-lg shadow-md w-full bg-white dark:bg-gray-800 h-full scroll-smooth"> {/* Removed overflow-y-auto and max-h-[600px] */}
      <Table className="min-w-full"> {/* Added min-w-full */}
        <TableHeader className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-700">
          <TableRow>
            <TableHead className="w-[120px] py-3 whitespace-nowrap">Ticket ID</TableHead>
            <TableHead className="py-3 whitespace-nowrap">Title</TableHead>
            <TableHead className="py-3 whitespace-nowrap">Company</TableHead>
            <TableHead className="py-3 whitespace-nowrap">Type</TableHead>
            <TableHead className="py-3 whitespace-nowrap">Dependency</TableHead>
            <TableHead className="py-3 whitespace-nowrap">Status</TableHead>
            <TableHead className="py-3 whitespace-nowrap">Priority</TableHead>
            <TableHead className="py-3 whitespace-nowrap">Assignee</TableHead>
            <TableHead className="py-3 text-right whitespace-nowrap">Ageing</TableHead>
            <TableHead className="py-3 text-right whitespace-nowrap">Created</TableHead>
            <TableHead className="py-3 text-right whitespace-nowrap">Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.length > 0 ? (
            tickets.map((ticket, index) => (
              <TableRow 
                key={ticket.id} 
                onClick={() => onRowClick(ticket)} 
                className={`cursor-pointer transition-all duration-200 ease-in-out hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-[1.005] 
                  ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'} 
                  ${ticket.status.toLowerCase() === 'escalated' ? 'bg-red-50/50 dark:bg-red-950/30' : ''}
                `}
              >
                <TableCell className="font-medium py-3">{ticket.id}</TableCell>
                <TableCell className="py-3">{ticket.subject}</TableCell>
                <TableCell className="py-3">{ticket.cf_company || 'N/A'}</TableCell>
                <TableCell className="py-3">{ticket.type || 'N/A'}</TableCell>
                <TableCell className="py-3">{ticket.cf_dependency || 'N/A'}</TableCell>
                <TableCell className="py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusBadgeClasses(ticket.status)}`}>
                    {getStatusIcon(ticket.status)}
                    {ticket.status === 'Pending (Awaiting your Reply)' ? 'In Progress' : ticket.status}
                  </span>
                </TableCell>
                <TableCell className="py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getPriorityBadgeClasses(ticket.priority)}`}>
                    {getPriorityIcon(ticket.priority)}
                    {ticket.priority}
                  </span>
                </TableCell>
                <TableCell className="py-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center">
                        {ticket.assignee && ticket.assignee !== "Unassigned" ? (
                          <>
                            <Avatar className="h-7 w-7 mr-2 border border-gray-200 dark:border-gray-600 shadow-sm">
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
                <TableCell className="py-3 text-right font-semibold">
                  {calculateAgeing(ticket)} days
                </TableCell>
                <TableCell className="py-3 text-right">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>{format(new Date(ticket.created_at), 'dd MMM · hh:mm a')}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      {formatTimeAgo(ticket.created_at)}
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell className="py-3 text-right">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>{format(new Date(ticket.updated_at), 'dd MMM · hh:mm a')}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      {formatTimeAgo(ticket.updated_at)}
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={11} className="h-24 text-center text-gray-500 dark:text-gray-400 py-3">
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