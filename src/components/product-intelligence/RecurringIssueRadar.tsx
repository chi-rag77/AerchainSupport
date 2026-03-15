"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { invokeEdgeFunction } from '@/lib/apiClient';
import { RecurringIssueRadarData, RecurringIssueCluster } from '@/features/product-intelligence/types';
import { 
  Loader2, Repeat, Target, Sparkles, AlertTriangle, 
  RefreshCw, Inbox, LayoutGrid, BarChart3, ShieldAlert
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import RecurringIssueCard from './RecurringIssueCard';
import RecurrenceTrendChart from './RecurrenceTrendChart';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

interface RecurringIssueRadarProps {
  customerName?: string;
}

const RecurringIssueRadar = ({ customerName = 'All' }: RecurringIssueRadarProps) => {
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null);

  const { data, isLoading, error, refetch, isFetching } = useQuery<RecurringIssueRadarData, Error>({
    queryKey: ['recurringIssueRadar', customerName],
    queryFn: () => invokeEdgeFunction('get-recurring-issue-radar', {
      method: 'POST',
      body: { customerName },
    }),
    enabled: !!customerName,
    staleTime: 15 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 rounded-[32px] bg-white dark:bg-gray-800/50 border border-dashed border-indigo-200">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
        <span className="font-black text-muted-foreground uppercase tracking-widest text-xs">Scanning for Recurring Patterns...</span>
      </div>
    );
  }

  if (error || !data || (data as any).empty) {
    return (
      <div className="p-12 rounded-[32px] bg-gray-50 dark:bg-gray-900/50 border border-dashed text-center space-y-4">
        <Repeat className="h-12 w-12 text-muted-foreground mx-auto opacity-20" />
        <div className="space-y-1">
          <h3 className="text-lg font-bold">No Recurring Issues Detected</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Operational health is high. No significant repeating patterns found in the recent ticket history.
          </p>
        </div>
        <Button variant="link" onClick={() => refetch()} className="text-indigo-600 font-bold">
          Refresh Scan
        </Button>
      </div>
    );
  }

  const selectedCluster = data.clusters.find(c => c.id === selectedClusterId) || data.clusters[0];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
            <Repeat className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-black tracking-tight">AI Recurring Issue Radar</h3>
            <p className="text-sm font-medium text-muted-foreground">Detecting systemic product failures & operational loops</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800">
            <Sparkles className="h-4 w-4 text-indigo-600" />
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700 dark:text-indigo-300">AI Pattern Recognition Active</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => refetch()} disabled={isFetching} className="rounded-full">
            <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Top Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm bg-white dark:bg-gray-800 rounded-2xl p-6 flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600"><LayoutGrid className="h-5 w-5" /></div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Issue Clusters</p>
            <p className="text-2xl font-black">{data.clusters.length}</p>
          </div>
        </Card>
        <Card className="border-none shadow-sm bg-white dark:bg-gray-800 rounded-2xl p-6 flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-red-50 text-red-600"><ShieldAlert className="h-5 w-5" /></div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Critical Recurrence</p>
            <p className="text-2xl font-black">{data.clusters.filter(c => c.requiresEscalation).length}</p>
          </div>
        </Card>
        <Card className="border-none shadow-sm bg-white dark:bg-gray-800 rounded-2xl p-6 flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600"><Repeat className="h-5 w-5" /></div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Recurring Tickets</p>
            <p className="text-2xl font-black">{data.totalRecurringTickets}</p>
          </div>
        </Card>
        <Card className="border-none shadow-sm bg-white dark:bg-gray-800 rounded-2xl p-6 flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600"><BarChart3 className="h-5 w-5" /></div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Global Trend</p>
            <p className={cn("text-2xl font-black", data.globalTrend > 0 ? "text-red-600" : "text-green-600")}>
              {data.globalTrend > 0 ? '+' : ''}{data.globalTrend}%
            </p>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left: Top Recurring Issues List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 px-1">
            <Target className="h-4 w-4 text-indigo-600" />
            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Top Recurring Issues</h4>
          </div>
          <div className="grid grid-cols-1 gap-6">
            {data.clusters.map((cluster) => (
              <div key={cluster.id} onClick={() => setSelectedClusterId(cluster.id)} className="cursor-pointer">
                <RecurringIssueCard 
                  cluster={cluster} 
                  onViewTickets={(ids) => console.log("Viewing tickets:", ids)} 
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Deep Dive Panel */}
        <div className="space-y-10">
          <div className="sticky top-24 space-y-10">
            {/* Trend Chart */}
            <Card className="border-none shadow-glass rounded-[32px] bg-white dark:bg-gray-800 p-8">
              <RecurrenceTrendChart 
                data={selectedCluster.history} 
                title={selectedCluster.title} 
              />
            </Card>

            {/* Affected Modules Breakdown */}
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Affected Modules</h4>
              <Card className="border-none shadow-glass rounded-[32px] bg-white dark:bg-gray-800 p-8 space-y-6">
                {data.moduleDistribution.map((m, i) => (
                  <div key={m.module} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-bold text-foreground">{m.module}</span>
                      <span className="text-sm font-black text-indigo-600">{m.percentage}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 dark:bg-gray-900 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${m.percentage}%` }}
                        className="h-full bg-indigo-600 rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecurringIssueRadar;