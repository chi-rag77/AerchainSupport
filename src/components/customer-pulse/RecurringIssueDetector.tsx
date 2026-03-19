"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecurringPattern } from '@/features/customer-pulse/types';
import { cn } from '@/lib/utils';
import { Repeat, TrendingUp, ShieldAlert, Clock, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface RecurringIssueDetectorProps {
  issues: RecurringPattern[];
}

const RecurringIssueDetector = ({ issues }: RecurringIssueDetectorProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 px-2">
        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
          <Repeat className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h3 className="text-xl font-black tracking-tight">Recurring Issue Detector</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {issues.map((issue) => (
          <Card key={issue.id} className="group relative overflow-hidden border-none bg-white dark:bg-gray-800 shadow-glass hover:shadow-md transition-all rounded-[28px]">
            <CardContent className="p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h4 className="text-lg font-black tracking-tight group-hover:text-indigo-600 transition-colors">{issue.title}</h4>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                      <Clock className="h-3 w-3" /> First seen: {issue.firstSeen}
                    </span>
                  </div>
                </div>
                <Badge className={cn(
                  "font-black uppercase tracking-widest text-[9px] border-none px-3 py-1",
                  issue.trend === 'up' ? "bg-rose-50 text-rose-600" : "bg-indigo-50 text-indigo-600"
                )}>
                  {issue.trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : <Repeat className="h-3 w-3 mr-1" />}
                  {issue.trend === 'up' ? 'Increasing' : 'Repeating'}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-border">
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Occurrences</p>
                  <p className="text-xl font-black">{issue.count}</p>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-border">
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Impact</p>
                  <p className={cn("text-sm font-black uppercase", issue.impact === 'High' ? 'text-rose-600' : 'text-amber-600')}>{issue.impact}</p>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-border">
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Frequency</p>
                  <p className="text-sm font-black uppercase">{issue.frequency}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Persisting for 3 weeks</span>
                <button className="text-indigo-600 font-black text-[10px] uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                  View Pattern <ArrowRight className="h-3 w-3" />
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