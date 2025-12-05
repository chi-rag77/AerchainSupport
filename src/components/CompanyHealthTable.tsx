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
import { differenceInMinutes, parseISO, isPast } from 'date-fns';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle, AlertCircle, Clock, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from "@/components/ui/progress";

interface CompanyHealthTableProps {
  tickets: Ticket[];
}

const CompanyHealthTable = ({ tickets }: CompanyHealthTableProps) => {
  const companyHealthData = useMemo(() => {
    if (!tickets || tickets.length === 0) return [];

    const companyMap = new Map<string, {
      company: string;
      openTickets: number;
      overdueTickets: number;
      resolvedTickets: Ticket[];
      slaMetCount: number;
      slaTotalCount: number;
    }>();

    const now = new Date();

    tickets.forEach(ticket => {
      const company = ticket.cf_company || 'Unknown Company';
      if (!companyMap.has(company)) {
        companyMap.set(company, {
          company,
          openTickets: 0,
          overdueTickets: 0,
          resolvedTickets: [],
          slaMetCount: 0,
          slaTotalCount: 0,
        });
      }
      const companyData = companyMap.get(company)!;

      const statusLower = ticket.status.toLowerCase();
      const isResolvedOrClosed = statusLower === 'resolved' || statusLower === 'closed';

      if (!isResolvedOrClosed) {
        companyData.openTickets++;
        if (ticket.due_by && isPast(parseISO(ticket.due_by))) {
          companyData.overdueTickets++;
        }
      } else {
        companyData.resolvedTickets.push(ticket);
        if (ticket.due_by) {
          companyData.slaTotalCount++;
          if (parseISO(ticket.updated_at) <= parseISO(ticket.due_by)) {
            companyData.slaMetCount++;
          }
        }
      }
    });

    return Array.from(companyMap.values()).map(data => {
      // Calculate Avg/Median Resolution Time
      let avgResolutionTime: string = "N/A";
      let medianResolutionTime: string = "N/A";
      if (data.resolvedTickets.length > 0) {
        const resolutionTimesMinutes = data.resolvedTickets.map(t =>
          differenceInMinutes(parseISO(t.updated_at), parseISO(t.created_at))
        ).sort((a, b) => a - b);

        const totalMinutes = resolutionTimesMinutes.reduce((sum, time) => sum + time, 0);
        avgResolutionTime = (totalMinutes / data.resolvedTickets.length / 60).toFixed(1) + " hrs";

        const mid = Math.floor(resolutionTimesMinutes.length / 2);
        medianResolutionTime = (resolutionTimesMinutes.length % 2 === 0
          ? (resolutionTimesMinutes[mid - 1] + resolutionTimesMinutes[mid]) / 2
          : resolutionTimesMinutes[mid]) / 60;
        medianResolutionTime = medianResolutionTime.toFixed(1) + " hrs";
      }

      // Calculate SLA Met %
      const slaMetPercentage = data.slaTotalCount > 0 ? (data.slaMetCount / data.slaTotalCount) * 100 : 100;

      return {
        company: data.company,
        openTickets: data.openTickets,
        overdueTickets: data.overdueTickets,
        avgResolutionTime,
        medianResolutionTime,
        slaMetPercentage: parseFloat(slaMetPercentage.toFixed(1)),
      };
    }).sort((a, b) => b.openTickets - a.openTickets); // Sort by open tickets descending
  }, [tickets]);

  const getSlaColor = (percentage: number) => {
    if (percentage >= 90) return "bg-green-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="w-full flex flex-col h-full">
      <div className="flex-grow overflow-y-auto">
        <Table className="min-w-full">
          <TableHeader className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-700">
            <TableRow>
              <TableHead className="py-2 whitespace-nowrap">Company</TableHead>
              <TableHead className="py-2 text-center whitespace-nowrap">Open Tickets</TableHead>
              <TableHead className="py-2 text-center whitespace-nowrap">Overdue Tickets</TableHead>
              <TableHead className="py-2 text-center whitespace-nowrap">Avg. Resolution Time</TableHead>
              <TableHead className="py-2 text-center whitespace-nowrap">SLA Met %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companyHealthData.length > 0 ? (
              companyHealthData.map((data, index) => (
                <TableRow
                  key={data.company}
                  className={cn(
                    "transition-all duration-200 ease-in-out hover:bg-gray-50 dark:hover:bg-gray-700",
                    index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'
                  )}
                >
                  <TableCell className="font-medium py-2">{data.company}</TableCell>
                  <TableCell className="py-2 text-center font-semibold text-blue-600 dark:text-blue-400">
                    {data.openTickets}
                  </TableCell>
                  <TableCell className="py-2 text-center font-semibold text-red-600 dark:text-red-400">
                    {data.overdueTickets}
                  </TableCell>
                  <TableCell className="py-2 text-center text-foreground">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>{data.avgResolutionTime}</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        Median: {data.medianResolutionTime}
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell className="py-2 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-semibold text-foreground">{data.slaMetPercentage}%</span>
                      <Progress value={data.slaMetPercentage} className="w-24 h-2" indicatorClassName={getSlaColor(data.slaMetPercentage)} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-gray-500 dark:text-gray-400 py-3">
                  No company health data found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CompanyHealthTable;