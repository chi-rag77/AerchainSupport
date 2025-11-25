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
import { CheckCircle, Hourglass, Laptop, AlertCircle, XCircle, Clock, Users, Shield, MessageSquare, Tag, ArrowUpDown, Filter } from 'lucide-react'; // Added Tag icon, ArrowUpDown, Filter
import { Badge } from "@/components/ui/badge"; // Import Badge component
import { Button } from "@/components/ui/button"; // Import Button for clickable ID

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

  const renderSortAndFilterIcons = () => (
    <span className="ml-2 flex items-center text-muted-foreground">
      <ArrowUpDown className="h-3 w-3 opacity-50 hover:opacity-100 cursor-pointer" />
      <Filter className="h-3 w-3 opacity-50 hover:opacity-100 cursor-pointer ml-1" />
    </span>
  );

  return (
    <div className="relative w-full max-h-[calc(100vh - 570px)] overflow-y-auto"> {/* Adjusted max-h and added overflow-y-auto */}
      <Table className="min-w-full">
        <TableHeader className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-700">
          <TableRow>
            <TableHead className="w-[100px] py-2 whitespace-nowrap">
              <div className="flex items-center">Code {renderSortAndFilterIcons()}</div>
            </TableHead>
            <TableHead className="py-2 whitespace-nowrap">
              <div className="flex items-center">Subject {renderSortAndFilterIcons()}</div>
            </TableHead>
            <TableHead className="py-2 whitespace-nowrap">
              <div className="flex items-center">Created By {renderSortAndFilterIcons()}</div>
            </TableHead>
            <TableHead className="py-2 whitespace-nowrap">
              <div className="flex items-center">Status {renderSortAndFilterIcons()}</div>
            </TableHead>
            <TableHead className="py-2 whitespace-nowrap">
              <div className="flex items-center">Approver Role(s) {renderSortAndFilterIcons()}</div>
            </TableHead>
            <TableHead className="py-2 whitespace-nowrap">
              <div className="flex items-center">Approver(s) {renderSortAndFilterIcons()}</div>
            </TableHead>
            <TableHead className="py-2 text-right whitespace-nowrap">
              <div className="flex items-center justify-end">Ageing {renderSortAndFilterIcons()}</div>
            </TableHead>
            <TableHead className="py-2 text-right whitespace-nowrap">
              <div className="flex items-center justify-end">Created {renderSortAndFilterIcons()}</div>
            </TableHead>
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
                <TableCell className="font-medium py-2">
                  <Button variant="link" className="p-0 h-auto text-blue-600 dark:text-blue-400" onClick={(e) => { e.stopPropagation(); onRowClick(ticket); }}>
                    {ticket.id}
                  </Button>
                </TableCell>
                <TableCell className="py-2">{ticket.subject}</TableCell>
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
                <TableCell className="py-2">
                  <Badge className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusBadgeClasses(ticket.status)}`}>
                    {getStatusIcon(ticket.status)}
                    {ticket.status === 'Pending (Awaiting your Reply)' ? 'In Progress' : ticket.status}
                  </Badge>
                </TableCell>
                <TableCell className="py-2 text-muted-foreground">N/A</TableCell> {/* Placeholder for Approver Role(s) */}
                <TableCell className="py-2 text-muted-foreground">N/A</TableCell> {/* Placeholder for Approver(s) */}
                <TableCell className="py-2 text-right font-semibold">
                  {calculateAgeing(ticket)} days
                </TableCell>
                <TableCell className="py-2 text-right text-xs text-muted-foreground">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>{format(new Date(ticket.created_at), 'dd MMM · hh:mm a')}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      {formatTimeAgo(ticket.created_at)}
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center text-gray-500 dark:text-gray-400 py-3">
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