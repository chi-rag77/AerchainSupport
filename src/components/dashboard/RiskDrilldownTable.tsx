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
import { RiskTicket } from '@/features/active-risk/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Brain, ShieldAlert, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RiskDrilldownTableProps {
  tickets: RiskTicket[];
  onViewTicket: (ticket: RiskTicket) => void;
}

const RiskDrilldownTable = ({ tickets, onViewTicket }: RiskDrilldownTableProps) => {
  if (tickets.length === 0) {
    return (
      <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-[24px] border border-dashed border-gray-200">
        <p className="text-muted-foreground font-medium">No tickets found for this risk category.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-[24px] shadow-glass overflow-hidden border border-gray-100 dark:border-gray-700">
      <Table>
        <TableHeader className="bg-gray-50/50 dark:bg-gray-900/50">
          <TableRow>
            <TableHead className="font-bold text-xs uppercase tracking-widest">Ticket ID</TableHead>
            <TableHead className="font-bold text-xs uppercase tracking-widest">Company</TableHead>
            <TableHead className="font-bold text-xs uppercase tracking-widest">Risk Reason</TableHead>
            <TableHead className="font-bold text-xs uppercase tracking-widest">SLA Status</TableHead>
            <TableHead className="font-bold text-xs uppercase tracking-widest">AI Suggested Action</TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket) => (
            <TableRow key={ticket.id} className="group hover:bg-blue-50/30 dark:hover:bg-blue-950/10 transition-colors">
              <TableCell className="font-bold text-blue-600 dark:text-blue-400">#{ticket.id}</TableCell>
              <TableCell className="font-semibold">{ticket.cf_company || 'N/A'}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                  <span className="text-sm font-medium">{ticket.riskReason}</span>
                </div>
              </TableCell>
              <TableCell>
                {ticket.slaRemainingPercent !== undefined ? (
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full",
                          ticket.slaRemainingPercent < 10 ? "bg-red-500" : "bg-amber-500"
                        )}
                        style={{ width: `${ticket.slaRemainingPercent}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold">{ticket.slaRemainingPercent}%</span>
                  </div>
                ) : (
                  <Badge variant="outline" className="text-[10px] font-bold uppercase">N/A</Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/50">
                  <Sparkles className="h-3 w-3 text-purple-500 shrink-0 mt-0.5" />
                  <span className="text-xs font-medium text-purple-900 dark:text-purple-200 leading-tight">
                    {ticket.suggestedAction}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onViewTicket(ticket)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity font-bold text-xs gap-1"
                >
                  Resolve <ArrowRight className="h-3 w-3" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RiskDrilldownTable;