"use client";

import React from 'react';
import { 
  Brain, Sparkles, Info, ChevronRight, Ticket, 
  User, Bell, CheckCircle2, AlertCircle, 
  TrendingDown, Zap, ShieldAlert, Target,
  ArrowRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AISummary as AISummaryType } from '@/features/customer360/types';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface AISummaryProps {
  summary: AISummaryType;
  confidence: number;
  explainability: string;
}

const AISummary = ({ summary, confidence, explainability }: AISummaryProps) => {
  const GridSection = ({ title, content, icon: Icon, colorClass, className }: any) => (
    <div className={cn("p-6 space-y-4", className)}>
      <div className="flex items-center gap-2">
        <div className={cn("p-1.5 rounded-lg", colorClass)}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">{title}</h5>
      </div>
      <div className="space-y-2.5">
        {content.map((item: string, i: number) => (
          <div key={i} className="flex items-start gap-2 text-[13px] font-medium text-foreground/90 leading-relaxed">
            <div className={cn("h-1.5 w-1.5 rounded-full mt-1.5 shrink-0", colorClass.split(' ')[1].replace('text-', 'bg-'))} />
            {item}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* 1. Signal Strip - Instant Scanning */}
      <div className="flex flex-wrap gap-3">
        {summary.signals?.map((signal, i) => (
          <Badge 
            key={i} 
            variant="outline" 
            className={cn(
              "h-8 px-4 rounded-full font-bold text-[10px] uppercase tracking-widest gap-2 border-none shadow-sm transition-all hover:scale-105",
              signal.severity === 'critical' ? "bg-rose-50 text-rose-700" : 
              signal.severity === 'warning' ? "bg-amber-50 text-amber-700" : "bg-indigo-50 text-indigo-700"
            )}
          >
            {signal.severity === 'critical' ? <AlertCircle className="h-3.5 w-3.5" /> : 
             signal.severity === 'warning' ? <TrendingDown className="h-3.5 w-3.5" /> : <Info className="h-3.5 w-3.5" />}
            {signal.label}
          </Badge>
        ))}
      </div>

      <div className="rounded-[28px] border border-border/50 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-8 py-5 border-b border-border/50 flex items-center justify-between bg-gray-50/30 dark:bg-gray-800/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-black tracking-tight text-foreground">AI EXECUTIVE SUMMARY</h4>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  {confidence}% Confidence • Based on 542 tickets
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-muted-foreground hover:text-indigo-600 transition-colors">
                      <Info className="h-3 w-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs p-4 rounded-2xl shadow-2xl border-none bg-white dark:bg-gray-900">
                    <p className="text-xs font-medium leading-relaxed">{explainability}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end gap-1.5">
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Risk Composition</span>
              <div className="flex h-1.5 w-48 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                {summary.risk_composition?.map((risk, i) => (
                  <div 
                    key={i} 
                    className={cn("h-full", risk.color)} 
                    style={{ width: `${risk.percentage}%` }} 
                  />
                ))}
              </div>
            </div>
            <Button variant="link" className="text-[10px] font-black uppercase tracking-widest text-indigo-600 p-0 h-auto hover:no-underline">
              Detailed Reasoning
            </Button>
          </div>
        </div>
        
        {/* 2x2 Grid - Newspaper Pattern */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-y divide-border/50">
          <GridSection 
            title="What's Going Well" 
            content={summary.good} 
            icon={CheckCircle2} 
            colorClass="bg-emerald-50 text-emerald-600"
          />
          <GridSection 
            title="What's Going Wrong" 
            content={summary.bad} 
            icon={AlertCircle} 
            colorClass="bg-rose-50 text-rose-600"
          />
          <GridSection 
            title="Top Issues (Root Causes)" 
            content={summary.issues} 
            icon={Target} 
            colorClass="bg-amber-50 text-amber-600"
          />
          <GridSection 
            title="What You Should Do" 
            content={summary.actions} 
            icon={Zap} 
            colorClass="bg-indigo-50 text-indigo-600"
            className="bg-indigo-50/10"
          />
        </div>

        {/* Dominant Issue Banner - The "Aha" Moment */}
        {summary.dominant_issue && (
          <div className="px-8 py-6 bg-rose-50/50 dark:bg-rose-950/20 border-t border-rose-100 dark:border-rose-900/50 flex items-center justify-between gap-8">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-rose-100 text-rose-600 shadow-sm">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h5 className="text-lg font-black tracking-tight text-rose-900 dark:text-rose-200">
                  🚨 {summary.dominant_issue.module} Module is causing {summary.dominant_issue.contribution}% of issues
                </h5>
                <p className="text-sm font-medium text-rose-700 dark:text-rose-300 opacity-80">
                  Impact: {summary.dominant_issue.impact}
                </p>
              </div>
            </div>
            <Button className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black uppercase tracking-widest text-[10px] h-11 px-8 gap-2 shadow-lg shadow-rose-500/20 shrink-0 transition-all hover:scale-105 active:scale-95">
              Investigate {summary.dominant_issue.module} Issues
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AISummary;