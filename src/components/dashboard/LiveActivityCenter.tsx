"use client";

import React, { useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Ticket } from '@/types';
import { 
  TrendingUp, CheckCircle2, AlertTriangle, 
  ArrowUpRight, Clock, PlusCircle, RefreshCw,
  Filter
} from 'lucide-react';
import { formatDistanceToNowStrict, parseISO, isPast, differenceInHours, isAfter, subHours } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LiveActivityCenterProps {
  tickets: Ticket[];
}

const LiveActivityCenter = ({ tickets }: LiveActivityCenterProps) => {
  const activities = useMemo(() => {
    if (!tickets || tickets.length === 0) return [];

    const now = new Date();
    const last24h = subHours(now, 24);

    // Process tickets into specific event types
    const events = tickets.flatMap(t => {
      const itemEvents = [];
      const updatedAt = parseISO(t.updated_at);
      const createdAt = parseISO(t.created_at);
      const status = t.status.toLowerCase();
      const isResolved = status === 'resolved' || status === 'closed';

      // 1. New Ticket Created
      if (isAfter(createdAt, last24h)) {
        itemEvents.push({
          id: `new-${t.id}`,
          type: 'new' as const,
          timestamp: createdAt,
          title: `New ticket created #${t.id}`,
          detail: `Customer: ${t.cf_company || 'N/A'} · Category: ${t.type || 'General'}`,
          icon: PlusCircle,
          color: "bg-blue-50 text-blue-600"
        });
      }

      // 2. Ticket Resolved
      if (isResolved && isAfter(updatedAt, last24h)) {
        const resHours = differenceInHours(updatedAt, createdAt);
        itemEvents.push({
          id: `res-${t.id}`,
          type: 'resolved' as const,
          timestamp: updatedAt,
          title: `Ticket resolved #${t.id}`,
          detail: `Resolved in ${resHours < 1 ? '< 1h' : resHours + 'h'} · Agent: ${t.assignee || 'System'}`,
          icon: CheckCircle2,
          color: "bg-emerald-50 text-emerald-600"
        });
      }

      // 3. Escalation
      const isEscalated = status === 'escalated' || t.priority === 'Urgent';
      if (isEscalated && isAfter(updatedAt, last24h) && !isResolved) {
        itemEvents.push({
          id: `esc-${t.id}`,
          type: 'escalated' as const,
          timestamp: updatedAt,
          title: `Ticket escalated #${t.id}`,
          detail: `Customer: ${t.cf_company || 'N/A'} · Topic: ${t.subject.substring(0, 30)}...`,
          icon: TrendingUp,
          color: "bg-orange-50 text-orange-500"
        });
      }

      // 4. SLA Breach
      if (t.due_by && isPast(parseISO(t.due_by)) && !isResolved) {
        itemEvents.push({
          id: `sla-${t.id}`,
          type: 'sla_breach' as const,
          timestamp: updatedAt, // Use last update as proxy for breach detection time
          title: `SLA Breach #${t.id}`,
          detail: `Priority: ${t.priority} · Response time exceeded`,
          icon: AlertTriangle,
          color: "bg-rose-50 text-rose-600"
        });
      }

      return itemEvents;
    });

    // Sort by most recent and take top 15 for the scrollable list
    return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 15);
  }, [tickets]);

  return (
    <Card className="border-none shadow-sm bg-white dark:bg-gray-900 rounded-[16px] overflow-hidden h-full flex flex-col">
      <div className="p-6 pb-4 flex items-center justify-between border-b border-gray-50 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Live Activity</h3>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Last 24h</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] font-black uppercase tracking-widest gap-1.5 hover:bg-gray-50">
            <Filter className="h-3 w-3" /> Filter
          </Button>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] font-black uppercase tracking-widest gap-1.5 text-blue-600 hover:bg-blue-50">
            View All <ArrowUpRight className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <CardContent className="p-0 flex-1 overflow-hidden">
        <ScrollArea className="h-[320px]">
          <div className="p-6 space-y-6">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-start justify-between gap-4 group">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "p-2 rounded-full shrink-0 transition-transform group-hover:scale-110",
                      activity.color
                    )}>
                      <activity.icon className="h-4 w-4" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors cursor-pointer">
                        {activity.title}
                      </h4>
                      <p className="text-xs font-medium text-slate-500 leading-tight">
                        {activity.detail}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap pt-1 uppercase tracking-tighter">
                    {formatDistanceToNowStrict(activity.timestamp)} ago
                  </span>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground italic text-sm">
                No recent activity detected.
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default LiveActivityCenter;