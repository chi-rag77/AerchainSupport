"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from '@/lib/utils';
import { TicketIcon, Hourglass, CheckCircle, Bug, Clock, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface DashboardSummaryCardProps {
  totalTickets: number;
  totalOpenTicketsOverall: number;
  openTickets: number;
  resolvedThisPeriod: number;
  bugsReceived: number;
  dateRangeDisplay: string;
  className?: string;
}

const DashboardSummaryCard = ({
  totalTickets,
  totalOpenTicketsOverall,
  openTickets,
  resolvedThisPeriod,
  bugsReceived,
  dateRangeDisplay,
  className,
}: DashboardSummaryCardProps) => {
  return (
    <Card className={cn("relative overflow-hidden group transition-all duration-300 hover:shadow-lg hover:scale-[1.02] h-full col-span-full lg:col-span-2", className)}>
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-teal-500/10 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center">
          <Info className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
          Summary ({dateRangeDisplay})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground flex items-center"><TicketIcon className="h-4 w-4 mr-1 text-blue-500" /> Total Tickets:</span>
          <span className="font-bold text-lg text-foreground">{totalTickets}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground flex items-center"><Clock className="h-4 w-4 mr-1 text-gray-500" /> Total Open (Overall):</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="font-semibold text-foreground cursor-help">{totalOpenTicketsOverall}</span>
            </TooltipTrigger>
            <TooltipContent>Total open tickets across all time, regardless of the selected date filter.</TooltipContent>
          </Tooltip>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground flex items-center"><Hourglass className="h-4 w-4 mr-1 text-orange-500" /> Open (This Period):</span>
          <span className="font-semibold text-orange-600 dark:text-orange-400">{openTickets}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground flex items-center"><CheckCircle className="h-4 w-4 mr-1 text-green-500" /> Resolved (This Period):</span>
          <span className="font-semibold text-green-600 dark:text-green-400">{resolvedThisPeriod}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground flex items-center"><Bug className="h-4 w-4 mr-1 text-purple-500" /> Bugs (This Period):</span>
          <span className="font-semibold text-purple-600 dark:text-purple-400">{bugsReceived}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardSummaryCard;