"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Sparkles, Zap, Target, Info } from 'lucide-react';
import { motion } from 'framer-motion';
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
    <Card className="relative overflow-hidden border-none bg-gradient-to-br from-indigo-50/50 to-emerald-50/30 dark:from-indigo-950/20 dark:to-emerald-950/10 rounded-[32px] shadow-sm group">
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
        <Brain className="h-32 w-32" />
      </div>

      <CardContent className="p-8 space-y-6 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">Your day at a glance</h3>
          </div>
          <div className="text-3xl">{briefing.mood}</div>
        </div>

        <div className="space-y-4 max-w-4xl">
          <p className="text-xl font-medium leading-relaxed text-foreground/90 italic">
            "{briefing.text}"
          </p>

          <div className="flex items-start gap-3 p-5 rounded-[24px] bg-white/60 dark:bg-gray-900/60 backdrop-blur-md border border-indigo-100/50 dark:border-indigo-900/50 shadow-sm">
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-600 shrink-0">
              <Target className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Strategic Focus</span>
              <p className="text-sm font-bold text-foreground/80 leading-relaxed">
                {briefing.recommendation}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-50">
          <Info className="h-3 w-3" />
          Synthesized by Gemini 2.5 Flash • Updated 2m ago
        </div>
      </CardContent>
    </Card>
  );
};

export default AIDailyBriefing;