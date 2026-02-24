"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, Building2, User, ShieldAlert, 
  AlertCircle, CheckCircle2, Hourglass 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNowStrict, parseISO } from 'date-fns';

interface CompactTicketCardProps {
  ticket: any;
  onClick: () => void;
}

const CompactTicketCard = ({ ticket, onClick }: CompactTicketCardProps) => {
  const getStatusIcon = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('open')) return <Hourglass className="h-3 w-3" />;
    if (s.includes('resolved')) return <CheckCircle2 className="h-3 w-3" />;
    if (s.includes('escalated')) return <AlertCircle className="h-3 w-3" />;
    return <Clock className="h-3 w-3" />;
  };

  const getPriorityColor = (priority: string) => {
    const p = priority.toLowerCase();
    if (p === 'urgent') return "bg-red-500";
    if (p === 'high') return "bg-orange-500";
    if (p === 'medium') return "bg-yellow-500";
    return "bg-blue-500";
  };

  return (
    <Card 
      className="group relative overflow-hidden border-none bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer rounded-2xl"
      onClick={onClick}
    >
      {/* Priority Indicator Strip */}
      <div className={cn("absolute left-0 top-0 h-full w-1", getPriorityColor(ticket.priority))} />

      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start gap-2">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            #{ticket.id}
          </span>
          <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-tighter px-2 py-0 h-5 border-2">
            {ticket.status}
          </Badge>
        </div>

        <h4 className="text-sm font-bold leading-tight line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {ticket.subject}
        </h4>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase">
            <Building2 className="h-3 w-3 shrink-0" />
            <span className="truncate">{ticket.cf_company || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase">
            <User className="h-3 w-3 shrink-0" />
            <span className="truncate">{ticket.assignee || 'Unassigned'}</span>
          </div>
        </div>

        <div className="pt-2 border-t border-gray-50 dark:border-gray-800 flex justify-between items-center">
          <div className="flex items-center gap-1 text-[9px] font-black text-muted-foreground">
            <Clock className="h-3 w-3" />
            {formatDistanceToNowStrict(parseISO(ticket.created_at))} ago
          </div>
          {ticket.priority === 'Urgent' && (
            <ShieldAlert className="h-3.5 w-3.5 text-red-500 animate-pulse" />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CompactTicketCard;