"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { invokeEdgeFunction } from '@/lib/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, Brain, Sparkles, TrendingUp, ShieldAlert, 
  Clock, Zap, Target, Loader2, AlertTriangle, ArrowRight, MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ImpactTimelineChart from './ImpactTimelineChart';
import SmartIssueHeatmap from '../issue-intelligence/SmartIssueHeatmap';
import IssueIntelligenceSummary from '../issue-intelligence/IssueIntelligenceSummary';
import IssueContributionCharts from '../issue-intelligence/IssueContributionCharts';
import InvestigationModal from '../issue-intelligence/InvestigationModal';
import { motion, AnimatePresence } from 'framer-motion';

interface JourneyImpactTimelineProps {
  customerName: string;
}

const JourneyImpactTimeline = ({ customerName }: JourneyImpactTimelineProps) => {
  const [selectedMonth, setSelectedMonth] = useState<any>(null);
  const [investigationData, setInvestigationData] = useState<any>(null);

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
  const topModule = data.moduleStats[0];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
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

      {/* Section 2: Issue Intelligence Summary */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
            <Brain className="h-5 w-5 text-indigo-600" />
          </div>
          <h3 className="text-xl font-black tracking-tight">Customer Issue Intelligence</h3>
        </div>
        
        <IssueIntelligenceSummary 
          totalTickets={data.timeline.reduce((acc: number, m: any) => acc + m.tickets, 0)}
          topModule={topModule?.name || 'N/A'}
          globalTrend={topModule?.trend || 0}
          escalations={data.moduleStats.reduce((acc: number, m: any) => acc + m.escalated, 0)}
        />
      </div>

      {/* Section 3: AI Support Insight Panel */}
      <Card className="rounded-[32px] border-none bg-indigo-600 text-white shadow-glass-glow p-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="p-4 rounded-[24px] bg-white/10 backdrop-blur-md shrink-0">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <div className="space-y-6 flex-1">
            <div className="space-y-2">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">AI Support Insight</h4>
              <p className="text-2xl font-bold leading-tight">
                {data.aiAnalysis?.executiveInsight || "Analyzing support patterns..."}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <h5 className="text-[10px] font-black uppercase tracking-widest text-indigo-200 flex items-center gap-2">
                  <Target className="h-3 w-3" /> Major Cause
                </h5>
                <p className="text-sm font-medium text-indigo-50 leading-relaxed">
                  {data.aiAnalysis?.majorCause || "Identifying root causes..."}
                </p>
              </div>
              <div className="space-y-2">
                <h5 className="text-[10px] font-black uppercase tracking-widest text-indigo-200 flex items-center gap-2">
                  <Zap className="h-3 w-3" /> Recommendation
                </h5>
                <p className="text-sm font-medium text-indigo-50 leading-relaxed">
                  {data.aiAnalysis?.recommendation || "Synthesizing actions..."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Section 4: Contribution & Severity Charts */}
      <IssueContributionCharts 
        moduleStats={data.moduleStats}
        severityCounts={data.severityCounts}
      />

      {/* Section 5: Smart Heatmap */}
      <SmartIssueHeatmap 
        timeline={data.timeline} 
        moduleStats={data.moduleStats}
        onInvestigate={(module, month, count) => setInvestigationData({ module, month, count })}
      />

      {/* Section 6: Resolution Performance */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
            <Clock className="h-5 w-5 text-green-600" />
          </div>
          <h3 className="text-xl font-black tracking-tight">Resolution Performance</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.moduleStats.slice(0, 3).map((ms: any) => (
            <Card key={ms.name} className="border-none shadow-sm bg-white dark:bg-gray-800 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">{ms.name}</span>
                <Badge variant="outline" className="font-bold">{ms.avgResolution} hrs</Badge>
              </div>
              <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full",
                    ms.avgResolution > 24 ? "bg-red-500" : ms.avgResolution > 12 ? "bg-amber-500" : "bg-green-500"
                  )} 
                  style={{ width: `${Math.min(100, (ms.avgResolution / 48) * 100)}%` }} 
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 font-medium">Avg. Resolution Time</p>
            </Card>
          ))}
        </div>
      </div>

      <InvestigationModal 
        isOpen={!!investigationData}
        onClose={() => setInvestigationData(null)}
        data={investigationData}
      />
    </div>
  );
};

export default JourneyImpactTimeline;