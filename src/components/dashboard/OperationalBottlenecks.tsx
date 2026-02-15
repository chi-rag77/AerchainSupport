"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bottleneck } from '@/features/dashboard/types';
import { cn } from '@/lib/utils';
import { AlertCircle, Clock, Repeat, Users, Sparkles, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'framer-motion';

const OperationalBottlenecks = ({ data }: { data: Bottleneck[] }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
          <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </div>
        <h3 className="text-xl font-bold tracking-tight">Operational Bottlenecks</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.map((item, i) => (
          <motion.div key={i} whileHover={{ y: -4 }}>
            <Card className={cn(
              "border-none shadow-glass rounded-[24px] overflow-hidden",
              item.impactLevel === 'high' ? "bg-red-50/50 dark:bg-red-950/20" : "bg-white dark:bg-gray-800"
            )}>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {item.category}
                  </span>
                  <Badge variant="outline" className={cn(
                    "text-[10px] font-bold",
                    item.trend > 0 ? "text-red-500 border-red-200" : "text-green-500 border-green-200"
                  )}>
                    {item.trend > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {Math.abs(item.trend)}%
                  </Badge>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black tracking-tighter">{item.count}</span>
                  <span className="text-xs font-bold text-muted-foreground">Tickets</span>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-700/50">
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-purple-500 shrink-0 mt-0.5" />
                    <p className="text-xs font-medium leading-relaxed italic text-muted-foreground">
                      "{item.aiInsight}"
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

import { Badge } from '@/components/ui/badge';
export default OperationalBottlenecks;