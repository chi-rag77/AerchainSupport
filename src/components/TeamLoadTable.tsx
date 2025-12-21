"use client";

import React, { useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Ticket } from '@/types';
import { differenceInHours, parseISO } from 'date-fns';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { User, AlertCircle, Clock, TrendingUp, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from "@/components/ui/badge";

interface TeamLoadTableProps {
  tickets: Ticket[];
}

const TeamLoadTable = ({ tickets }: TeamLoadTableProps) => {
  const teamLoadData = useMemo(() => {
    if (!tickets || tickets.length === 0) return [];

    const agentMap = new Map<string, {
      assignee: string;
      openTickets: number;
      urgentTickets: number;
      totalAgeHours: number;
      ticketCountForAge: number;
    }>();

    const now = new Date();

    tickets.forEach(ticket => {
      const assignee = ticket.assignee || 'Unassigned';
      if (!agentMap.has(assignee)) {
        agentMap.set(assignee, {
          assignee,
          openTickets: 0,
          urgentTickets: 0,
          totalAgeHours: 0,
          ticketCountForAge: 0,
        });
      }
      const agentData = agentMap.get(assignee)!;

      const statusLower = ticket.status.toLowerCase();
      if (statusLower !== 'resolved' && statusLower !== 'closed') {
        agentData.openTickets++;
        if (ticket.priority.toLowerCase() === 'urgent') {
          agentData.urgentTickets++;
        }
        const createdAt = parseISO(ticket.created_at);
        agentData.totalAgeHours += differenceInHours(now, createdAt);
        agentData.ticketCountForAge++;
      }
    });

    return Array.from(agentMap.values()).map(data => {
      const avgTicketAgeHours = data.ticketCountForAge > 0 ? (data.totalAgeHours / data.ticketCountForAge) : 0;
      let avgTicketAge: string;
      if (avgTicketAgeHours < 24) {
        avgTicketAge = `${avgTicketAgeHours.toFixed(1)} hrs`;
      } else {
        avgTicketAge = `${(avgTicketAgeHours / 24).toFixed(1)} days`;
      }

      // Capacity Indicator Logic
      let capacityStatus: 'Normal' | 'At Risk' | 'Overloaded';
      let capacityBadgeClass: string;
      
      if (data.openTickets > 20) {
        capacityStatus = 'Overloaded';
        capacityBadgeClass = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      } else if (data.openTickets > 10) {
        capacityStatus = 'At Risk';
        capacityBadgeClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      } else {
        capacityStatus = 'Normal';
        capacityBadgeClass = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      }

      return {
        assignee: data.assignee,
        openTickets: data.openTickets,
        urgentTickets: data.urgentTickets,
        avgTicketAge,
        capacityStatus,
        capacityBadgeClass,
      };
    }).sort((a, b) => b.openTickets - a.openTickets); // Sort by open tickets descending
  }, [tickets]);

  const getCapacityIcon = (status: string) => {
    switch (status) {
      case 'Overloaded': return <AlertCircle className="h-3 w-3 mr-1" />;
      case 'At Risk': return <TrendingUp className="h-3 w-3 mr-1" />;
      case 'Normal': return <CheckCircle className="h-3 w-3 mr-1" />;
      default: return null;
    }
  };

  return (
    <div className="w-full flex flex-col h-full">
      <div className="flex-grow overflow-y-auto">
        <Table className="min-w-full">
          <TableHeader className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-700">
            <TableRow>
              <TableHead className="py-2 whitespace-nowrap">Assignee</TableHead>
              <TableHead className="py-2 text-center whitespace-nowrap">Capacity</TableHead>
              <TableHead className="py-2 text-center whitespace-nowrap">Open Tickets</TableHead>
              <TableHead className="py-2 text-center whitespace-nowrap">Urgent Tickets</TableHead>
              <TableHead className="py-2 text-right whitespace-nowrap">Avg. Ticket Age</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teamLoadData.length > 0 ? (
              teamLoadData.map((data, index) => (
                <TableRow
                  key={data.assignee}
                  className={cn(
                    "transition-all duration-200 ease-in-out hover:bg-gray-50 dark:hover:bg-gray-700",
                    index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'
                  )}
                >
                  <TableCell className="font-medium py-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center">
                          {data.assignee !== "Unassigned" ? (
                            <>
                              <Avatar className="h-6 w-6 mr-2 border border-gray-200 dark:border-gray-600 shadow-sm">
                                <AvatarFallback className="text-xs bg-gray-200 dark:bg-gray-700">
                                  {data.assignee.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              {data.assignee}
                            </>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400">Unassigned</span>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {data.assignee}
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell className="py-2 text-center">
                    <Badge className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold", data.capacityBadgeClass)}>
                      {getCapacityIcon(data.capacityStatus)}
                      {data.capacityStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-2 text-center font-semibold text-blue-600 dark:text-blue-400">
                    {data.openTickets}
                  </TableCell>
                  <TableCell className="py-2 text-center">
                    <Badge variant="destructive" className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold",
                      data.urgentTickets > 0 ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                    )}>
                      <AlertCircle className="h-3 w-3 mr-1" /> {data.urgentTickets}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-2 text-right text-foreground">
                    {data.avgTicketAge}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-gray-500 dark:text-gray-400 py-3">
                  No team load data found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TeamLoadTable;