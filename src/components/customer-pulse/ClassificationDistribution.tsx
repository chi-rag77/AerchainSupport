"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ClassificationDistributionProps {
  data: { label: string; count: number; color: string }[];
}

const ClassificationDistribution = ({ data }: ClassificationDistributionProps) => {
  const total = data.reduce((acc, item) => acc + item.count, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Volume Distribution</h4>
        <span className="text-[10px] font-bold text-muted-foreground">{total} Total Tickets</span>
      </div>

      <div className="space-y-4">
        {data.map((item, i) => {
          const percent = total > 0 ? Math.round((item.count / total) * 100) : 0;
          return (
            <div key={item.label} className="space-y-1.5">
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-2">
                  <div className={cn("h-1.5 w-1.5 rounded-full", item.color)} />
                  <span className="text-xs font-bold text-foreground/80">{item.label}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-black">{item.count}</span>
                  <span className="text-[10px] font-bold text-muted-foreground">{percent}%</span>
                </div>
              </div>
              <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                  className={cn("h-full rounded-full", item.color)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ClassificationDistribution;