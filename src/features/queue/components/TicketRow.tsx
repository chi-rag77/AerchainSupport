"use client";

import React, { useState, useMemo } from 'react';
import { TableRow, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Brain, Sparkles, Clock, Building2, User, ArrowRight,
  ShieldAlert, MessageSquare, Repeat, Zap, Heart,
  CheckCircle2, Hourglass, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO, differenceInDays, isPast } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface TicketRowProps {
  ticket: any;
  isSelected: boolean;
  onToggleSelect: () => void;
  onClick: () => void;
}

const STATUS_SHORT: Record<string, string> = {
  "Open (Being Processed)": "Open",
  "Pending (Awaiting your Reply)": "Pending",
  "On Tech": "On Tech",
  "Closed": "Closed",
  "Resolved": "Resolved",
  "Escalated": "Escalated",
  "Waiting on Customer": "Waiting",
};

const TicketRow = ({ ticket, isSelected, onToggleSelect, onClick }: TicketRowProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const { riskScore, ageDays, aiSignals, healthScore, isBreached } = useMemo(() => {
    const created = parseISO(ticket.created_at);
    const days = differenceInDays(new Date(), created);
    const breached = ticket.due_by && isPast(parseISO(ticket.due_by)) && !['resolved', 'closed'].includes(ticket.status.toLowerCase());
    
    // Base score from age
    let score = days > 3 ? 10 : 0;
    const signals = [];

    const p = ticket.priority.toLowerCase();
    if (p === 'urgent' || breached) {
      score += 60;
      signals.push({ label: breached ? "Breached" : "Urgent", icon: ShieldAlert, color: "text-rose-600 bg-rose-50" });
    } else if (p === 'high') {
      score += 30;
    }

    if (ticket.status === 'Escalated') {
      signals.push({ label: "Escalated", icon: MessageSquare, color: "text-amber-600 bg-amber-50" });
    }

    // Mock health score based on company name
    const hScore = (ticket.cf_company?.length % 40) + 55;

    return { 
      riskScore: Math.min(100, score), 
      ageDays: days, 
      aiSignals: signals,
      healthScore: hScore,
      isBreached: breached
    };
  }, [ticket]);

  const getStatusBadgeClasses = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('open')) return 'bg-blue-50 text-blue-700 border-blue-100';
    if (s.includes('pending')) return 'bg-amber-50 text-amber-700 border-amber-100';
    if (s.includes('resolved')) return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    if (s.includes('escalated')) return 'bg-rose-50 text-rose-700 border-rose-100';
    return 'bg-gray-50 text-gray-600 border-gray-100';
  };

  const renderHeatmap = (score: number) => {
    const bars = 5;
    const activeBars = Math.max(1, Math.ceil((score / 100) * bars));
    const color = score > 70 ? "bg-rose-500" : score > 40 ? "bg-amber-500" : "bg-emerald-500";
    
    return (
      <div className="flex gap-0.5">
        {[...Array(bars)].map((_, i) => (
          <div 
            key={i} 
            className={cn(
              "h-3 w-1.5 rounded-[1px] transition-colors",
              i < activeBars ? color : "bg-gray-100 dark:bg-gray-800"
            )} 
          />
        ))}
      </div>
    );
  };

  const getHealthColor = (score: number) => {
    if (score >= 75) return "bg-emerald-50 text-emerald-700";
    if (score >= 50) return "bg-amber-50 text-amber-700";
    return "bg-rose-50 text-rose-700";
  };

  return (
    <>
      <TableRow 
        className={cn(
          "group transition-all duration-200 border-b border-gray-50 dark:border-gray-900 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/10",
          isSelected && "bg-indigo-50/40 dark:bg-indigo-950/20",
          isExpanded && "bg-white dark:bg-gray-800 shadow-sm z-10 relative",
          // Left Border Accent
          (ticket.priority === 'Urgent' || isBreached) ? "border-l-4 border-l-rose-500" : 
          ticket.priority === 'High' ? "border-l-4 border-l-amber-500" : "border-l-4 border-l-transparent"
        )}
      >
        <TableCell className="w-12 pl-6">
          <Checkbox checked={isSelected} onCheckedChange={onToggleSelect} className="rounded-md border-gray-300" />
        </TableCell>
        
        <TableCell className="w-24 font-black text-[10px] tracking-widest text-muted-foreground uppercase">
          #{ticket.id}
        </TableCell>

        <TableCell className="max-w-md">
          <div className="flex flex-col gap-0.5">
            <span 
              className="font-medium text-sm text-foreground truncate max-w-[400px] block group-hover:text-indigo-600 transition-colors cursor-pointer" 
              onClick={onClick}
            >
              {ticket.subject}
            </span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Building2 className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] font-bold text-foreground/80">{ticket.cf_company || 'N/A'}</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={cn("flex items-center gap-1 ml-1 px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase", getHealthColor(healthScore))}>
                      <Heart className="h-2 w-2" /> {healthScore}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Account Health Score</TooltipContent>
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
          </div>
        </TableCell>

        <TableCell>
          <Badge className={cn("inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border", getStatusBadgeClasses(ticket.status))}>
            {STATUS_SHORT[ticket.status] || ticket.status}
          </Badge>
        </TableCell>

        <TableCell>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Risk</span>
              {renderHeatmap(riskScore)}
            </div>
            <div className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground uppercase">
              <Clock className="h-2.5 w-2.5" />
              {ageDays}d
            </div>
          </div>
        </TableCell>

        <TableCell className="pr-6 text-right">
          <div className="flex items-center justify-end gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn("h-8 w-8 rounded-full transition-all", isExpanded && "bg-indigo-600 text-white shadow-lg")}
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
            <TableCell colSpan={7} className="p-0">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-6 pt-0 grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-gray-100 dark:border-gray-700">
                  <Card className="border-none bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl space-y-2">
                    <h5 className="text-[9px] font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2">
                      <Sparkles className="h-3 w-3" /> Why this matters
                    </h5>
                    <p className="text-xs font-bold leading-relaxed text-foreground/80">
                      {riskScore > 70 
                        ? "Critical combination of high priority and SLA breach. Customer health is at risk due to repeated module failures." 
                        : "Standard operational request. Sentiment is stable, but requires technical validation."}
                    </p>
                  </Card>

                  <Card className="border-none bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl space-y-2">
                    <h5 className="text-[9px] font-black uppercase tracking-widest text-rose-600 flex items-center gap-2">
                      <ShieldAlert className="h-3 w-3" /> Predictive Insight
                    </h5>
                    <p className="text-xs font-bold leading-relaxed text-foreground/80">
                      {isBreached 
                        ? "SLA already breached. High probability of customer follow-up in next 4 hours." 
                        : "Likely to resolve within SLA if technical review is completed today."}
                    </p>
                  </Card>

                  <Card className="border-none bg-indigo-600 p-4 rounded-2xl space-y-3 text-white shadow-lg shadow-indigo-500/20">
                    <h5 className="text-[9px] font-black uppercase tracking-widest text-indigo-100 flex items-center gap-2">
                      <Zap className="h-3 w-3" /> Suggested Action
                    </h5>
                    <p className="text-xs font-black leading-snug">
                      {riskScore > 70 ? "Escalate to Engineering Lead" : "Draft technical update for customer"}
                    </p>
                    <Button size="sm" className="h-8 rounded-lg bg-white text-indigo-600 hover:bg-indigo-50 font-black text-[9px] uppercase tracking-widest w-full">
                      Execute Now
                    </Button>
                  </Card>
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