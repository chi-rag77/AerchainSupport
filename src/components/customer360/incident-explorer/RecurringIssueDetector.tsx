"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Repeat, AlertCircle, Sparkles } from 'lucide-react';
import { RecurringIssue } from '@/features/customer360/types';

interface RecurringIssueDetectorProps {
  issues: RecurringIssue[];
}

const RecurringIssueDetector = ({ issues }: RecurringIssueDetectorProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 px-1">
        <Repeat className="h-4 w-4 text-indigo-600" />
        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Recurring Issue Detector</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {issues.map((issue) => (
          <Card key={issue.id} className="border-none shadow-sm bg-indigo-50/30 dark:bg-indigo-950/10 rounded-[24px] overflow-hidden">
            <CardContent className="p-6 flex items-center justify-between gap-6">
              <div className="flex items-center gap-4 flex-1">
                <div className="p-3 rounded-2xl bg-white dark:bg-gray-800 shadow-sm">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
                <div className="space-y-1">
                  <h5 className="text-base font-bold text-foreground">{issue.title}</h5>
                  <p className="text-xs font-medium text-muted-foreground">
                    Detected <span className="text-indigo-600 font-bold">{issue.occurrenceCount} times</span> across {issue.ticketCount} tickets
                  </p>
                </div>
              </div>
              <Badge className="bg-indigo-600 text-white border-none font-black text-[10px] uppercase tracking-widest px-3 py-1">
                <Sparkles className="h-3 w-3 mr-1.5" />
                Pattern Detected
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RecurringIssueDetector;