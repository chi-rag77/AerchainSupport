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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface CustomerBreakdownRow {
  name: string;
  totalToday: number;
  resolvedToday: number;
  open: number;
  pendingTech: number;
  bugs: number;
  tasks: number;
  queries: number;
}

interface CustomerBreakdownTableProps {
  data: CustomerBreakdownRow[];
}

const CustomerBreakdownTable = ({ data }: CustomerBreakdownTableProps) => {
  return (
    <div className="rounded-lg overflow-hidden shadow-md w-full bg-white dark:bg-gray-800">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-700">
          <TableRow>
            <TableHead className="py-3 whitespace-nowrap">Customer</TableHead>
            <TableHead className="py-3 text-right whitespace-nowrap">Total Today</TableHead>
            <TableHead className="py-3 text-right whitespace-nowrap">Resolved Today</TableHead>
            <TableHead className="py-3 text-right whitespace-nowrap">Open</TableHead>
            <TableHead className="py-3 text-right whitespace-nowrap">Pending Tech</TableHead>
            <TableHead className="py-3 text-right whitespace-nowrap">Bugs</TableHead>
            <TableHead className="py-3 text-right whitespace-nowrap">Tasks</TableHead>
            <TableHead className="py-3 text-right whitespace-nowrap">Queries</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((row, index) => (
              <TableRow 
                key={row.name} 
                className={`transition-all duration-200 ease-in-out hover:bg-gray-50 dark:hover:bg-gray-700 
                  ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'} 
                `}
              >
                <TableCell className="font-medium py-3">{row.name}</TableCell>
                <TableCell className="py-3 text-right">{row.totalToday}</TableCell>
                <TableCell className="py-3 text-right">{row.resolvedToday}</TableCell>
                <TableCell className="py-3 text-right">{row.open}</TableCell>
                <TableCell className="py-3 text-right">{row.pendingTech}</TableCell>
                <TableCell className="py-3 text-right">{row.bugs}</TableCell>
                <TableCell className="py-3 text-right">{row.tasks}</TableCell>
                <TableCell className="py-3 text-right">{row.queries}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center text-gray-500 dark:text-gray-400 py-3">
                No customer breakdown data for the selected date and filters.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CustomerBreakdownTable;