"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Zap, Info } from 'lucide-react';
import { RootCauseMetric } from '@/features/customer360/types';

interface RootCauseInsightsProps {
  metrics: RootCauseMetric[];
}

const RootCauseInsights = ({ metrics }: RootCauseInsightsProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 px-1">
        <Zap className="h-4 w-4 text-amber-500" />
        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Root Cause Insights</h4>
      </div>

      <Card className="border-none shadow-glass rounded-[28px] bg-white dark:bg-gray-800 overflow-hidden">
        <CardContent className="p-8 space-y-8">
          <div className="space-y-6">
            {metrics.map((m) => (
              <div key={m.module} className="space-y-3">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <span className="text-sm font-black text-foreground">{m.module} Module</span>
                    <p className="text-xs font-medium text-muted-foreground">{m.context}</p>
                  </div>
                  <span className="text-lg font-black text-indigo-600">{m.percentage}%</span>
                </div>
                <Progress value={m.percentage} className="h-2" indicatorClassName="bg-indigo-600" />
              </div>
            ))}
          </div>

          <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-border flex items-start gap-3">
            <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs font-medium text-muted-foreground leading-relaxed">
              Root cause analysis is derived from ticket categorization and subject pattern clustering. 
              Focusing engineering efforts on the <span className="font-bold text-foreground">{metrics[0]?.module}</span> module could reduce overall ticket volume by up to {metrics[0]?.percentage}%.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RootCauseInsights;