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
import { CustomerBreakdownRow } from '@/types';
import { cn } from '@/lib/utils';
import { Bug, CheckCircle, Hourglass, MessageSquare, ShieldAlert, Users } from 'lucide-react';

interface CustomerBreakdownTableProps {
  data: CustomerBreakdownRow[];
}

const CustomerBreakdownTable = ({ data }: CustomerBreakdownTableProps) => {
  const getStatusColorClass = (count: number, type: string) => {
    if (count === 0) return 'text-muted-foreground';
    switch (type) {
      case 'open':
        return 'text-red-600 dark:text-red-400 font-semibold';
      case 'resolved':
        return 'text-green-600 dark:text-green-400 font-semibold';
      case 'pending': // This is for pendingTech
        return 'text-yellow-600 dark:text-yellow-400 font-semibold';
      case 'bugs':
        return 'text-purple-600 dark:text-purple-400 font-semibold';
      case 'otherActive':
        return 'text-blue-600 dark:text-blue-400 font-semibold';
      case 'font-bold': // For totalInPeriod, which is just bold
        return 'text-foreground font-bold';
      default:
        return 'text-foreground font-semibold';
    }
  };

  // Define the metrics that will be displayed as rows
  const metricDefinitions = [
    { key: 'totalInPeriod', label: 'Total Tickets', icon: <Users className="h-4 w-4 mr-1" />, colorClass: 'font-bold' },
    { key: 'resolvedInPeriod', label: 'Resolved', icon: <CheckCircle className="h-4 w-4 mr-1 text-green-500" />, colorClass: 'resolved' },
    { key: 'open', label: 'Open', icon: <Hourglass className="h-4 w-4 mr-1 text-red-500" />, colorClass: 'open' },
    { key: 'pendingTech', label: 'Pending Tech', icon: <ShieldAlert className="h-4 w-4 mr-1 text-yellow-500" />, colorClass: 'pending' },
    { key: 'otherActive', label: 'Other Active', icon: <MessageSquare className="h-4 w-4 mr-1 text-blue-500" />, colorClass: 'otherActive' },
    { key: 'bugs', label: 'Bugs (Type)', icon: <Bug className="h-4 w-4 mr-1 text-purple-500" />, colorClass: 'bugs' },
  ];

  // Separate customer data from the grand total
  const customerDataRows = data.filter(row => row.name !== "Grand Total");
  const grandTotalRow = data.find(row => row.name === "Grand Total");

  // Get unique customer names for column headers
  const customerNames = customerDataRows.map(row => row.name);

  return (
    <div className="rounded-lg overflow-hidden shadow-md w-full bg-card border border-border">
      <Table>
        <TableHeader className="bg-muted/50 dark:bg-muted/30">
          <TableRow className="hover:bg-transparent"> {/* Prevent hover effect on header row */}
            {/* Empty cell for the top-left corner */}
            <TableHead className="py-3"></TableHead> 
            {/* Customer names as column headers */}
            {customerNames.map(customerName => (
              <TableHead key={customerName} className="py-3 text-center whitespace-nowrap text-foreground font-semibold">
                {customerName}
              </TableHead>
            ))}
            {/* Grand Total column header */}
            {grandTotalRow && (
              <TableHead className="py-3 text-center whitespace-nowrap text-primary dark:text-primary-foreground font-bold">
                Grand Total
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {metricDefinitions.map((metricDef, metricIndex) => (
            <TableRow 
              key={metricDef.key} 
              className={cn(
                "transition-all duration-200 ease-in-out hover:bg-accent/50", // Subtle hover
                metricIndex % 2 === 0 ? 'bg-background' : 'bg-muted/20' // Alternating row colors
              )}
            >
              {/* Metric label as the first cell in each row */}
              <TableCell className="py-3 font-medium flex items-center whitespace-nowrap text-foreground">
                {metricDef.icon} {metricDef.label}
              </TableCell>
              {/* Data cells for each customer */}
              {customerDataRows.map(customerRow => (
                <TableCell 
                  key={`${metricDef.key}-${customerRow.name}`} 
                  className={cn(
                    "py-3 text-center", 
                    getStatusColorClass(customerRow[metricDef.key as keyof CustomerBreakdownRow] as number, metricDef.colorClass)
                  )}
                >
                  {customerRow[metricDef.key as keyof CustomerBreakdownRow] as number}
                </TableCell>
              ))}
              {/* Data cell for Grand Total */}
              {grandTotalRow && (
                <TableCell 
                  className={cn(
                    "py-3 text-center font-bold text-primary dark:text-primary-foreground", 
                    getStatusColorClass(grandTotalRow[metricDef.key as keyof CustomerBreakdownRow] as number, metricDef.colorClass)
                  )}
                >
                  {grandTotalRow[metricDef.key as keyof CustomerBreakdownRow] as number}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CustomerBreakdownTable;