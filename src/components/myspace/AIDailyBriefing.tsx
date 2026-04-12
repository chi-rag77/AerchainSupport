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
            <span>Updated 5 min ago</span>
            <RefreshCw className="h-3 w-3 cursor-pointer hover:text-foreground transition-colors" />
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-medium leading-relaxed text-foreground/90">
            <span className="font-bold">Sarah</span>, you're having a <span className="font-bold">moderately busy</span> day. You have <span className="text-indigo-600 font-bold underline cursor-pointer">12 open tickets</span> with <span className="text-rose-600 font-bold underline cursor-pointer">3 urgent</span> needing immediate attention. Your avg resolution time this week is <span className="font-bold">2.3 hours</span> (vs team avg 2.8h—<span className="text-emerald-600 font-bold">you're ahead!</span>). Acme Corp ticket <span className="font-bold">#4521</span> has been open for 18 hours and is escalation-ready.
          </p>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/50">
            <div className="p-1.5 rounded-lg bg-white dark:bg-gray-800 shadow-sm shrink-0">
              <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <p className="text-sm font-medium text-foreground/80 leading-relaxed">
              <span className="font-bold text-emerald-700 dark:text-emerald-400">Focus:</span> Close urgent tickets first, then tackle the aging product issues. You're <span className="text-emerald-600 font-bold">on pace</span> to exceed daily targets.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIDailyBriefing;