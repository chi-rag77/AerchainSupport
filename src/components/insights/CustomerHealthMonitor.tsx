"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AccountHealth } from '@/features/insights/types';
import { Heart, ShieldAlert, TrendingUp, TrendingDown, AlertTriangle, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const CustomerHealthMonitor = ({ risks }: { risks: AccountHealth[] }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
          <Heart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        </div>
        <h3 className="text-xl font-black tracking-tight">Customer Health Intelligence</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {risks.map((risk, i) => (
          <Card key={i} className="rounded-[28px] border-none bg-white dark:bg-gray-800 shadow-sm overflow-hidden group">
            <div className={cn(
              "absolute left-0 top-0 h-full w-1.5",
              risk.healthScore < 50 ? "bg-red-500" : "bg-amber-500"
            )} />
            
            <CardContent className="p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h4 className="text-xl font-black tracking-tight">{risk.company}</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn(
                      "text-[10px] font-black uppercase tracking-widest border-2",
                      risk.sentimentTrend === 'worsening' ? "text-red-500 border-red-100" : "text-green-500 border-green-100"
                    )}>
                      {risk.sentimentTrend === 'worsening' ? <TrendingDown className="h-3 w-3 mr-1" /> : <TrendingUp className="h-3 w-3 mr-1" />}
                      Sentiment {risk.sentimentTrend}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Health Score</span>
                  <div className={cn("text-3xl font-black tracking-tighter", risk.healthScore < 50 ? "text-red-500" : "text-amber-500")}>
                    {risk.healthScore}/100
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Risk Signals</span>
                <div className="flex flex-wrap gap-2">
                  {risk.signals.map((s, j) => (
                    <Badge key={j} variant="secondary" className="bg-gray-100 dark:bg-gray-700 text-[10px] font-bold px-3 py-1 rounded-lg">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-bold text-red-600">{risk.churnProbability}% Churn Probability</span>
                </div>
                <Button variant="ghost" size="sm" className="rounded-full font-bold text-xs gap-1 hover:bg-indigo-50 hover:text-indigo-600">
                  Executive Alert <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CustomerHealthMonitor;