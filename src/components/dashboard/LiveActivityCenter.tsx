"use client";

import React, { useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Ticket } from '@/types';
import { 
  TrendingUp, CheckCircle2, AlertTriangle, 
  ArrowUpRight, Clock 
} from 'lucide-react';
import { formatDistanceToNowStrict, parseISO, isPast, differenceInHours } from 'date-fns';
import { cn } from '@/lib/utils';

interface LiveActivityCenterProps {
  tickets: Ticket[];
}

const LiveActivityCenter = ({ tickets }: LiveActivityCenterProps) => {
  const activities = useMemo(() => {
    if (!tickets || tickets.length === 0) return [];

    // Sort by updated_at to get the most recent "activity"
    const sortedTickets = [...tickets].sort((a, b) => 
      new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime()
    );

    return sortedTickets.slice(0, 5).map(t => {
      const status = t.status.toLowerCase();
      const isEscalated = status === 'escalated' || t.priority === 'Urgent';
      const isResolved = status === 'resolved' || status === 'closed';
      const isSlaBreach = t.due_by && isPast(parseISO(t.due_by)) && !isResolved;

      let type: 'escalated' | 'resolved' | 'sla_breach' = 'resolved';
      if (isSlaBreach) type = 'sla_breach';
      else if (isEscalated) type = 'escalated';

      // Calculate real resolution time if resolved
      let resolutionText = "";
      if (isResolved) {
        const hours = differenceInHours(parseISO(t.updated_at), parseISO(t.created_at));
        resolutionText = hours < 1 ? "Resolved in < 1h" : `Resolved in ${hours}h`;
      }

      return {
        id: t.id,
        type,
        title: type === 'escalated' ? `Ticket escalated #${t.id}` : 
               type === 'sla_breach' ? `SLA Breach #${t.id}` : 
               `Ticket resolved #${t.id}`,
        subtitle: type === 'resolved' 
          ? `${resolutionText} · Agent: ${t.assignee || 'Unassigned'}`
          : `Customer: ${t.cf_company || 'N/A'} · Module: ${t.cf_module || 'General'}`,
        time: formatDistanceToNowStrict(parseISO(t.updated_at || t.created_at)) + ' ago'
      };
    });
  }, [tickets]);

  return (
    <Card className="border-none shadow-sm bg-white dark:bg-gray-900 rounded-[16px] overflow-hidden h-full flex flex-col">
      <div className="p-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Live Activity</h3>
          <span className="text-xs font-medium text-slate-400 ml-1">Last 24h</span>
        </div>
        <button className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
          View All <ArrowUpRight className="h-3 w-3" />
        </button>
      </div>

      <CardContent className="p-6 pt-0 flex-1">
        <div className="space-y-5">
          {activities.length > 0 ? (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start justify-between gap-4 group">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "p-2 rounded-full shrink-0",
                    activity.type === 'escalated' && "bg-orange-50 text-orange-500",
                    activity.type === 'resolved' && "bg-emerald-50 text-emerald-500",
                    activity.type === 'sla_breach' && "bg-rose-50 text-rose-500"
                  )}>
                    {activity.type === 'escalated' && <TrendingUp className="h-4 w-4" />}
                    {activity.type === 'resolved' && <CheckCircle2 className="h-4 w-4" />}
                    {activity.type === 'sla_breach' && <AlertTriangle className="h-4 w-4" />}
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors cursor-pointer">
                      {activity.title}
                    </h4>
                    <p className="text-xs font-medium text-slate-500 leading-tight">
                      {activity.subtitle}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap pt-1">
                  {activity.time}
                </span>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground italic text-sm">
              No recent activity detected.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveActivityCenter;