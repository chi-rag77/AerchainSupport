"use client";

import React from 'react';
import { Ticket } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { User, CalendarDays, Clock, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TicketMetadataCardsProps {
  ticket: Ticket;
}

const TicketMetadataCards = ({ ticket }: TicketMetadataCardsProps) => {
  return (
    <div className="grid grid-cols-2 gap-3 p-6 pt-4">
      <Card className="bg-white/60 backdrop-blur-sm border border-gray-100 shadow-sm rounded-xl">
        <CardHeader className="p-3 pb-1 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-xs font-medium text-muted-foreground">Requester</CardTitle>
          <User className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <p className="text-sm font-semibold text-foreground leading-tight">{ticket.requester_email}</p>
          {ticket.cf_company && <p className="text-xs text-muted-foreground">{ticket.cf_company}</p>}
        </CardContent>
      </Card>

      <Card className="bg-white/60 backdrop-blur-sm border border-gray-100 shadow-sm rounded-xl">
        <CardHeader className="p-3 pb-1 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-xs font-medium text-muted-foreground">Created</CardTitle>
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <p className="text-sm font-semibold text-foreground leading-tight">{format(new Date(ticket.created_at), 'MMM dd, yyyy')}</p>
          <p className="text-xs text-muted-foreground">{format(new Date(ticket.created_at), 'hh:mm a')}</p>
        </CardContent>
      </Card>

      <Card className="bg-white/60 backdrop-blur-sm border border-gray-100 shadow-sm rounded-xl">
        <CardHeader className="p-3 pb-1 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-xs font-medium text-muted-foreground">Last Updated</CardTitle>
          <RefreshCw className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <p className="text-sm font-semibold text-foreground leading-tight">{format(new Date(ticket.updated_at), 'MMM dd, yyyy')}</p>
          <p className="text-xs text-muted-foreground">{format(new Date(ticket.updated_at), 'hh:mm a')}</p>
        </CardContent>
      </Card>

      <Card className={cn(
        "bg-white/60 backdrop-blur-sm border border-gray-100 shadow-sm rounded-xl",
        ticket.due_by && new Date(ticket.due_by) < new Date() ? "border-red-300 bg-red-50/60" : ""
      )}>
        <CardHeader className="p-3 pb-1 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-xs font-medium text-muted-foreground">Due By</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-3 pt-0">
          {ticket.due_by ? (
            <>
              <p className={cn(
                "text-sm font-semibold text-foreground leading-tight",
                new Date(ticket.due_by) < new Date() ? "text-red-600 dark:text-red-400" : ""
              )}>
                {format(new Date(ticket.due_by), 'MMM dd, yyyy')}
              </p>
              <p className={cn(
                "text-xs text-muted-foreground",
                new Date(ticket.due_by) < new Date() ? "text-red-500 dark:text-red-300" : ""
              )}>
                {format(new Date(ticket.due_by), 'hh:mm a')}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">N/A</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TicketMetadataCards;