"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { LayoutGrid } from 'lucide-react';

interface QueueBreakdownProps {
  data: any;
}

const QueueBreakdown = ({ data }: QueueBreakdownProps) => {
  const items = [
    { label: "Urgent (>4h)", count: 3, percent: 25, color: "bg-rose-500" },
    { label: "Pending Reply", count: 5, percent: 42, color: "bg-orange-500" },
    { label: "Ready to Close", count: 2, percent: 17, color: "bg-emerald-500" },
    { label: "In Progress", count: 2, percent: 17, color: "bg-blue-500" },
  ];

  return (
    <Card className="border border-border/50 bg-white dark:bg-gray-900 rounded-[16px] shadow-sm overflow-hidden">
      <CardHeader className="p-5 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-600 text-white shadow-sm">
              <LayoutGrid className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold">Queue Breakdown</CardTitle>
              <p className="text-[10px] font-medium text-muted-foreground">Current ticket distribution</p>
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black tracking-tighter">12</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Open</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-0 space-y-6">
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.label} className="space-y-1.5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className={cn("h-2 w-2 rounded-full", item.color)} />
                  <span className="text-xs font-bold text-foreground/80">{item.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-muted-foreground">{item.percent}%</span>
                  <span className="text-xs font-black text-foreground">{item.count}</span>
                </div>
              </div>
              <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full", item.color)} style={{ width: `${item.percent}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-border/50 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Queue Health</span>
            <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">33% — Critical</span>
          </div>
          <Progress value={33} className="h-2 bg-gray-100" indicatorClassName="bg-blue-600" />
        </div>
      </CardContent>
    </Card>
  );
};

export default QueueBreakdown;