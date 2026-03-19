"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Sparkles, Target, Zap, Info, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface AIInsightPanelProps {
  insights: {
    keyPoints: string[];
    rootCause: string;
    recommendations: string[];
  };
}

const AIInsightPanel = ({ insights }: AIInsightPanelProps) => {
  return (
    <Card className="border-none shadow-glass-glow rounded-[32px] bg-indigo-600 text-white overflow-hidden h-full flex flex-col">
      <CardHeader className="p-8 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <Badge className="bg-white/20 text-white border-none font-black uppercase tracking-widest text-[9px]">
            AI Intelligence Brief
          </Badge>
        </div>
        <CardTitle className="text-2xl font-black tracking-tight">Weekly Insights</CardTitle>
      </CardHeader>

      <CardContent className="p-8 pt-0 space-y-8 flex-grow">
        {/* Key Insights */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">Key Observations</h4>
          <div className="space-y-3">
            {insights.keyPoints.map((point, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-3"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-300 mt-1.5 shrink-0" />
                <p className="text-sm font-bold leading-relaxed text-indigo-50">{point}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Root Cause */}
        <div className="p-6 rounded-[24px] bg-white/10 backdrop-blur-md border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-amber-300">
            <Target className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Root Cause Inference</span>
          </div>
          <p className="text-sm font-black leading-relaxed">
            {insights.rootCause}
          </p>
        </div>

        {/* Recommendations */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">Strategic Recommendations</h4>
          <div className="space-y-2">
            {insights.recommendations.map((rec, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <Zap className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span className="text-xs font-bold text-indigo-50">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      <div className="p-6 bg-indigo-700/50 border-t border-white/10">
        <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-200">
          <Sparkles className="h-3 w-3" />
          Synthesized from 296 interactions
        </div>
      </div>
    </Card>
  );
};

export default AIInsightPanel;