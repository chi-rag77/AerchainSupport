"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Sparkles, RefreshCw, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIDailyBriefingProps {
  briefing: {
    text: string;
    mood: string;
    recommendation: string;
  };
}

const AIDailyBriefing = ({ briefing }: AIDailyBriefingProps) => {
  // Helper to highlight keywords in the AI text
  const formatText = (text: string) => {
    if (!text) return "";
    
    // Simple regex to bold numbers or specific status words for visual density
    const parts = text.split(/(\d+|urgent|busy|ahead|on pace|critical|backlog)/gi);
    return parts.map((part, i) => {
      const lower = part.toLowerCase();
      if (/\d+/.test(part) || ['urgent', 'busy', 'ahead', 'on pace', 'critical', 'backlog'].includes(lower)) {
        return <span key={i} className="font-black text-indigo-600 dark:text-indigo-400">{part}</span>;
      }
      return part;
    });
  };

  return (
    <Card className="border border-border/50 bg-white dark:bg-gray-900 rounded-[16px] shadow-sm overflow-hidden">
      <CardContent className="p-5 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-600 text-white shadow-sm">
              <Brain className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              Your day at a glance <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
            </h3>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-medium text-muted-foreground">
            <span className="text-lg">{briefing.mood || "📊"}</span>
            <div className="h-3 w-px bg-border" />
            <span>Updated just now</span>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-medium leading-relaxed text-foreground/90">
            {formatText(briefing.text)}
          </p>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/50">
            <div className="p-1.5 rounded-lg bg-white dark:bg-gray-800 shadow-sm shrink-0">
              <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <p className="text-sm font-medium text-foreground/80 leading-relaxed">
              <span className="font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest text-[10px] mr-2">Focus:</span> 
              {briefing.recommendation}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIDailyBriefing;