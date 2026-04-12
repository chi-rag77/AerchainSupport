"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Tag, TrendingUp, Sparkles } from 'lucide-react';

interface CategoryBreakdownProps {
  categories: {
    label: string;
    count: number;
    color: string;
    percent: number;
  }[];
  trendingIssue: string;
}

const CategoryBreakdown = ({ categories, trendingIssue }: CategoryBreakdownProps) => {
  return (
    <div className="space-y-3">
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-2">Tickets by Category</h3>
      
      <Card className="border-none shadow-glass rounded-[28px] bg-white dark:bg-gray-900 overflow-hidden h-full">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-3">
            {categories.map((cat) => (
              <div key={cat.label} className="space-y-1.5">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-2">
                    <div className={cn("h-1.5 w-1.5 rounded-full", cat.color)} />
                    <span className="text-[11px] font-bold text-foreground/80">{cat.label}</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs font-black">{cat.count}</span>
                    <span className="text-[9px] font-bold text-muted-foreground">{cat.percent}%</span>
                  </div>
                </div>
                <div className="h-1 w-full bg-gray-50 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full", cat.color)} style={{ width: `${cat.percent}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-[20px] bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 space-y-2">
            <div className="flex items-center gap-2 text-indigo-600">
              <TrendingUp className="h-3.5 w-3.5" />
              <span className="text-[9px] font-black uppercase tracking-widest">Trending Issue</span>
            </div>
            <p className="text-[11px] font-bold text-indigo-900 dark:text-indigo-200 leading-tight">
              {trendingIssue}
            </p>
            <div className="flex items-center gap-1.5 text-[8px] font-black text-indigo-400 uppercase tracking-tighter">
              <Sparkles className="h-2.5 w-2.5" />
              Detected in 42% of recent tickets
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryBreakdown;