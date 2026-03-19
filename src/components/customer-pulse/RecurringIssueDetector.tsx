"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { RecurringPattern } from '@/features/customer-pulse/types';
import { cn } from '@/lib/utils';
import { Repeat, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface RecurringIssueDetectorProps {
  issues: RecurringPattern[];
}

const RecurringIssueDetector = ({ issues }: RecurringIssueDetectorProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 px-1">
        <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
          <Repeat className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Recurring Patterns</h3>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {issues.map((issue) => (
          <Card key={issue.id} className="group relative overflow-hidden border-none bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all rounded-[24px]">
            <CardContent className="p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-black tracking-tight group-hover:text-indigo-600 transition-colors">{issue.title}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" /> {issue.firstSeen}
                    </span>
                  </div>
                </div>
                <Badge className={cn(
                  "font-black uppercase tracking-widest text-[8px] border-none px-2 py-0.5",
                  issue.trend === 'up' ? "bg-rose-50 text-rose-600" : "bg-indigo-50 text-indigo-600"
                )}>
                  {issue.trend === 'up' ? 'Increasing' : 'Repeating'}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-border">
                  <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Count</p>
                  <p className="text-base font-black">{issue.count}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-border">
                  <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Impact</p>
                  <p className={cn("text-[10px] font-black uppercase", issue.impact === 'High' ? 'text-rose-600' : 'text-amber-600')}>{issue.impact}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-border">
                  <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Freq</p>
                  <p className="text-[10px] font-black uppercase">{issue.frequency}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Pattern Active</span>
                <button className="text-indigo-600 font-black text-[9px] uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                  Analyze <ArrowRight className="h-2.5 w-2.5" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RecurringIssueDetector;