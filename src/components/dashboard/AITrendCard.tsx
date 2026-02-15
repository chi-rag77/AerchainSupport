"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Sparkles, AlertTriangle, CheckCircle2, Info, Loader2 } from 'lucide-react';
import { AIIntelligence, TrendSignals } from '@/features/dashboard-trend/types';
import { cn } from '@/lib/utils';

interface AITrendCardProps {
  intelligence: AIIntelligence | null | undefined;
  signals: TrendSignals | undefined;
  isLoading: boolean;
}

const AITrendCard = ({ intelligence, signals, isLoading }: AITrendCardProps) => {
  if (isLoading) {
    return (
      <Card className="h-full flex flex-col items-center justify-center p-8 text-muted-foreground border-none bg-gray-50/50 dark:bg-gray-900/50">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mb-4" />
        <p className="text-sm font-medium animate-pulse">AI is analyzing trend signals...</p>
      </Card>
    );
  }

  if (!intelligence || !signals) return null;

  const riskConfig = {
    LOW: { color: "text-green-600", bg: "bg-green-50", border: "border-green-200", icon: CheckCircle2 },
    MEDIUM: { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", icon: Info },
    HIGH: { color: "text-red-600", bg: "bg-red-50", border: "border-red-200", icon: AlertTriangle },
  }[signals.riskLevel];

  const RiskIcon = riskConfig.icon;

  return (
    <Card className={cn("h-full flex flex-col border-2 shadow-sm rounded-[24px] overflow-hidden", riskConfig.bg, riskConfig.border)}>
      <CardHeader className="p-6 pb-4">
        <div className="flex justify-between items-center mb-4">
          <div className="p-2 rounded-xl bg-white/80 dark:bg-gray-800/80 shadow-sm">
            <Brain className="h-5 w-5 text-indigo-600" />
          </div>
          <Badge variant="outline" className={cn("font-bold uppercase tracking-tighter text-[10px] border-none", riskConfig.bg, riskConfig.color)}>
            AI Trend Intelligence
          </Badge>
        </div>
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          Risk Level: <span className={riskConfig.color}>{signals.riskLevel}</span>
          <RiskIcon className={cn("h-5 w-5", riskConfig.color)} />
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6 pt-0 space-y-6 flex-grow">
        <div className="space-y-2">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Executive Summary</h4>
          <p className="text-sm font-medium leading-relaxed text-foreground/90">{intelligence.summary}</p>
        </div>

        <div className="space-y-2">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Root Cause Hypothesis</h4>
          <p className="text-sm text-muted-foreground leading-relaxed italic">"{intelligence.rootCause}"</p>
        </div>

        <div className="pt-4 border-t border-black/5 dark:border-white/5">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Recommended Action</h4>
          <div className="flex items-start gap-3 p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-white/20">
            <Sparkles className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm font-bold leading-snug">{intelligence.recommendedAction}</p>
          </div>
        </div>

        {intelligence.confidenceScore < 60 && (
          <p className="text-[10px] text-amber-600 font-bold flex items-center gap-1">
            <Info className="h-3 w-3" /> AI insight has low confidence.
          </p>
        )}
      </CardContent>

      <div className="p-4 bg-black/5 dark:bg-white/5 flex justify-between items-center">
        <span className="text-[10px] font-bold text-muted-foreground uppercase">Confidence Score</span>
        <span className="text-xs font-bold">{intelligence.confidenceScore}%</span>
      </div>
    </Card>
  );
};

export default AITrendCard;