"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket } from '@/features/tickets/types';
import { Bug, ClipboardList, HelpCircle, AlertCircle, FileText, Zap } from 'lucide-react';
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

    return counts;
  }, [tickets]);

  const items = [
    { label: 'Bugs', count: stats.bug, icon: Bug, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
    { label: 'Tasks', count: stats.task, icon: ClipboardList, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Queries', count: stats.query, icon: HelpCircle, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Other', count: stats.other, icon: FileText, color: 'text-gray-600', bg: 'bg-gray-50 dark:bg-gray-900/20' },
  ];

  return (
    <Card className="border-none shadow-glass rounded-[24px] bg-white dark:bg-gray-800 overflow-hidden h-full">
      <CardHeader className="p-6 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            {customerName === 'All' ? 'Global Breakdown' : `${customerName} Summary`}
          </CardTitle>
          <Badge variant="secondary" className="font-bold">{stats.total} Total</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-4">
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
      </CardContent>
    </Card>
  );
};

export default CustomerTypeSummary;