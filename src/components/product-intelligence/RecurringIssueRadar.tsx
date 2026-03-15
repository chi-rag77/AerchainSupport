"use client";

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invokeEdgeFunction } from '@/lib/apiClient';
import { RecurringIssueRadarData, RecurringIssueCluster } from '@/features/product-intelligence/types';
import { 
  Loader2, Repeat, Target, Sparkles, AlertTriangle, 
  RefreshCw, Inbox, LayoutGrid, BarChart3, ShieldAlert,
  Zap, Brain, ArrowRight, ExternalLink, Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import RecurringIssueCard from './RecurringIssueCard';
import RecurrenceTrendChart from './RecurrenceTrendChart';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';

interface RecurringIssueRadarProps {
  customerName?: string;
}

const RecurringIssueRadar = ({ customerName = 'All' }: RecurringIssueRadarProps) => {
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const queryKey = ['recurringIssueRadar', customerName];

  const { data, isLoading, error, isFetching } = useQuery<RecurringIssueRadarData, Error>({
    queryKey,
    queryFn: () => invokeEdgeFunction('get-recurring-issue-radar', {
      method: 'POST',
      body: { customerName },
    }),
    enabled: !!customerName,
    staleTime: 12 * 60 * 60 * 1000,
  });

  const refreshMutation = useMutation({
    mutationFn: () => invokeEdgeFunction<RecurringIssueRadarData>('get-recurring-issue-radar', {
      method: 'POST',
      body: { customerName, forceRefresh: true },
    }),
    onSuccess: (newData) => {
      queryClient.setQueryData(queryKey, newData);
      toast.success("Radar scan complete!");
    },
    onError: (err: any) => toast.error(`Scan failed: ${err.message}`)
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] rounded-[32px] bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-dashed border-indigo-200">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-2xl animate-pulse" />
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 relative z-10" />
        </div>
        <p className="mt-6 font-black text-muted-foreground uppercase tracking-[0.3em] text-[10px] animate-pulse">
          Synthesizing Product Intelligence...
        </p>
      </div>
    );
  }

  if (error || !data || (data as any).empty) {
    return (
      <div className="p-20 rounded-[32px] bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-dashed text-center space-y-6">
        <div className="h-20 w-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto">
          <Repeat className="h-10 w-10 text-indigo-600 opacity-20" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black tracking-tight">No Recurring Patterns</h3>
          <p className="text-muted-foreground max-w-md mx-auto font-medium">
            Your product operations are currently stable. No significant repeating issue clusters were detected in the recent history.
          </p>
        </div>
        <Button 
          onClick={() => refreshMutation.mutate()} 
          disabled={refreshMutation.isPending} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full px-8 h-12 shadow-lg shadow-indigo-500/20"
        >
          {refreshMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Force Deep Scan
        </Button>
      </div>
    );
  }

  const selectedCluster = data.clusters.find(c => c.id === selectedClusterId) || data.clusters[0];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-500/20">
            <Repeat className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-3xl font-black tracking-tighter text-foreground">AI Recurring Issue Radar</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="bg-indigo-50/50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-200/50 font-bold text-[10px] uppercase tracking-widest">
                <Sparkles className="h-3 w-3 mr-1.5" /> AI Pattern Recognition Active
              </Badge>
              <span className="text-xs font-medium text-muted-foreground">Analyzing {data.totalRecurringTickets} tickets</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end mr-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Global Trend</span>
            <div className={cn(
              "text-xl font-black flex items-center gap-1",
              data.globalTrend > 0 ? "text-rose-600" : "text-emerald-600"
            )}>
              {data.globalTrend > 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
              {Math.abs(data.globalTrend)}%
            </div>
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => refreshMutation.mutate()} 
            disabled={refreshMutation.isPending || isFetching} 
            className="rounded-full h-12 w-12 border-none bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all"
          >
            <RefreshCw className={cn("h-5 w-5", (refreshMutation.isPending || isFetching) && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Main Intelligence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Issue Feed (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Top Recurring Clusters</h4>
            <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground">
              <span className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-rose-500" /> High Impact</span>
              <span className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-amber-500" /> Medium</span>
              <span className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-emerald-500" /> Low</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.clusters.map((cluster, idx) => (
              <motion.div 
                key={cluster.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => setSelectedClusterId(cluster.id)}
              >
                <RecurringIssueCard 
                  cluster={cluster} 
                  isSelected={selectedCluster.id === cluster.id}
                  onViewTickets={(ids) => console.log("Viewing tickets:", ids)} 
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right: Live Intelligence Panel (4 cols) */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-8">
            <Card className="border-none shadow-glass rounded-[32px] bg-indigo-600 text-white overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Brain className="h-32 w-32" />
              </div>
              
              <CardHeader className="p-8 pb-4 relative z-10">
                <div className="flex justify-between items-center mb-4">
                  <Badge className="bg-white/20 text-white border-none font-black uppercase tracking-widest text-[9px]">
                    Live Intelligence
                  </Badge>
                  <span className="text-[10px] font-bold text-indigo-200">Confidence: {selectedCluster.confidence}%</span>
                </div>
                <CardTitle className="text-2xl font-black tracking-tight leading-tight">
                  {selectedCluster.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="p-8 pt-0 space-y-8 relative z-10">
                {/* Trend Chart Mini */}
                <div className="bg-white/10 backdrop-blur-md rounded-[24px] p-6 border border-white/10">
                  <RecurrenceTrendChart 
                    data={selectedCluster.history} 
                    title="" 
                  />
                </div>

                {/* Root Cause & Fix */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-indigo-200 flex items-center gap-2">
                      <Target className="h-3 w-3" /> Root Cause Inference
                    </h5>
                    <p className="text-sm font-bold leading-relaxed">
                      {selectedCluster.rootCause}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-amber-400 text-indigo-950 shadow-lg">
                    <h5 className="text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Zap className="h-3 w-3" /> Suggested Permanent Fix
                    </h5>
                    <p className="text-sm font-black leading-snug">
                      {selectedCluster.suggestedFix}
                    </p>
                  </div>
                </div>

                <Separator className="bg-white/10" />

                {/* Action Button */}
                <Button className="w-full h-14 rounded-2xl bg-white text-indigo-600 hover:bg-indigo-50 font-black uppercase tracking-widest text-xs gap-3 shadow-xl">
                  {selectedCluster.requiresEscalation ? (
                    <>
                      <ShieldAlert className="h-4 w-4" />
                      Escalate to Engineering
                    </>
                  ) : (
                    <>
                      <Activity className="h-4 w-4" />
                      Create Product Task
                    </>
                  )}
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Button>
              </CardContent>
            </Card>

            {/* Module Distribution Mini */}
            <Card className="border-none shadow-glass rounded-[32px] bg-white dark:bg-gray-800 p-8 space-y-6">
              <h5 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Affected Modules Distribution</h5>
              <div className="space-y-5">
                {data.moduleDistribution.slice(0, 4).map((m) => (
                  <div key={m.module} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-bold text-foreground">{m.module}</span>
                      <span className="text-xs font-black text-indigo-600">{m.percentage}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-900 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${m.percentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-indigo-600 rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RecurringIssueRadar;