"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket } from '@/types';
import { 
  Activity, Ticket as TicketIcon, CheckCircle2, 
  Hourglass, Building2, ArrowRight, Sparkles,
  TrendingUp, Users
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { isToday, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface LiveActivityCenterProps {
  tickets: Ticket[];
}

const LiveActivityCenter = ({ tickets }: LiveActivityCenterProps) => {
  const todayStats = useMemo(() => {
    const todayTickets = tickets.filter(t => isToday(parseISO(t.created_at)));
    const resolvedToday = tickets.filter(t => {
      const status = t.status.toLowerCase();
      return (status === 'resolved' || status === 'closed') && isToday(parseISO(t.updated_at));
    });

    const customerActivity: Record<string, { created: number; resolved: number }> = {};
    
    todayTickets.forEach(t => {
      const co = t.cf_company || 'Unknown';
      if (!customerActivity[co]) customerActivity[co] = { created: 0, resolved: 0 };
      customerActivity[co].created++;
    });

    resolvedToday.forEach(t => {
      const co = t.cf_company || 'Unknown';
      if (!customerActivity[co]) customerActivity[co] = { created: 0, resolved: 0 };
      customerActivity[co].resolved++;
    });

    const openTickets = tickets.filter(t => !['resolved', 'closed'].includes(t.status.toLowerCase())).length;

    return {
      createdCount: todayTickets.length,
      resolvedCount: resolvedToday.length,
      openCount: openTickets,
      customerFeed: Object.entries(customerActivity)
        .map(([name, stats]) => ({ name, ...stats }))
        .sort((a, b) => b.created - a.created)
    };
  }, [tickets]);

  const resolutionRate = todayStats.createdCount > 0 
    ? Math.round((todayStats.resolvedCount / todayStats.createdCount) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-black tracking-tight">Live Activity Center</h3>
            <p className="text-sm font-medium text-muted-foreground">Real-time operational pulse for today</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Live Feed Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 1. Today's Velocity Card */}
        <Card className="border-none shadow-glass rounded-[28px] bg-white dark:bg-gray-900 overflow-hidden flex flex-col">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-500" />
              Today's Velocity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-0 space-y-8 flex-1 flex flex-col justify-center">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Created Today</p>
                <p className="text-4xl font-black tracking-tighter text-indigo-600">{todayStats.createdCount}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Resolved Today</p>
                <p className="text-4xl font-black tracking-tighter text-green-600">{todayStats.resolvedCount}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Resolution Pace</span>
                <span className="text-sm font-bold text-indigo-600">{resolutionRate}% of inflow</span>
              </div>
              <Progress value={resolutionRate} className="h-2" indicatorClassName="bg-indigo-600" />
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white dark:bg-gray-700 shadow-sm">
                  <Hourglass className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Current Backlog</p>
                  <p className="text-lg font-black">{todayStats.openCount} Active Tickets</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Customer Activity Feed */}
        <Card className="lg:col-span-2 rounded-[28px] border-none bg-white dark:bg-gray-800 shadow-glass overflow-hidden flex flex-col">
          <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-500" />
              Customer Activity Feed
            </CardTitle>
            <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-none font-bold text-[10px]">
              {todayStats.customerFeed.length} Active Accounts
            </Badge>
          </CardHeader>
          <CardContent className="p-8 pt-0 overflow-y-auto max-h-[320px]">
            <div className="space-y-4">
              {todayStats.customerFeed.length > 0 ? (
                todayStats.customerFeed.map((item, i) => (
                  <motion.div 
                    key={item.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-border/50 group hover:border-indigo-200 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-sm font-black text-indigo-600 shadow-sm border border-border/50">
                        {item.name[0]}
                      </div>
                      <div className="space-y-0.5">
                        <h5 className="font-bold text-base text-foreground">{item.name}</h5>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          {item.created} created • {item.resolved} resolved
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Status</p>
                        <p className={cn(
                          "text-xs font-black uppercase tracking-tighter",
                          item.resolved >= item.created ? "text-green-600" : "text-amber-600"
                        )}>
                          {item.resolved >= item.created ? "Stable" : "In Progress"}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-center space-y-2">
                  <Sparkles className="h-8 w-8 opacity-20" />
                  <p className="text-sm font-medium">No customer activity recorded yet today.</p>
                </div>
              )}
            </div>
          </CardContent>
          <div className="p-6 bg-gray-50/50 dark:bg-gray-900/50 border-t border-border mt-auto">
            <p className="text-[10px] font-bold text-muted-foreground text-center uppercase tracking-[0.2em]">
              Showing real-time data from Freshdesk API
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LiveActivityCenter;