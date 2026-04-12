"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Tag, TrendingUp } from 'lucide-react';

interface CategoryBreakdownProps {
  categories: any[];
}

const CategoryBreakdown = ({ categories }: CategoryBreakdownProps) => {
  return (
    <Card className="border border-border/50 bg-white dark:bg-gray-900 rounded-[16px] shadow-sm overflow-hidden h-[320px] flex flex-col">
      <CardHeader className="p-5 pb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-600 text-white shadow-sm">
            <Tag className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold">Tickets by Category</CardTitle>
            <p className="text-[10px] font-medium text-muted-foreground">Distribution across your queue</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-5 pt-0 space-y-5">
            {categories.map((cat) => (
              <div key={cat.label} className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className={cn("h-2 w-2 rounded-full", cat.color)} />
                    <span className="text-xs font-bold text-foreground/80">{cat.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-muted-foreground">{cat.percent}%</span>
                    <span className="text-xs font-black text-foreground">{cat.count}</span>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full", cat.color)} style={{ width: `${cat.percent}%` }} />
                </div>
                {cat.trending && (
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground uppercase tracking-tighter pl-4">
                    <TrendingUp className="h-2.5 w-2.5 text-indigo-500" />
                    Trending: {cat.trending}
                  </div>
                )}
              </div>
            ))}
            {categories.length === 0 && (
              <div className="p-12 text-center text-xs text-muted-foreground italic">
                No category data available.
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default CategoryBreakdown;