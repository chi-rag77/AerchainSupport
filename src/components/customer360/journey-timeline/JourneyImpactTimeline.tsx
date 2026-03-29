"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { invokeEdgeFunction } from '@/lib/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, Brain, Sparkles, TrendingUp, ShieldAlert, 
  Clock, Zap, Target, Loader2, AlertTriangle, ArrowRight, MessageSquare,
  ListFilter
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

  if (error || !data || data.empty || !data.timeline || data.timeline.length === 0) {
    return (
      <div className="p-12 text-center rounded-[32px] bg-gray-50 dark:bg-gray-900/50 border border-dashed">
        <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
        <h3 className="text-lg font-bold">No Journey Data</h3>
        <p className="text-sm text-muted-foreground">This customer has not created enough support interactions to map a journey.</p>
      </div>
    );
  }

  const currentMonth = selectedMonth || data.timeline[data.timeline.length - 1];
  const topModule = data.moduleStats && data.moduleStats.length > 0 ? data.moduleStats[0] : null;

  return (
    <div className="space-y-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. Issue Intelligence Summary */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
            <Target className="h-5 w-5 text-indigo-600" />
          </div>
          <h3 className="text-xl font-black tracking-tight">Issue Intelligence</h3>
        </div>
        
        <IssueIntelligenceSummary 
          totalTickets={data.timeline.reduce((acc: number, m: any) => acc + m.tickets, 0)}
          topModule={topModule?.name || 'N/A'}
          globalTrend={topModule?.trend || 0}
          escalations={data.moduleStats ? data.moduleStats.reduce((acc: number, m: any) => acc + m.escalated, 0) : 0}
        />
      </div>

      {/* 2. Issue Contribution Charts */}
      {data.moduleStats && data.severityCounts && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-indigo-50/30 dark:bg-indigo-950/10 border border-indigo-100/50 flex items-start gap-3">
            <Sparkles className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
            <p className="text-sm font-bold text-indigo-900 dark:text-indigo-200 leading-relaxed">
              {topModule?.name} module is causing {Math.round((topModule?.total / data.timeline.reduce((acc: number, m: any) => acc + m.tickets, 0)) * 100)}% of issues → main driver. Other modules are stable.
            </p>
          </div>
          <IssueContributionCharts 
            moduleStats={data.moduleStats}
            severityCounts={data.severityCounts}
          />
        </div>
      )}

      {/* 3. Smart Issue Heatmap */}
      {data.moduleStats && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-amber-50/30 dark:bg-amber-950/10 border border-amber-100/50 flex items-start gap-3">
            <ListFilter className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm font-bold text-amber-900 dark:text-amber-200 leading-relaxed">
              Most issues are LOW severity indicating operational inefficiency, but CRITICAL issues in {topModule?.name} are still significant.
            </p>
          </div>
          <SmartIssueHeatmap 
            timeline={data.timeline} 
            moduleStats={data.moduleStats}
            onInvestigate={(module, month, count) => setInvestigationData({ module, month, count })}
          />
        </div>
      )}

      <InvestigationModal 
        isOpen={!!investigationData}
        onClose={() => setInvestigationData(null)}
        data={investigationData}
      />
    </div>
  );
};

export default JourneyImpactTimeline;