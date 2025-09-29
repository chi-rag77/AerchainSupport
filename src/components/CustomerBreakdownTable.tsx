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
  const getStatusColorClass = (count: number, type: 'open' | 'resolved' | 'pending' | 'bugs' | 'otherActive') => {
    if (count === 0) return 'text-muted-foreground';
    switch (type) {
      case 'open':
        return 'text-red-600 dark:text-red-400 font-semibold';
      case 'resolved':
        return 'text-green-600 dark:text-green-400 font-semibold';
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400 font-semibold';
      case 'bugs':
        return 'text-purple-600 dark:text-purple-400 font-semibold';
      case 'otherActive':
        return 'text-blue-600 dark:text-blue-400 font-semibold';
      default:
        return 'text-foreground font-semibold';
    }
  };

  return (
    <div className="rounded-lg overflow-hidden shadow-md w-full bg-white dark:bg-gray-800 border border-border">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-700">
          {/* First header row: Customer and an empty cell spanning the metric columns */}
          <TableRow>
            <TableHead className="py-2 whitespace-nowrap text-foreground">Customer</TableHead>
            <TableHead colSpan={6} className="py-2"></TableHead> {/* Empty cell spanning 6 metric columns */}
          </TableRow>
          {/* Second header row: Individual metric headers */}
          <TableRow>
            <TableHead className="py-2"></TableHead> {/* Empty cell to align with Customer column */}
            <TableHead className="py-2 text-center whitespace-nowrap flex items-center justify-center text-foreground"><Users className="h-4 w-4 mr-1" /> Total</TableHead>
            <TableHead className="py-2 text-center whitespace-nowrap flex items-center justify-center text-foreground"><CheckCircle className="h-4 w-4 mr-1 text-green-500" /> Resolved</TableHead>
            <TableHead className="py-2 text-center whitespace-nowrap flex items-center justify-center text-foreground"><Hourglass className="h-4 w-4 mr-1 text-red-500" /> Open</TableHead>
            <TableHead className="py-2 text-center whitespace-nowrap flex items-center justify-center text-foreground"><ShieldAlert className="h-4 w-4 mr-1 text-yellow-500" /> Pending Tech</TableHead>
            <TableHead className="py-2 text-center whitespace-nowrap flex items-center justify-center text-foreground"><MessageSquare className="h-4 w-4 mr-1 text-blue-500" /> Other Active</TableHead>
            <TableHead className="py-2 text-center whitespace-nowrap flex items-center justify-center text-foreground"><Bug className="h-4 w-4 mr-1 text-purple-500" /> Bugs (Type)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((row, index) => (
              <TableRow 
                key={row.name} 
                className={cn(
                  "transition-all duration-200 ease-in-out hover:bg-gray-50 dark:hover:bg-gray-700",
                  index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750',
                  row.name === "Grand Total" ? "font-bold bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600" : ""
                )}
              >
                <TableCell className={cn("font-medium py-3", row.name === "Grand Total" ? "text-primary dark:text-primary-foreground" : "")}>{row.name}</TableCell>
                <TableCell className="py-3 text-center font-bold">{row.totalToday}</TableCell>
                <TableCell className={cn("py-3 text-center", getStatusColorClass(row.resolvedToday, 'resolved'))}>{row.resolvedToday}</TableCell>
                <TableCell className={cn("py-3 text-center", getStatusColorClass(row.open, 'open'))}>{row.open}</TableCell>
                <TableCell className={cn("py-3 text-center", getStatusColorClass(row.pendingTech, 'pending'))}>{row.pendingTech}</TableCell>
                <TableCell className={cn("py-3 text-center", getStatusColorClass(row.otherActive, 'otherActive'))}>{row.otherActive}</TableCell>
                <TableCell className={cn("py-3 text-center", getStatusColorClass(row.bugs, 'bugs'))}>{row.bugs}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-gray-500 dark:text-gray-400 py-3">
                No customer breakdown data found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CustomerBreakdownTable;