"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Sparkles, ArrowRight, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ExecutiveAISummaryProps {
  data: {
    narrative: string;
    highlights: { label: string; value: string; trend: number; type: 'positive' | 'negative' | 'neutral' }[];
  };
}

const ExecutiveAISummary = ({ data }: ExecutiveAISummaryProps) => {
  return (
    <Card className="relative overflow-hidden rounded-[32px] border-none bg-indigo-600 text-white shadow-glass-glow">
      {/* Animated Background Sheen */}
      <div className="absolute top-0 right-0 p-12 opacity-10">
        <Brain className="h-48 w-48" />
      </div>

      <CardHeader className="p-8 pb-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <Badge className="bg-white/20 text-white border-none font-black uppercase tracking-widest text-[10px]">
              AI Decision Engine 2.0
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 font-bold text-xs">
              Explain this
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 font-bold text-xs">
              Generate Report
            </Button>
          </div>
        </div>
        <CardTitle className="text-3xl font-black tracking-tight leading-tight max-w-4xl">
          {data.narrative}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-8 pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
          {data.highlights.map((h, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-5 rounded-[24px] bg-white/10 backdrop-blur-sm border border-white/10 space-y-2"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">
                {h.label}
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black tracking-tighter">{h.value}</span>
                <div className={cn(
                  "flex items-center text-xs font-bold px-2 py-0.5 rounded-full",
                  h.type === 'positive' ? "bg-green-400/20 text-green-300" : "bg-red-400/20 text-red-300"
                )}>
                  {h.trend > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {Math.abs(h.trend)}%
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExecutiveAISummary;