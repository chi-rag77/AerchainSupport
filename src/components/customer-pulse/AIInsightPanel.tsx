"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Sparkles, Target, Zap, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AIInsightPanelProps {
  insights: {
    keyPoints: string[];
    rootCause: string;
    recommendations: string[];
  };
}

const AIInsightPanel = ({ insights }: AIInsightPanelProps) => {
  return (
    <Card className="border-none shadow-glass-glow rounded-[32px] bg-indigo-600 text-white overflow-hidden h-full flex flex-col max-h-[620px]">
      <CardHeader className="p-6 pb-4 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <Badge className="bg-white/20 text-white border-none font-black uppercase tracking-widest text-[9px]">
            AI Intelligence Brief
          </Badge>
        </div>
        <CardTitle className="text-xl font-black tracking-tight">Weekly Insights</CardTitle>
      </CardHeader>

      <ScrollArea className="flex-1">
        <CardContent className="p-6 pt-0 space-y-6">
          {/* Key Insights */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">Key Observations</h4>
            <div className="space-y-2.5">
              {insights.keyPoints.map((point, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-300 mt-1.5 shrink-0" />
                  <p className="text-xs font-bold leading-relaxed text-indigo-50">{point}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Root Cause */}
          <div className="p-5 rounded-[20px] bg-white/10 backdrop-blur-md border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-amber-300">
              <Target className="h-3.5 w-3.5" />
              <span className="text-[9px] font-black uppercase tracking-widest">Root Cause Inference</span>
            </div>
            <p className="text-xs font-black leading-relaxed">
              {insights.rootCause}
            </p>
          </div>

          {/* Recommendations */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">Strategic Recommendations</h4>
            <div className="space-y-2">
              {insights.recommendations.map((rec, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <Zap className="h-3 w-3 text-amber-400 shrink-0" />
                  <span className="text-[10px] font-bold text-indigo-50">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </ScrollArea>

      <div className="p-4 bg-indigo-700/50 border-t border-white/10 shrink-0">
        <div className="flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest text-indigo-200">
          <Sparkles className="h-3 w-3" />
          Synthesized from recent interactions
        </div>
      </div>
    </Card>
  );
};

export default AIInsightPanel;