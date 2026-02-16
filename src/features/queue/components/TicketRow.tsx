"use client";

import React, { useState, useMemo } from 'react';
import { TableRow, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Brain, Sparkles, Clock, Building2, User, ArrowRight,
  TrendingUp, ShieldAlert
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNowStrict, parseISO, differenceInDays, isPast } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface TicketRowProps {
  ticket: any;
  isSelected: boolean;
  onToggleSelect: () => void;
  onClick: () => void;
}

const TicketRow = ({ ticket, isSelected, onToggleSelect, onClick }: TicketRowProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const { riskScore, ageDays } = useMemo(() => {
    const created = parseISO(ticket.created_at);
    const days = differenceInDays(new Date(), created);
    
    let score = 0;
    // Priority weight
    const p = ticket.priority.toLowerCase();
    if (p === 'urgent') score += 40;
    else if (p === 'high') score += 30;
    else if (p === 'medium') score += 20;
    else score += 10;

    // Age weight
    if (days > 7) score += 40;
    else if (days > 3) score += 20;

    // SLA weight
    if (ticket.due_by && isPast(parseISO(ticket.due_by))) score += 20;

    return { riskScore: Math.min(100, score), ageDays: days };
  }, [ticket]);

  const getStatusStyles = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('open')) return "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-100";
    if (s.includes('tech')) return "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-100";
    if (s.includes('escalated')) return "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-100 animate-pulse";
    return "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200";
  };

  const getRiskColor = (score: number) => {
    if (score > 75) return "text-red-600 dark:text-red-400";
    if (score > 40) return "text-amber-600 dark:text-amber-400";
    return "text-green-600 dark:text-green-400";
  };

  return (
    <>
      <TableRow 
        className={cn(
          "group transition-all duration-300 border-none hover:bg-indigo-50/30 dark:hover:bg-indigo-950/10",
          isSelected && "bg-indigo-50/50 dark:bg-indigo-950/20",
          isExpanded && "bg-white dark:bg-gray-800 shadow-md z-10 relative"
        )}
      >
        <TableCell className="w-12 pl-6">
          <Checkbox checked={isSelected} onCheckedChange={onToggleSelect} className="rounded-md border-gray-300" />
        </TableCell>
        
        <TableCell className="w-24 font-black text-[10px] tracking-widest text-muted-foreground uppercase">
          #{ticket.id}
        </TableCell>

        <TableCell className="max-w-md">
          <div className="flex flex-col gap-1">
            <span className="font-bold text-foreground group-hover:text-indigo-600 transition-colors cursor-pointer" onClick={onClick}>
              {ticket.subject}
            </span>
            <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
              <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {ticket.cf_company || 'N/A'}</span>
              <span className="flex items-center gap-1"><User className="h-3 w-3" /> {ticket.assignee || 'Unassigned'}</span>
            </div>
          </div>
        </TableCell>

        <TableCell>
          <Badge variant="outline" className={cn("rounded-full px-3 py-1 font-bold text-[10px] uppercase tracking-widest border-2", getStatusStyles(ticket.status))}>
            {ticket.status}
          </Badge>
        </TableCell>

        <TableCell>
          <div className="flex flex-col items-end gap-1">
            <div className={cn("text-sm font-black", getRiskColor(riskScore))}>
              {riskScore}% Risk
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
              <Clock className="h-3 w-3" />
              {ageDays} days old
            </div>
          </div>
        </TableCell>

        <TableCell className="pr-6 text-right">
          <div className="flex items-center justify-end gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn("h-8 w-8 rounded-full transition-transform", isExpanded && "bg-indigo-100 dark:bg-indigo-900")}
            >
              <Brain className={cn("h-4 w-4", isExpanded ? "text-indigo-600" : "text-muted-foreground")} />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClick} className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>

      <AnimatePresence>
        {isExpanded && (
          <TableRow className="bg-white dark:bg-gray-800 border-none hover:bg-white dark:hover:bg-gray-800">
            <TableCell colSpan={6} className="p-0">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-6 pt-0 grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-gray-100 dark:border-gray-700">
                  <div className="space-y-3 p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/10 border border-purple-100 dark:border-purple-900/50">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-purple-600 flex items-center gap-2">
                      <TrendingUp className="h-3 w-3" /> Intelligence
                    </h5>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Ticket is {ageDays} days old with {ticket.priority} priority. 
                      {ticket.due_by && isPast(parseISO(ticket.due_by)) ? " SLA has been breached." : " SLA is still active."}
                    </p>
                  </div>

                  <div className="space-y-3 p-4 rounded-2xl bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/50">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-red-600 flex items-center gap-2">
                      <ShieldAlert className="h-3 w-3" /> Risk Score
                    </h5>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black">{riskScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500" style={{ width: `${riskScore}%` }} />
                    </div>
                  </div>

                  <div className="space-y-3 p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-900/50">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2">
                      <Sparkles className="h-3 w-3" /> Suggested Action
                    </h5>
                    <p className="text-sm font-bold leading-snug">
                      {riskScore > 70 ? "Immediate manager intervention required." : "Provide a technical update to the customer."}
                    </p>
                  </div>
                </div>
              </motion.div>
            </TableCell>
          </TableRow>
        )}
      </AnimatePresence>
    </>
  );
};

export default TicketRow;