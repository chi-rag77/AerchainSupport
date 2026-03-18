"use client";

import React, { useState, useMemo } from 'react';
import { TableRow, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Brain, Sparkles, Clock, Building2, User, ArrowRight,
  TrendingUp, ShieldAlert, MessageSquare, Repeat, Link as LinkIcon,
  AlertCircle, Info, Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNowStrict, parseISO, differenceInDays, isPast } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface TicketRowProps {
  ticket: any;
  isSelected: boolean;
  onToggleSelect: () => void;
  onClick: () => void;
}

const TicketRow = ({ ticket, isSelected, onToggleSelect, onClick }: TicketRowProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const { riskScore, ageDays, aiSignals } = useMemo(() => {
    const created = parseISO(ticket.created_at);
    const days = differenceInDays(new Date(), created);
    
    let score = 0;
    const signals = [];

    // Priority weight
    const p = ticket.priority.toLowerCase();
    if (p === 'urgent') {
      score += 40;
      signals.push({ label: "Likely Escalation", icon: ShieldAlert, color: "text-rose-600 bg-rose-50" });
    }

    // Sentiment/Status logic
    if (ticket.status === 'Escalated') {
      signals.push({ label: "Negative Sentiment", icon: MessageSquare, color: "text-amber-600 bg-amber-50" });
    }

    // Recurrence logic (mocked based on module)
    if (ticket.cf_module === 'Invoice') {
      signals.push({ label: "Recurring Issue", icon: Repeat, color: "text-indigo-600 bg-indigo-50" });
    }

    // Age weight
    if (days > 7) score += 40;
    if (ticket.due_by && isPast(parseISO(ticket.due_by))) {
      score += 20;
      signals.push({ label: "SLA Breached", icon: Clock, color: "text-rose-600 bg-rose-50" });
    }

    return { riskScore: Math.min(100, score), ageDays: days, aiSignals: signals };
  }, [ticket]);

  const renderHeatmap = (score: number) => {
    const bars = 5;
    const activeBars = Math.ceil((score / 100) * bars);
    return (
      <div className="flex gap-0.5">
        {[...Array(bars)].map((_, i) => (
          <div 
            key={i} 
            className={cn(
              "h-3 w-1.5 rounded-[1px]",
              i < activeBars 
                ? (score > 75 ? "bg-rose-500" : score > 40 ? "bg-amber-500" : "bg-emerald-500") 
                : "bg-gray-200 dark:bg-gray-800"
            )} 
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <TableRow 
        className={cn(
          "group transition-all duration-300 border-b border-gray-50 dark:border-gray-900 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/10",
          isSelected && "bg-indigo-50/40 dark:bg-indigo-950/20",
          isExpanded && "bg-white dark:bg-gray-800 shadow-lg z-10 relative"
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
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Building2 className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] font-bold text-foreground/80">{ticket.cf_company || 'N/A'}</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 ml-1 px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[8px] font-black uppercase">
                      <Heart className="h-2 w-2" /> 84
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Customer Health Score: 84/100</TooltipContent>
                </Tooltip>
              </div>
              <div className="h-3 w-px bg-border" />
              <div className="flex items-center gap-1.5">
                <User className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] font-bold text-muted-foreground">{ticket.assignee || 'Unassigned'}</span>
              </div>
            </div>
          </div>
        </TableCell>

        <TableCell>
          <div className="flex flex-wrap gap-1.5">
            {aiSignals.map((sig, i) => (
              <Badge key={i} variant="secondary" className={cn("h-5 px-2 text-[8px] font-black uppercase tracking-tighter gap-1 border-none", sig.color)}>
                <sig.icon className="h-2.5 w-2.5" />
                {sig.label}
              </Badge>
            ))}
            {aiSignals.length === 0 && (
              <Badge variant="outline" className="h-5 px-2 text-[8px] font-black uppercase tracking-tighter text-muted-foreground border-dashed">
                Stable
              </Badge>
            )}
          </div>
        </TableCell>

        <TableCell>
          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Risk</span>
              {renderHeatmap(riskScore)}
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground uppercase cursor-help">
                  <Clock className="h-2.5 w-2.5" />
                  {ageDays}d old
                </div>
              </TooltipTrigger>
              <TooltipContent className="p-3 space-y-1">
                <p className="text-[10px] font-bold uppercase text-muted-foreground">Timeline</p>
                <p className="text-xs">Created: {format(parseISO(ticket.created_at), 'MMM dd, HH:mm')}</p>
                <p className="text-xs">Last Update: {format(parseISO(ticket.updated_at), 'MMM dd, HH:mm')}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TableCell>

        <TableCell className="pr-6 text-right">
          <div className="flex items-center justify-end gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn("h-8 w-8 rounded-full transition-all", isExpanded && "bg-indigo-600 text-white shadow-lg shadow-indigo-200")}
            >
              <Brain className={cn("h-4 w-4", !isExpanded && "text-muted-foreground")} />
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
                <div className="p-8 pt-0 grid grid-cols-1 md:grid-cols-3 gap-8 border-b border-gray-100 dark:border-gray-700">
                  <div className="space-y-4 p-5 rounded-[24px] bg-indigo-50/30 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-900/50">
                    <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5" /> Why this matters
                    </h5>
                    <p className="text-sm font-bold leading-relaxed text-foreground/90">
                      {riskScore > 70 
                        ? "Critical combination of high priority and SLA breach. Customer health is at risk due to repeated module failures." 
                        : "Standard operational request. Sentiment is stable, but requires technical validation."}
                    </p>
                  </div>

                  <div className="space-y-4 p-5 rounded-[24px] bg-rose-50/30 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/50">
                    <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-600 flex items-center gap-2">
                      <ShieldAlert className="h-3.5 w-3.5" /> Predictive Insight
                    </h5>
                    <p className="text-sm font-bold leading-relaxed text-foreground/90">
                      {ticket.due_by && isPast(parseISO(ticket.due_by)) 
                        ? "SLA already breached. High probability of customer follow-up in next 4 hours." 
                        : "Likely to resolve within SLA if technical review is completed today."}
                    </p>
                  </div>

                  <div className="space-y-4 p-5 rounded-[24px] bg-emerald-50/30 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/50">
                    <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 flex items-center gap-2">
                      <Zap className="h-3.5 w-3.5" /> Suggested Action
                    </h5>
                    <div className="space-y-2">
                      <p className="text-sm font-bold leading-snug">
                        {riskScore > 70 ? "Escalate to Engineering Lead" : "Draft technical update for customer"}
                      </p>
                      <Button size="sm" className="h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase tracking-widest w-full">
                        Execute Action
                      </Button>
                    </div>
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