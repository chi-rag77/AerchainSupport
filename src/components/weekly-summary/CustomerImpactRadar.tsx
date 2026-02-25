"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';
import { Target, TrendingUp, TrendingDown, Minus, Users, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const CustomerImpactRadar = ({ radar }: { radar: any[] }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
          <Target className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h3 className="text-xl font-black tracking-tight">Customer Impact Radar</h3>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {radar.map((item, i) => (
          <Card key={i} className="border-none bg-white dark:bg-gray-800 shadow-sm rounded-[24px] p-6 group hover:shadow-md transition-all">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4 flex-1">
                <div className="h-12 w-12 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-black text-indigo-600">
                  {item.company.substring(0, 2).toUpperCase()}
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-bold">{item.company}</h4>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3" /> {item.volume} Tickets
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> Health: {item.score}/100
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Momentum</span>
                  <div className={cn(
                    "flex items-center justify-end gap-1.5 font-black text-sm uppercase tracking-widest",
                    item.status === 'improving' ? "text-green-600" : item.status === 'at-risk' ? "text-red-600" : "text-blue-600"
                  )}>
                    {item.status === 'improving' ? <TrendingUp className="h-4 w-4" /> : item.status === 'at-risk' ? <TrendingDown className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                    {item.status}
                  </div>
                </div>
                <div className="h-10 w-px bg-gray-100 dark:bg-gray-700" />
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sentiment Δ</span>
                  <div className={cn("text-lg font-black", item.sentimentDelta > 0 ? "text-green-600" : "text-red-600")}>
                    {item.sentimentDelta > 0 ? '+' : ''}{item.sentimentDelta}%
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CustomerImpactRadar;