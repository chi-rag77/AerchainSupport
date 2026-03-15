"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { invokeEdgeFunction } from '@/lib/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, Brain, Sparkles, TrendingUp, ShieldAlert, 
  Clock, Zap, Target, Loader2, AlertTriangle, ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ImpactTimelineChart from './ImpactTimelineChart';
import IssueHeatmap from './IssueHeatmap';
import { motion, AnimatePresence } from 'framer-motion';

interface JourneyImpactTimelineProps {
  customerName: string;
}

const JourneyImpactTimeline = ({ customerName }: JourneyImpactTimelineProps) => {
  const [selectedMonth, setSelectedMonth] = useState<any>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['customerJourneyImpact', customerName],
    queryFn: () => invokeEdgeFunction<any>('get-customer-journey-impact', {
      method: 'POST',
      body: { customerName },
    }),
    enabled: !!customerName,
    staleTime: 10 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 rounded-[32px] bg-white dark:bg-gray-800/50 border border-dashed">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
        <span className="font-black text-muted-foreground uppercase tracking-widest text-xs">Mapping Customer Journey...</span>
      </div>
    );
  }

  if (error || !data || data.empty) {
    return (
      <div className="p-12 text-center rounded-[32px] bg-gray-50 dark:bg-gray-900/50 border border-dashed">
        <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
        <h3 className="text-lg font-bold">No Journey Data</h3>
        <p className="text-sm text-muted-foreground">This customer has not created enough support interactions to map a journey.</p>
      </div>
    );
  }

  const currentMonth = selectedMonth || data.timeline[data.timeline.length - 1];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Section 1: Impact Timeline Graph */}
      <Card className="rounded-[32px] border-none bg-white dark:bg-gray-800 shadow-glass overflow-hidden">
        <CardHeader className="p-8 pb-0 flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
              <Activity className="h-6 w-6 text-indigo-600" />
              Customer Journey Impact
            </CardTitle>
            <p className="text-sm font-medium text-muted-foreground">Monthly experience impact score based on support signals</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-50 text-green-700 border-green-100 font-bold">Benefit</Badge>
            <Badge className="bg-amber-50 text-amber-700 border-amber-100 font-bold">Neutral</Badge>
            <Badge className="bg-red-50 text-red-700 border-red-100 font-bold">Pain</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <ImpactTimelineChart 
            data={data.timeline} 
            onMonthSelect={setSelectedMonth}
            selectedMonth={currentMonth.month}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Section 2: Monthly Breakdown */}
        <Card className="rounded-[28px] border-none bg-white dark:bg-gray-800 shadow-glass p-8 space-y-6">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h3 className="text-xl font-black">{currentMonth.label}</h3>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Monthly Performance</p>
            </div>
            <div className={cn(
              "h-12 w-12 rounded-2xl flex items-center justify-center text-xl font-black shadow-sm",
              currentMonth.impactScore > 0 ? "bg-green-100 text-green-700" : currentMonth.impactScore < 0 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
            )}>
              {currentMonth.impactScore > 0 ? '+' : ''}{currentMonth.impactScore}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-border">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1">Tickets</span>
              <span className="text-2xl font-black">{currentMonth.tickets}</span>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-border">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1">Escalations</span>
              <span className="text-2xl font-black text-red-600">{currentMonth.escalated}</span>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-border">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1">Fast Res.</span>
              <span className="text-2xl font-black text-green-600">{currentMonth.fastResolved}</span>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-border">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1">Avg Res.</span>
              <span className="text-2xl font-black">{currentMonth.avgResolutionHours}h</span>
            </div>
          </div>
        </Card>

        {/* Section 3 & 4: AI Journey Insight & Pattern Detection */}
        <Card className="lg:col-span-2 rounded-[28px] border-none bg-indigo-600 text-white shadow-glass-glow p-8 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-black tracking-tight">AI Journey Intelligence</h3>
              </div>
              <Badge className="bg-white/20 text-white border-none font-bold">
                <Sparkles className="h-3 w-3 mr-1.5" />
                Pattern Detection Active
              </Badge>
            </div>

            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-2">Executive Insight</h4>
                <p className="text-lg font-bold leading-tight">
                  {data.aiAnalysis?.journeyInsight || "Analyzing journey patterns..."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Detected Patterns</h4>
                  <div className="space-y-2">
                    {data.aiAnalysis?.patterns?.map((p: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-sm font-semibold">
                        <Target className="h-4 w-4 text-indigo-300 shrink-0" />
                        {p}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Risk Trajectory</h4>
                  <div className="p-4 rounded-xl bg-white/10 border border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className={cn(
                        "h-4 w-4",
                        data.aiAnalysis?.riskTrend?.trajectory === 'Improving' ? "text-green-400" : "text-red-400"
                      )} />
                      <span className="font-black uppercase text-xs">{data.aiAnalysis?.riskTrend?.trajectory}</span>
                    </div>
                    <p className="text-xs font-medium text-indigo-100">{data.aiAnalysis?.riskTrend?.reason}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Section 5: Issue Category Heatmap */}
      <IssueHeatmap timeline={data.timeline} modules={data.modules} />

      {/* Section 8: Impact Forecast */}
      <Card className="rounded-[32px] border-none bg-gray-900 text-white shadow-2xl p-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-12 opacity-5">
          <Zap className="h-48 w-48" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-black tracking-tight">Predictive Impact Forecast</h3>
            </div>
            <p className="text-sm text-gray-400 font-medium max-w-xl">
              Based on current unresolved backlog and sentiment velocity, we predict the next month's impact score.
            </p>
          </div>

          <div className="flex items-center gap-12">
            <div className="text-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-2">Next Month Score</span>
              <div className={cn(
                "text-5xl font-black tracking-tighter",
                (data.aiAnalysis?.forecast?.nextMonthScore || 0) > 0 ? "text-green-500" : "text-red-500"
              )}>
                {data.aiAnalysis?.forecast?.nextMonthScore > 0 ? '+' : ''}{data.aiAnalysis?.forecast?.nextMonthScore || 0}
              </div>
            </div>
            <div className="h-16 w-px bg-gray-800" />
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Primary Drivers</span>
              <div className="flex flex-wrap gap-2">
                {data.aiAnalysis?.forecast?.drivers?.map((d: string, i: number) => (
                  <Badge key={i} variant="outline" className="border-gray-700 text-gray-300 font-bold">
                    {d}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default JourneyImpactTimeline;