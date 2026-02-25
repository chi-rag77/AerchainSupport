"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Sparkles, TrendingUp, ShieldCheck, AlertCircle, Zap, Target, Eye } from 'lucide-react';
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

  const points = [
    { 
      label: "Primary Improvement", 
      content: analysis.improvement, 
      icon: TrendingUp, 
      color: "text-green-400",
      bg: "bg-green-400/10"
    },
    { 
      label: "Primary Degradation", 
      content: analysis.degradation, 
      icon: AlertCircle, 
      color: "text-red-400",
      bg: "bg-red-400/10"
    },
    { 
      label: "Emerging Pattern", 
      content: analysis.pattern, 
      icon: Target, 
      color: "text-blue-400",
      bg: "bg-blue-400/10"
    },
    { 
      label: "Executive Attention Area", 
      content: analysis.attention, 
      icon: Eye, 
      color: "text-amber-400",
      bg: "bg-amber-400/10"
    },
  ];

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
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <Badge className="bg-white/20 text-white border-none font-black uppercase tracking-widest text-[10px]">
                Weekly Operational Intelligence
              </Badge>
            </div>
            <Badge variant="outline" className="text-white border-white/30 font-bold">
              {analysis.confidence || 94}% Confidence
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-8 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {points.map((point, i) => (
              <div key={i} className="flex items-start gap-4 p-5 rounded-[24px] bg-white/10 backdrop-blur-sm border border-white/10">
                <div className={cn("p-2 rounded-xl shrink-0", point.bg)}>
                  <point.icon className={cn("h-5 w-5", point.color)} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-200">
                    {point.label}
                  </h4>
                  <p className="text-sm font-bold leading-relaxed">
                    {point.content || "No significant data detected."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default WeeklyAISummary;