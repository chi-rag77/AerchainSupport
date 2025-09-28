"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';
import { CustomerBreakdownRow } from '@/types';
import { Bug, CheckCircle, Hourglass, MessageSquare, ShieldAlert, Users } from 'lucide-react'; // Added Users import

interface CustomerBreakdownCardProps {
  customerData: CustomerBreakdownRow;
  isGrandTotal?: boolean;
}

const CustomerBreakdownCard = ({ customerData, isGrandTotal = false }: CustomerBreakdownCardProps) => {
  const { name, totalToday, resolvedToday, open, pendingTech, bugs, otherActive } = customerData;

  const openTicketsHighlight = open > 10 ? 'bg-red-50/50 dark:bg-red-950/30' : '';
  const bugsHighlight = bugs > 0 ? 'bg-red-50/50 dark:bg-red-950/30' : '';

  const getStatusColorClass = (count: number, type: 'open' | 'resolved' | 'pending' | 'bugs' | 'otherActive') => {
    if (count === 0) return 'text-muted-foreground';
    switch (type) {
      case 'open':
        return 'text-red-600 dark:text-red-400';
      case 'resolved':
        return 'text-green-600 dark:text-green-400';
      case 'pending': // This is for pendingTech
        return 'text-yellow-600 dark:text-yellow-400';
      case 'bugs':
        return 'text-red-600 dark:text-red-400';
      case 'otherActive':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-foreground';
    }
  };

  return (
    <Card className={cn(
      "relative overflow-hidden group transition-all duration-300 hover:shadow-lg hover:scale-[1.02] h-full",
      isGrandTotal ? "border-2 border-primary dark:border-primary" : ""
    )}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={cn("text-lg font-semibold", isGrandTotal ? "text-primary dark:text-primary-foreground" : "text-foreground")}>
          {isGrandTotal ? "Grand Total" : name}
        </CardTitle>
        {!isGrandTotal && <Users className="h-5 w-5 text-muted-foreground" />}
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Total Tickets:</span>
          <span className="font-bold text-lg text-foreground">{totalToday}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground flex items-center"><CheckCircle className="h-4 w-4 mr-1 text-green-500" /> Resolved:</span>
          <span className={cn("font-semibold", getStatusColorClass(resolvedToday, 'resolved'))}>{resolvedToday}</span>
        </div>
        <div className={cn("flex justify-between items-center rounded-md px-2 py-1 -mx-2", openTicketsHighlight)}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-muted-foreground flex items-center"><Hourglass className="h-4 w-4 mr-1 text-red-500" /> Open:</span>
            </TooltipTrigger>
            <TooltipContent>Tickets currently in 'Open' status. Highlighted if more than 10.</TooltipContent>
          </Tooltip>
          <span className={cn("font-semibold", getStatusColorClass(open, 'open'))}>{open}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground flex items-center"><ShieldAlert className="h-4 w-4 mr-1 text-yellow-500" /> Pending Tech:</span>
          <span className={cn("font-semibold", getStatusColorClass(pendingTech, 'pending'))}>{pendingTech}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground flex items-center"><MessageSquare className="h-4 w-4 mr-1 text-blue-500" /> Other Active:</span>
          <span className={cn("font-semibold", getStatusColorClass(otherActive, 'otherActive'))}>{otherActive}</span>
        </div>
        <div className={cn("flex justify-between items-center rounded-md px-2 py-1 -mx-2", bugsHighlight)}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-muted-foreground flex items-center"><Bug className="h-4 w-4 mr-1 text-purple-500" /> Bugs (Type):</span>
            </TooltipTrigger>
            <TooltipContent>Tickets categorized as bugs. This is a type count and not part of the status sum.</TooltipContent>
          </Tooltip>
          <span className={cn("font-semibold", getStatusColorClass(bugs, 'bugs'))}>{bugs}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerBreakdownCard;