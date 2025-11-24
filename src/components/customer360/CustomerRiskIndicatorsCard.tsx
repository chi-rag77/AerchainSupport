"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket } from '@/types';
import { cn } from '@/lib/utils';
import { AlertTriangle, Clock, CalendarX, ListOrdered, ArrowRight, BellRing } from 'lucide-react'; // Added BellRing
import { differenceInDays, parseISO, isPast, format } from 'date-fns';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface CustomerRiskIndicatorsCardProps {
  customerName: string;
  tickets: Ticket[];
  onViewTicketDetails: (ticket: Ticket) => void;
}

const CustomerRiskIndicatorsCard = ({ customerName, tickets, onViewTicketDetails }: CustomerRiskIndicatorsCardProps) => {
  const now = useMemo(() => new Date(), []);

  const riskMetrics = useMemo(() => {
    if (!tickets || tickets.length === 0) {
      return {
        overdueTicketsCount: 0,
        longOpenTicketsCount: 0,
        oldestOpenTickets: [],
      };
    }

    const openTickets = tickets.filter(t => t.status.toLowerCase() !== 'resolved' && t.status.toLowerCase() !== 'closed');

    const overdueTicketsCount = openTickets.filter(t => t.due_by && isPast(parseISO(t.due_by!))).length;

    const longOpenTicketsCount = openTickets.filter(t => differenceInDays(now, parseISO(t.created_at)) >= 7).length;

    const oldestOpenTickets = openTickets
      .sort((a, b) => parseISO(a.created_at).getTime() - parseISO(b.created_at).getTime())
      .slice(0, 5);

    return {
      overdueTicketsCount,
      longOpenTicketsCount,
      oldestOpenTickets,
    };
  }, [tickets, now]);

  return (
    <Card className="relative overflow-hidden group transition-all duration-300 hover:shadow-lg hover:scale-[1.02] h-full bg-card border border-border shadow-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" /> Risk Indicators
        </CardTitle>
        <Badge variant="secondary" className="text-sm font-semibold bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          {customerName}
        </Badge>
      </CardHeader>
      <CardContent className="text-sm space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Overdue Tickets */}
          <div className="flex flex-col p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-border shadow-inner">
            <span className="text-muted-foreground flex items-center gap-1 mb-2 font-medium">
              <CalendarX className="h-4 w-4 text-orange-500" /> Overdue Tickets:
            </span>
            <span className="text-3xl font-bold text-red-500">{riskMetrics.overdueTicketsCount}</span>
          </div>

          {/* Long Open Tickets */}
          <div className="flex flex-col p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-border shadow-inner">
            <span className="text-muted-foreground flex items-center gap-1 mb-2 font-medium">
              <Clock className="h-4 w-4 text-yellow-500" /> Long Open Tickets (7+ days):
            </span>
            <span className="text-3xl font-bold text-orange-500">{riskMetrics.longOpenTicketsCount}</span>
          </div>
        </div>

        {/* Oldest Open Tickets List */}
        {riskMetrics.oldestOpenTickets.length > 0 && (
          <>
            <Separator />
            <div className="mt-4 pt-3">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <BellRing className="h-4 w-4 text-muted-foreground" /> Oldest Open Tickets:
              </h4>
              <ul className="space-y-3">
                {riskMetrics.oldestOpenTickets.map(ticket => (
                  <li key={ticket.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-border shadow-sm">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="flex-grow truncate text-foreground font-medium text-base">
                          {ticket.subject}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>{ticket.subject}</TooltipContent>
                    </Tooltip>
                    <div className="flex items-center gap-2 ml-2">
                      <Badge variant="outline" className="text-xs px-2 py-1">
                        {differenceInDays(now, parseISO(ticket.created_at))} days old
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={() => onViewTicketDetails(ticket)} className="h-7 px-2 text-blue-600 hover:text-blue-700">
                        View <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerRiskIndicatorsCard;