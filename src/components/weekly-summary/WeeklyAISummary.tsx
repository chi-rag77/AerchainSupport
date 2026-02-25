"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Sparkles, TrendingUp, ShieldCheck, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { WeeklyAIAnalysis } from '@/features/weekly-summary/types';

interface WeeklyAISummaryProps {
  analysis: WeeklyAIAnalysis | undefined;
  isLoading: boolean;
}

const WeeklyAISummary = ({ analysis, isLoading }: WeeklyAISummaryProps) => {
  if (isLoading) {
    return (
      <Card className="rounded-[32px] border-none bg-indigo-600 h-64 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-white/60">
          <Brain className="h-10 w-10 animate-pulse" />
          <p className="font-bold tracking-widest uppercase text-xs">Synthesizing Weekly Intelligence...</p>
        </div>
      </Card>
    );
  }

  if (!analysis) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="relative overflow-hidden rounded-[32px] border-none bg-indigo-600 text-white shadow-glass-glow">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Brain className="h-48 w-48" />
        </div>

        <CardHeader className="p-8 pb-4">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <Badge className="bg-white/20 text-white border-none font-black uppercase tracking-widest text-[10px]">
                Executive AI Narrative
              </Badge>
            </div>
            <Badge variant="outline" className="text-white border-white/30 font-bold">
              {analysis.confidence}% Confidence
            </Badge>
          </div>
          <CardTitle className="text-2xl font-black tracking-tight leading-relaxed max-w-4xl">
            {analysis.summary}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-8 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">Top Issues This Week</h4>
              <div className="space-y-2">
                {analysis.topIssues.map((issue, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-300" />
                    <span className="text-sm font-semibold">{issue}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">Account Sentiment</h4>
              <div className="p-5 rounded-[24px] bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-3xl font-black tracking-tighter">{analysis.sentiment}</span>
                  <p className="text-xs font-medium text-indigo-200">Based on interaction patterns</p>
                </div>
                <div className="p-3 rounded-2xl bg-white/20">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default WeeklyAISummary;