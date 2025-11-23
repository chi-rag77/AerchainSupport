"use client";

import React from 'react';
import { Ticket } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { AlertCircle, Clock, Tag, User, Loader2 } from 'lucide-react';

interface TicketHeaderProps {
  ticket: Ticket;
}

const TicketHeader = ({ ticket }: TicketHeaderProps) => {
  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    let classes = "font-semibold text-white";
    let icon = null;

    switch (statusLower) {
      case 'open (being processed)':
        classes += " bg-gradient-to-r from-indigo-500 to-sky-400 animate-pulse-slow";
        icon = <Loader2 className="h-3 w-3 mr-1 animate-spin" />;
        break;
      case 'pending (awaiting your reply)':
        classes += " bg-gradient-to-r from-yellow-500 to-orange-400";
        icon = <Clock className="h-3 w-3 mr-1" />;
        break;
      case 'resolved':
        classes += " bg-gradient-to-r from-green-500 to-emerald-400";
        icon = <CheckCircle className="h-3 w-3 mr-1" />;
        break;
      case 'closed':
        classes += " bg-gray-500";
        icon = <Tag className="h-3 w-3 mr-1" />;
        break;
      case 'escalated':
        classes += " bg-gradient-to-r from-red-600 to-rose-500";
        icon = <AlertCircle className="h-3 w-3 mr-1" />;
        break;
      default:
        classes += " bg-gray-500";
        icon = <Tag className="h-3 w-3 mr-1" />;
        break;
    }
    return (
      <Badge className={cn("px-2 py-1 rounded-full text-xs flex items-center", classes)}>
        {icon} {status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityLower = priority.toLowerCase();
    let classes = "font-semibold text-white";
    let icon = null;

    switch (priorityLower) {
      case 'urgent':
        classes += " bg-gradient-to-r from-rose-500 to-red-400";
        icon = <AlertCircle className="h-3 w-3 mr-1" />;
        break;
      case 'high':
        classes += " bg-gradient-to-r from-orange-500 to-yellow-400";
        icon = <AlertCircle className="h-3 w-3 mr-1" />;
        break;
      case 'medium':
        classes += " bg-gradient-to-r from-blue-500 to-cyan-400";
        icon = <Tag className="h-3 w-3 mr-1" />;
        break;
      case 'low':
        classes += " bg-gray-500";
        icon = <Tag className="h-3 w-3 mr-1" />;
        break;
      default:
        classes += " bg-gray-500";
        icon = <Tag className="h-3 w-3 mr-1" />;
        break;
    }
    return (
      <Badge className={cn("px-2 py-1 rounded-full text-xs flex items-center", classes)}>
        {icon} {priority}
      </Badge>
    );
  };

  const getTypeBadge = (type?: string) => {
    const typeDisplay = type || 'Unknown';
    return (
      <Badge variant="secondary" className="px-2 py-1 rounded-full text-xs flex items-center bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
        <Tag className="h-3 w-3 mr-1" /> {typeDisplay}
      </Badge>
    );
  };

  const requesterInitials = ticket.requester_email.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className="sticky top-0 bg-white/70 backdrop-blur-md z-10 p-6 pb-4 border-b border-gray-200/50 rounded-tl-3xl">
      <h2 className="text-2xl font-bold text-foreground leading-tight mb-2">
        {ticket.subject}
      </h2>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {getStatusBadge(ticket.status)}
        {getPriorityBadge(ticket.priority)}
        {getTypeBadge(ticket.type)}
      </div>
      <div className="flex items-center text-sm text-muted-foreground">
        <Avatar className="h-7 w-7 mr-2 border border-gray-200 dark:border-gray-600 shadow-sm">
          <AvatarFallback className="text-xs bg-gray-200 dark:bg-gray-700">
            {requesterInitials}
          </AvatarFallback>
        </Avatar>
        <span className="font-medium text-foreground">{ticket.requester_email}</span>
      </div>
    </div>
  );
};

export default TicketHeader;