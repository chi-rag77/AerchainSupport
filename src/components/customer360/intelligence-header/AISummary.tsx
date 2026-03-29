"use client";

import React from 'react';
import { Brain, Sparkles, Info, ChevronRight, Ticket, User, Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AISummary as AISummaryType } from '@/features/customer360/types';
import { cn } from '@/lib/utils';

interface AISummaryProps {
  summary: AISummaryType;
  confidence: number;
  explainability: string;
}

const AISummary = ({ summary, confidence, explainability }: AISummaryProps) => {
  const GridSection = ({ title, content, icon: Icon, className }: any) => (
    <div className={cn("p-6 space-y-3", className)}>
      <div className="flex items-center gap-2 text-muted-foreground/70">
        <Icon className="h-3.5 w-3.5" />
        <h5 className="text-[10px] font-bold uppercase tracking-widest">{title}</h5>
      </div>
      <div className="space-y-2">
        {Array.isArray(content) ? (
          content.map((item, i) => (
            <div key={i} className="flex items-start gap-2 text-xs font-medium text-foreground/90 leading-relaxed">
              <div className="h-1 w-1 rounded-full bg-muted-foreground/40 mt-1.5 shrink-0" />
              {item}
            </div>
          ))
        ) : (
          <p className="text-xs font-medium text-foreground/90 leading-relaxed">{content}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="rounded-2xl border border-border bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-gray-50/30 dark:bg-gray-800/30">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
            <Brain className="h-4 w-4" />
          </div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-700 dark:text-indigo-400">
            AI CUSTOMER INTELLIGENCE
          </h4>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-16 h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500" style={{ width: `${confidence}%` }} />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground">{confidence}% confidence • 542 tickets</span>
          </div>
        </div>
      </div>
      
      {/* 2x2 Grid */}
      <div className="grid grid-cols-2 divide-x divide-y divide-border/50">
        <GridSection 
          title="STATUS" 
          content={summary.status} 
          icon={Info} 
        />
        <GridSection 
          title="KEY DRIVERS" 
          content={summary.key_drivers} 
          icon={Sparkles} 
        />
        <GridSection 
          title="TOP ISSUES" 
          content={summary.top_issues} 
          icon={Sparkles} 
        />
        <GridSection 
          title="RECOMMENDED ACTIONS" 
          content={summary.recommended_actions} 
          icon={ChevronRight} 
        />
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-border bg-gray-50/30 dark:bg-gray-800/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 rounded-lg font-bold text-[10px] uppercase tracking-widest gap-2 bg-white">
            <Ticket className="h-3.5 w-3.5" /> View tickets
          </Button>
          <Button variant="outline" size="sm" className="h-8 rounded-lg font-bold text-[10px] uppercase tracking-widest gap-2 bg-white">
            <User className="h-3.5 w-3.5" /> Notify owner
          </Button>
          <Button variant="outline" size="sm" className="h-8 rounded-lg font-bold text-[10px] uppercase tracking-widest gap-2 bg-white text-red-600 border-red-100 hover:bg-red-50">
            <Bell className="h-3.5 w-3.5" /> Escalate
          </Button>
        </div>
        <button className="text-[10px] font-bold text-muted-foreground hover:text-indigo-600 flex items-center gap-1.5 uppercase tracking-widest">
          <Info className="h-3.5 w-3.5" /> Detailed reasoning
        </button>
      </div>
    </div>
  );
};

export default AISummary;