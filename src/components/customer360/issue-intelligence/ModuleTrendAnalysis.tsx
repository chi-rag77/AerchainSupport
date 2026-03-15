"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, ArrowRight, Activity } from 'lucide-react';

interface ModuleTrendAnalysisProps {
  moduleStats: any[];
}

const ModuleTrendAnalysis = ({ moduleStats }: ModuleTrendAnalysisProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 px-1">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
          <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-xl font-black tracking-tight">Module Trend Analysis</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {moduleStats.map((ms) => {
          const isImproving = ms.trend <= 0;
          const history = ms.history || [];
          
          return (
            <Card key={ms.name} className="border-none shadow-sm bg-white dark:bg-gray-800 rounded-2xl overflow-hidden group hover:shadow-md transition-all">
              <CardContent className="p-6 flex items-center justify-between gap-6">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black">{ms.name}</span>
                    <Badge className={cn(
                      "font-bold text-[10px] uppercase tracking-widest",
                      isImproving ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )}>
                      {isImproving ? <TrendingDown className="h-3 w-3 mr-1" /> : <TrendingUp className="h-3 w-3 mr-1" />}
                      {isImproving ? 'Improving' : 'Worsening'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 text-muted-foreground">
                    {history.slice(-4).map((count: number, i: number) => (
                      <React.Fragment key={i}>
                        <span className={cn(
                          "text-lg font-black",
                          i === history.slice(-4).length - 1 ? "text-foreground" : "opacity-40"
                        )}>
                          {count}
                        </span>
                        {i < history.slice(-4).length - 1 && <ArrowRight className="h-3 w-3 opacity-20" />}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Trend</p>
                  <p className={cn("text-xl font-black", isImproving ? "text-green-600" : "text-red-600")}>
                    {ms.trend > 0 ? '+' : ''}{ms.trend}%
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ModuleTrendAnalysis;