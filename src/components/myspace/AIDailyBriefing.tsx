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
    <Card className="relative overflow-hidden border-none bg-gradient-to-br from-indigo-50/40 to-emerald-50/20 dark:from-indigo-950/10 dark:to-emerald-950/5 rounded-[28px] shadow-sm group">
      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-700">
        <Brain className="h-24 w-24" />
      </div>

      <CardContent className="p-6 space-y-5 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20">
              <Sparkles className="h-4 w-4" />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">Daily Intelligence Brief</h3>
          </div>
          <div className="text-2xl">{briefing.mood}</div>
        </div>

        <div className="space-y-4">
          <p className="text-lg font-medium leading-relaxed text-foreground/90 italic max-w-5xl">
            "{briefing.text}"
          </p>

          <div className="flex items-start gap-3 p-4 rounded-[20px] bg-white/60 dark:bg-gray-900/60 backdrop-blur-md border border-indigo-100/50 dark:border-indigo-900/50 shadow-sm max-w-3xl">
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-600 shrink-0">
              <Target className="h-3.5 w-3.5" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] font-black uppercase tracking-widest text-amber-600">Strategic Focus</span>
              <p className="text-xs font-bold text-foreground/80 leading-relaxed">
                {briefing.recommendation}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-40">
          <Info className="h-3 w-3" />
          Synthesized by Gemini 2.5 Flash • Real-time Data
        </div>
      </CardContent>
    </Card>
  );
};

export default AIDailyBriefing;