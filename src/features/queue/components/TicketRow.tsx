"use client";

import React, { useState } from 'react';
import { TableRow, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Brain, Sparkles, ChevronDown, ChevronUp, Clock, 
  AlertCircle, MessageSquare, Building2, User, ArrowRight,
  TrendingUp, ShieldAlert, CheckCircle2, Eye, StickyNote, UserPlus, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNowStrict, parseISO, differenceInMinutes, differenceInHours } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface TicketRowProps {
  ticket: any;
  isSelected: boolean;
  onToggleSelect: () => void;
  onClick: () => void;
  viewMode: 'list' | 'compact' | 'kanban';
}

const TicketRow = ({ ticket, isSelected, onToggleSelect, onClick, viewMode }: TicketRowProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusStyles = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('open')) return "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-100";
    if (s.includes('tech')) return "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-100";
    if (s.includes('escalated')) return "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-100 animate-pulse";
    return "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200";
  };

  const riskScore = ticket.riskScore || 45;
  const getRiskLevel = (score: number) => {
    if (score > 80) return { label: 'High', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500' };
    if (score > 50) return { label: 'Medium', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500' };
    return { label: 'Low', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-500' };
  };

  const risk = getRiskLevel(riskScore);

  const getSlaCountdown = () => {
    if (!ticket.due_by) return null;
    const due = parseISO(ticket.due_by);
    const now = new Date();
    const diffMin = differenceInMinutes(due, now);
    
    if (diffMin < 0) return <span className="text-red-600 font-black">BREACHED</span>;
    
    const hours = Math.floor(diffMin / 60);
    const mins = diffMin % 60;
    return <span className={cn("font-bold", diffMin < 120 ? "text-orange-600" : "text-muted-foreground")}>
      {hours}h {mins}m left
    </span>;
  };

  const isCompact = viewMode === 'compact';

  return (
    <>
      <TableRow 
        className={cn(
          "group transition-all duration-300 border-none hover:bg-indigo-50/30 dark:hover:bg-indigo-950/10 relative",
          isSelected && "bg-indigo-50/50 dark:bg-indigo-950/20",
          isExpanded && "bg-white dark:bg-gray-800 shadow-md z-10",
          riskScore > 80 && "bg-red-50/10 dark:bg-red-950/5"
        )}
      >
        {/* Mini Risk Indicator Bar */}
        <div className={cn("absolute left-0 top-1 bottom-1 w-1 rounded-r-full z-20", risk.bg)} />

        <TableCell className="w-12 pl-6">
          <Checkbox checked={isSelected} onCheckedChange={onToggleSelect} className="rounded-md border-gray-300" />
        </TableCell>
        
        <TableCell className="w-24 font-black text-[10px] tracking-widest text-muted-foreground uppercase sticky left-0 bg-inherit z-10">
          #{ticket.id}
        </TableCell>

        <TableCell className={cn("max-w-md", isCompact ? "py-2" : "py-4")}>
          <div className="flex flex-col gap-1">
            <span className={cn("font-bold text-foreground group-hover:text-indigo-600 transition-colors cursor-pointer", isCompact ? "text-sm" : "text-base")} onClick={onClick}>
              {ticket.subject}
            </span>
            {!isCompact && (
              <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {ticket.cf_company || 'N/A'}</span>
                <span className="flex items-center gap-1"><User className="h-3 w-3" /> {ticket.assignee || 'Unassigned'}</span>
              </div>
            )}
          </div>
        </TableCell>

        <TableCell>
          <Badge variant="outline" className={cn("rounded-full px-3 py-1 font-bold text-[10px] uppercase tracking-widest border-2", getStatusStyles(ticket.status))}>
            {ticket.status}
          </Badge>
        </TableCell>

        <TableCell className="sticky right-0 bg-inherit z-10 shadow-[-10px_0_15px_-10px_rgba(0,0,0,0.1)]">
          <div className="flex flex-col items-end gap-1">
            <div className={cn("text-sm font-black flex items-center gap-1.5", risk.color)}>
              <div className={cn("h-1.5 w-1.5 rounded-full", risk.bg)} />
              {risk.label} ({riskScore}%)
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              <Clock className="h-3 w-3" />
              {getSlaCountdown() || formatDistanceToNowStrict(parseISO(ticket.created_at))}
            </div>
          </div>
        </TableCell>

        <TableCell className="pr-6 text-right w-40">
          <div className="flex items-center justify-end gap-1">
            {/* Row Hover Action Bar */}
            <div className="hidden group-hover:flex items-center gap-1 mr-2 animate-in fade-in slide-in-from-right-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-white dark:hover:bg-gray-700 shadow-sm" onClick={onClick}>
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Quick View</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-white dark:hover:bg-gray-700 shadow-sm">
                    <StickyNote className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add Note</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-white dark:hover:bg-gray-700 shadow-sm">
                    <UserPlus className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reassign</TooltipContent>
              </Tooltip>
            </div>

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn("h-8 w-8 rounded-full transition-transform", isExpanded && "bg-indigo-100 dark:bg-indigo-900")}
            >
              <Brain className={cn("h-4 w-4", isExpanded ? "text-indigo-600" : "text-muted-foreground")} />
            </Button>
          </div>
        </TableCell>
      </TableRow>

      {/* AI Intelligence Layer */}
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
                      <TrendingUp className="h-3 w-3" /> Sentiment Intelligence
                    </h5>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold">Trend: {ticket.sentimentTrend || 'Stable'}</span>
                      <Badge className="bg-purple-600 text-white">88% Confidence</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Customer tone is currently professional but showing signs of frustration regarding resolution time.
                    </p>
                  </div>

                  <div className="space-y-3 p-4 rounded-2xl bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/50">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-red-600 flex items-center gap-2">
                      <ShieldAlert className="h-3 w-3" /> Escalation Risk
                    </h5>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black">{ticket.escalationLikelihood || 12}%</span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Likelihood</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500" style={{ width: `${ticket.escalationLikelihood || 12}%` }} />
                    </div>
                  </div>

                  <div className="space-y-3 p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-900/50">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2">
                      <Sparkles className="h-3 w-3" /> Suggested Next Action
                    </h5>
                    <p className="text-sm font-bold leading-snug">
                      {ticket.suggestedNextAction || "Provide a technical update on the module dependency to stabilize sentiment."}
                    </p>
                    <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs">
                      Execute Action
                    </Button>
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