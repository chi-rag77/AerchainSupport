"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { RecurringPattern } from '@/features/customer-pulse/types';
import { cn } from '@/lib/utils';
import { Repeat, TrendingUp, TrendingDown, Minus, ArrowRight, Sparkles, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface RecurringIssueDetectorProps {
  issues: RecurringPattern[];
}

const RecurringIssueDetector = ({ issues }: RecurringIssueDetectorProps) => {
  if (!issues || issues.length === 0) return null;

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3" />;
      case 'down': return <TrendingDown className="h-3 w-3" />;
      default: return <Minus className="h-3 w-3" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High': return "text-rose-600 bg-rose-50 dark:bg-rose-900/20";
      case 'Medium': return "text-amber-600 bg-amber-50 dark:bg-amber-900/20";
      default: return "text-green-600 bg-green-50 dark:bg-green-900/20";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
            <Repeat className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-xl font-black tracking-tight">Recurring Issue Radar</h3>
        </div>
        <Badge variant="outline" className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-200/50 font-bold text-[10px] uppercase tracking-widest">
          <Sparkles className="h-3 w-3 mr-1.5" /> AI Pattern Recognition Active
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {issues.slice(0, 4).map((issue, idx) => (
          <motion.div
            key={issue.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="group relative overflow-hidden border-none bg-white dark:bg-gray-900 shadow-glass hover:shadow-md transition-all duration-300 rounded-[28px]">
              <CardContent className="p-8 space-y-6">
                {/* Top: Name & Status */}
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <h4 className="text-lg font-black tracking-tight group-hover:text-indigo-600 transition-colors">
                      {issue.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                      <Clock className="h-3 w-3" /> First seen {issue.firstSeen}
                    </div>
                  </div>
                  <Badge className={cn(
                    "font-black uppercase tracking-widest text-[9px] border-none px-3 py-1 rounded-full flex items-center gap-1.5",
                    issue.trend === 'up' ? "bg-rose-50 text-rose-600" : "bg-indigo-50 text-indigo-600"
                  )}>
                    {getTrendIcon(issue.trend)}
                    {issue.trend === 'up' ? 'Increasing' : issue.trend === 'repeat' ? 'Repeating' : 'Stable'}
                  </Badge>
                </div>

                {/* Middle: Metrics Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-border/50">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Occurrences</p>
                    <p className="text-2xl font-black tracking-tighter">{issue.count}</p>
                  </div>
                  <div className={cn("p-4 rounded-2xl border border-border/50", getImpactColor(issue.impact))}>
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-70 mb-1">Impact</p>
                    <p className="text-sm font-black uppercase">{issue.impact}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-border/50">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Frequency</p>
                    <p className="text-sm font-black uppercase">{issue.frequency}</p>
                  </div>
                </div>

                {/* Bottom: Insight & Action */}
                <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                    <p className="text-xs font-medium text-muted-foreground italic line-clamp-1">
                      {issue.insight}
                    </p>
                  </div>
                  <button className="text-indigo-600 font-black text-[10px] uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all shrink-0">
                    View Pattern <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RecurringIssueDetector;