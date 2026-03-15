"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { invokeEdgeFunction } from '@/lib/apiClient';
import { IncidentExplorerData, IssueCluster } from '@/features/customer360/types';
import { Loader2, Search, Target, Sparkles } from 'lucide-react';
import IssueClusters from './IssueClusters';
import RecurringIssueDetector from './RecurringIssueDetector';
import IncidentTimeline from './IncidentTimeline';
import RootCauseInsights from './RootCauseInsights';
import InvestigationPanel from './InvestigationPanel';
import { motion } from 'framer-motion';

interface CustomerIncidentExplorerProps {
  customerName: string;
}

const CustomerIncidentExplorer = ({ customerName }: CustomerIncidentExplorerProps) => {
  const [selectedCluster, setSelectedCluster] = useState<IssueCluster | null>(null);

  const { data, isLoading, error } = useQuery<IncidentExplorerData, Error>({
    queryKey: ['customerIncidentExplorer', customerName],
    queryFn: () => invokeEdgeFunction('get-customer-incident-explorer', {
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
        <span className="font-black text-muted-foreground uppercase tracking-widest text-xs">Initializing Incident Explorer...</span>
      </div>
    );
  }

  if (error || !data || (data as any).empty) {
    return null;
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
            <Search className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-black tracking-tight">Customer Incident Explorer</h3>
            <p className="text-sm font-medium text-muted-foreground">Interactive problem discovery & root cause analysis</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800">
          <Sparkles className="h-4 w-4 text-indigo-600" />
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700 dark:text-indigo-300">AI Pattern Recognition Active</span>
        </div>
      </div>

      {/* 1. Issue Clusters */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 px-1">
          <Target className="h-4 w-4 text-indigo-600" />
          <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Issue Clusters</h4>
        </div>
        <IssueClusters 
          clusters={data.clusters} 
          onInvestigate={setSelectedCluster} 
        />
      </div>

      {/* 2. Recurring Issues & Root Causes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <RecurringIssueDetector issues={data.recurringIssues} />
        <RootCauseInsights metrics={data.rootCauses} />
      </div>

      {/* 3. Incident Timeline */}
      <IncidentTimeline events={data.timeline} />

      {/* Investigation Drill-down */}
      <InvestigationPanel 
        isOpen={!!selectedCluster}
        onClose={() => setSelectedCluster(null)}
        cluster={selectedCluster}
      />
    </div>
  );
};

export default CustomerIncidentExplorer;