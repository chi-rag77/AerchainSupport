"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';
import { Users, TicketIcon, Hourglass, CheckCircle, Bug, MessageSquare, GitFork } from 'lucide-react';

interface WeeklySupportSummaryData {
  customerName: string;
  metrics: {
    ticketsCreatedThisWeek: number;
    ticketsResolvedThisWeek: number;
    stillOpenFromThisWeek: number;
    totalOpenIncludingPrevious: number;
  };
  ticketMix: {
    bug: { count: number; percentage: number };
    query: { count: number; percentage: number };
    taskChange: { count: number; percentage: number };
  };
}

interface WeeklySupportSummaryCardProps {
  data: WeeklySupportSummaryData;
}

const WeeklySupportSummaryCard = ({ data }: WeeklySupportSummaryCardProps) => {
  const { customerName, metrics, ticketMix } = data;

  const getMetricBadge = (value: number, isWarning: boolean = false) => (
    <Badge
      variant="secondary"
      className={cn(
        "px-2 py-0.5 text-sm font-semibold min-w-[40px] justify-center",
        isWarning
          ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
      )}
    >
      {value}
    </Badge>
  );

  const getTicketMixBadge = (type: 'bug' | 'query' | 'taskChange', count: number) => {
    let colorClasses = "";
    let IconComponent: React.ElementType = Bug; // Default icon

    switch (type) {
      case 'bug':
        colorClasses = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
        IconComponent = Bug;
        break;
      case 'query':
        colorClasses = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
        IconComponent = MessageSquare;
        break;
      case 'taskChange':
        colorClasses = "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
        IconComponent = GitFork; // Using GitFork for Task/Change
        break;
    }

    return (
      <Badge
        variant="secondary"
        className={cn(
          "px-2 py-0.5 text-sm font-semibold min-w-[40px] justify-center flex items-center gap-1",
          colorClasses
        )}
      >
        <IconComponent className="h-3 w-3" /> {count}
      </Badge>
    );
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white dark:bg-card rounded-xl shadow-md border border-gray-200 dark:border-border overflow-hidden">
      <CardHeader className="px-6 py-4 border-b border-gray-100 dark:border-border">
        <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" /> Weekly Support Summary
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">For: <span className="font-semibold">{customerName}</span></p>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-gray-700">
            <TableRow>
              <TableHead className="text-left text-gray-600 dark:text-gray-400 font-medium px-4 py-2">Metric / Type</TableHead>
              <TableHead className="text-right text-gray-600 dark:text-gray-400 font-medium px-4 py-2">Value / Count</TableHead>
              <TableHead className="text-right text-gray-600 dark:text-gray-400 font-medium px-4 py-2">% of Tickets</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Header Metrics */}
            <TableRow className="border-b border-gray-100 dark:border-border">
              <TableCell className="px-4 py-2 text-left text-foreground flex items-center gap-2">
                <TicketIcon className="h-4 w-4 text-blue-500" /> Tickets Created This Week
              </TableCell>
              <TableCell className="px-4 py-2 text-right">
                {getMetricBadge(metrics.ticketsCreatedThisWeek)}
              </TableCell>
              <TableCell className="px-4 py-2 text-right text-muted-foreground">—</TableCell>
            </TableRow>
            <TableRow className="border-b border-gray-100 dark:border-border">
              <TableCell className="px-4 py-2 text-left text-foreground flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" /> Tickets Resolved This Week
              </TableCell>
              <TableCell className="px-4 py-2 text-right">
                {getMetricBadge(metrics.ticketsResolvedThisWeek)}
              </TableCell>
              <TableCell className="px-4 py-2 text-right text-muted-foreground">—</TableCell>
            </TableRow>
            <TableRow className="border-b border-gray-100 dark:border-border">
              <TableCell className="px-4 py-2 text-left text-foreground flex items-center gap-2">
                <Hourglass className="h-4 w-4 text-amber-500" /> Still Open From This Week
              </TableCell>
              <TableCell className="px-4 py-2 text-right">
                {getMetricBadge(metrics.stillOpenFromThisWeek, true)}
              </TableCell>
              <TableCell className="px-4 py-2 text-right text-muted-foreground">—</TableCell>
            </TableRow>
            <TableRow className="border-b border-gray-100 dark:border-border">
              <TableCell className="px-4 py-2 text-left text-foreground flex items-center gap-2">
                <TicketIcon className="h-4 w-4 text-gray-500" /> Total Open (incl. previous)
              </TableCell>
              <TableCell className="px-4 py-2 text-right">
                {getMetricBadge(metrics.totalOpenIncludingPrevious)}
              </TableCell>
              <TableCell className="px-4 py-2 text-right text-muted-foreground">—</TableCell>
            </TableRow>

            {/* Section Header: Ticket Mix */}
            <TableRow className="bg-gray-100 dark:bg-gray-700">
              <TableCell colSpan={3} className="px-4 py-2 text-center text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wider text-xs">
                Ticket Mix
              </TableCell>
            </TableRow>

            {/* Ticket Mix Rows */}
            <TableRow className="border-b border-gray-100 dark:border-border">
              <TableCell className="px-4 py-2 text-left text-foreground">Bug</TableCell>
              <TableCell className="px-4 py-2 text-right">
                {getTicketMixBadge('bug', ticketMix.bug.count)}
              </TableCell>
              <TableCell className="px-4 py-2 text-right text-muted-foreground">
                {ticketMix.bug.percentage}%
              </TableCell>
            </TableRow>
            <TableRow className="border-b border-gray-100 dark:border-border">
              <TableCell className="px-4 py-2 text-left text-foreground">Query</TableCell>
              <TableCell className="px-4 py-2 text-right">
                {getTicketMixBadge('query', ticketMix.query.count)}
              </TableCell>
              <TableCell className="px-4 py-2 text-right text-muted-foreground">
                {ticketMix.query.percentage}%
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="px-4 py-2 text-left text-foreground">Task / Change</TableCell>
              <TableCell className="px-4 py-2 text-right">
                {getTicketMixBadge('taskChange', ticketMix.taskChange.count)}
              </TableCell>
              <TableCell className="px-4 py-2 text-right text-muted-foreground">
                {ticketMix.taskChange.percentage}%
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default WeeklySupportSummaryCard;