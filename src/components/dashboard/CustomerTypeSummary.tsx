"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket } from '@/features/tickets/types';
import { Bug, ClipboardList, HelpCircle, FileText, Zap, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CustomerTypeSummaryProps {
  customerName: string;
  tickets: Ticket[];
}

const CustomerTypeSummary = ({ customerName, tickets }: CustomerTypeSummaryProps) => {
  const stats = useMemo(() => {
    const counts = {
      bug: 0,
      task: 0,
      query: 0,
      other: 0,
      total: tickets.length
    };

    tickets.forEach(t => {
      const type = (t.type || '').toLowerCase();
      if (type.includes('bug')) counts.bug++;
      else if (type.includes('task')) counts.task++;
      else if (type.includes('query')) counts.query++;
      else counts.other++;
    });

    const getPercent = (count: number) => 
      counts.total > 0 ? Math.round((count / counts.total) * 100) : 0;

    return {
      ...counts,
      percents: {
        bug: getPercent(counts.bug),
        task: getPercent(counts.task),
        query: getPercent(counts.query),
        other: getPercent(counts.other),
      }
    };
  }, [tickets]);

  const items = [
    { label: 'Bugs', count: stats.bug, icon: Bug, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
    { label: 'Tasks', count: stats.task, icon: ClipboardList, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Queries', count: stats.query, icon: HelpCircle, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Other', count: stats.other, icon: FileText, color: 'text-gray-600', bg: 'bg-gray-50 dark:bg-gray-900/20' },
  ];

  return (
    <Card className="border-none shadow-glass rounded-[24px] bg-white dark:bg-gray-800 overflow-hidden h-full flex flex-col">
      <CardHeader className="p-6 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            {customerName === 'All' ? 'Global Breakdown' : `${customerName} Summary`}
          </CardTitle>
          <Badge variant="secondary" className="font-bold">{stats.total} Total</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-4 space-y-6 flex-grow">
        <div className="grid grid-cols-2 gap-4">
          {items.map((item) => (
            <div key={item.label} className={cn("p-4 rounded-2xl border border-transparent transition-all hover:border-border", item.bg)}>
              <div className="flex items-center gap-3 mb-2">
                <item.icon className={cn("h-4 w-4", item.color)} />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{item.label}</span>
              </div>
              <div className="text-2xl font-black tracking-tighter">{item.count}</div>
            </div>
          ))}
        </div>

        <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50">
          <div className="flex items-start gap-3">
            <Sparkles className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
            <p className="text-xs font-medium leading-relaxed text-indigo-900 dark:text-indigo-200">
              For <span className="font-bold">{customerName === 'All' ? 'all accounts' : customerName}</span>, the ticket mix consists of 
              <span className="font-bold"> {stats.percents.bug}% Bugs</span>, 
              <span className="font-bold"> {stats.percents.task}% Tasks</span>, and 
              <span className="font-bold"> {stats.percents.query}% Queries</span>. 
              {stats.percents.bug > 30 ? " High bug ratio suggests potential stability issues." : " The distribution indicates a healthy operational balance."}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerTypeSummary;