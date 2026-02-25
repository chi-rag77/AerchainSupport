"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';
import { Brain, TrendingUp, ShieldAlert, Sparkles, Activity, Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const StabilityForecast = ({ data, friction, efficiency }: { data: any, friction: number, efficiency: number }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Advanced Metrics */}
      <Card className="rounded-[32px] border-none bg-white dark:bg-gray-800 shadow-glass p-8 space-y-8">
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Operational Friction Index</span>
              <div className="text-4xl font-black tracking-tighter">{friction}</div>
            </div>
            <Activity className="h-6 w-6 text-indigo-500 opacity-50" />
          </div>
          <p className="text-xs text-muted-foreground font-medium leading-relaxed">
            Measures customer effort based on reopen rates and reply depth.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Support Efficiency Score</span>
              <div className="text-4xl font-black tracking-tighter text-green-600">{efficiency}%</div>
            </div>
            <Zap className="h-6 w-6 text-green-500 opacity-50" />
          </div>
          <p className="text-xs text-muted-foreground font-medium leading-relaxed">
            Productivity health based on resolution speed vs escalation depth.
          </p>
        </div>
      </Card>

      {/* 7-Day Forecast */}
      <Card className="lg:col-span-2 rounded-[32px] border-none bg-white dark:bg-gray-800 shadow-glass overflow-hidden flex flex-col">
        <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-black flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-500" />
              7-Day Stability Forecast
            </CardTitle>
            <p className="text-sm font-medium text-muted-foreground">Linear trend projection based on current volatility</p>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/30">
            <Brain className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
        </CardHeader>
        
        <CardContent className="p-8 pt-0 flex-grow space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Predicted SLA Next Week</span>
              <div className="text-5xl font-black tracking-tighter text-indigo-600">{data.nextWeekSla}%</div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-2 text-amber-600 border-amber-100">
                  Potential 4% Decline
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Breach Probability</span>
                <span className="text-sm font-black text-red-500">{Math.round(data.probability * 100)}%</span>
              </div>
              <Progress value={data.probability * 100} className="h-2" indicatorClassName="bg-red-500" />
            </div>
          </div>

          <div className="p-6 rounded-[24px] bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
              <p className="text-sm font-bold leading-relaxed text-indigo-900 dark:text-indigo-200">
                {data.narrative}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StabilityForecast;