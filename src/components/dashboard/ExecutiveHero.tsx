"use client";

import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Brain, Clock, ShieldCheck, Sparkles, ArrowRight, TrendingUp, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ExecutiveSummary } from '@/features/dashboard/types';

interface ExecutiveHeroProps {
  userName: string;
  slaRiskScore: number;
  lastSync: string;
  isSyncing: boolean;
  onSync: () => void;
  onViewInsights: () => void;
  summary: ExecutiveSummary | null;
}

const ExecutiveHero = ({ userName, slaRiskScore, lastSync, isSyncing, onSync, onViewInsights, summary }: ExecutiveHeroProps) => {
  const getRiskColor = (score: number) => {
    if (score < 40) return "bg-green-500";
    if (score < 75) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="relative w-full p-8 rounded-[32px] bg-white/60 dark:bg-gray-800/40 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 shadow-glass overflow-hidden space-y-8">
      {/* Background Glows */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        {/* Left: Greeting & Status */}
        <div className="space-y-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Welcome back, {userName}
            </h1>
            <p className="text-lg text-muted-foreground font-medium">Here is your operational intelligence overview.</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Badge variant="outline" className="bg-green-50/50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200/50 py-1.5 px-4 gap-2 rounded-full">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              AI Monitoring Active
            </Badge>
            <Badge variant="secondary" className="bg-white/50 dark:bg-gray-700/50 py-1.5 px-4 gap-2 rounded-full">
              <Clock className="h-3.5 w-3.5" />
              Last Synced: {format(new Date(lastSync), 'HH:mm')}
            </Badge>
          </div>
        </div>

        {/* Middle: SLA Risk Meter */}
        <div className="flex-1 max-w-md space-y-4 bg-white/30 dark:bg-black/10 p-6 rounded-2xl border border-white/20">
          <div className="flex justify-between items-end">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">SLA Breach Risk</span>
            <span className={cn("text-lg font-black", slaRiskScore > 75 ? "text-red-500" : "text-foreground")}>
              {slaRiskScore.toFixed(0)}%
            </span>
          </div>
          <div className="h-3 w-full bg-gray-200/50 dark:bg-gray-700/50 rounded-full overflow-hidden">
            <div 
              className={cn("h-full transition-all duration-1000 ease-out rounded-full", getRiskColor(slaRiskScore))}
              style={{ width: `${slaRiskScore}%` }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-tight">
            {slaRiskScore < 40 ? "Operations within safe margins." : "Immediate attention required for near-breach tickets."}
          </p>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <Button 
            onClick={onSync} 
            disabled={isSyncing}
            className="rounded-full bg-white dark:bg-gray-900 text-foreground border border-border hover:bg-gray-50 shadow-sm h-12 px-8 font-bold"
          >
            <RefreshCw className={cn("mr-2 h-4 w-4", isSyncing && "animate-spin")} />
            Sync Data
          </Button>
          <Button 
            onClick={onViewInsights}
            className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 h-12 px-8 font-bold"
          >
            <Brain className="mr-2 h-4 w-4" />
            AI Insights
          </Button>
        </div>
      </div>

      {/* Bottom: AI Executive Summary Section */}
      {summary && (
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6 border-t border-white/20">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="h-5 w-5" />
              <h3 className="text-sm font-black uppercase tracking-widest">AI Executive Summary</h3>
            </div>
            <p className="text-lg font-medium leading-relaxed text-foreground/90">
              {summary.summary}
            </p>
            <div className="flex flex-wrap gap-2">
              {summary.keyDrivers.map((driver, i) => (
                <Badge key={i} variant="secondary" className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-none px-3 py-1">
                  {driver}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="bg-indigo-600/5 dark:bg-indigo-400/5 rounded-2xl p-6 border border-indigo-600/10 space-y-3">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Zap className="h-4 w-4" />
              <h4 className="text-xs font-black uppercase tracking-widest">Recommended Action</h4>
            </div>
            <p className="text-sm font-bold leading-snug">
              {summary.executiveAction}
            </p>
            <div className="pt-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">AI Confidence: {summary.confidenceScore}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExecutiveHero;