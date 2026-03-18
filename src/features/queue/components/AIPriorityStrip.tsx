"use client";

import React from 'react';
import { Card } from "@/components/ui/card";
import { Brain, Sparkles, ArrowRight, ShieldAlert, Zap, TrendingUp, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

interface AIPriorityStripProps {
  approachingSlaCount: number;
  recentEscalations: number;
  spikeModule: string;
  spikePercent: number;
}

const AIPriorityStrip = ({ approachingSlaCount, recentEscalations, spikeModule, spikePercent }: AIPriorityStripProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className="relative overflow-hidden border-none bg-slate-900 text-white shadow-2xl rounded-[24px] p-1">
        {/* Animated Background Glow */}
        <div className="absolute top-0 right-0 p-12 opacity-20">
          <Brain className="h-32 w-32 text-indigo-400 animate-pulse" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-6 px-6 py-4">
          <div className="flex items-center gap-3 pr-6 border-r border-white/10">
            <div className="p-2 rounded-xl bg-indigo-600 shadow-lg shadow-indigo-500/40">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">Live Intelligence</span>
          </div>

          <div className="flex-1 flex flex-wrap items-center gap-8">
            <div className="flex items-center gap-2.5">
              <div className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
              <p className="text-sm font-bold">
                <span className="text-amber-400">{approachingSlaCount} tickets</span> approaching SLA breach
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <AlertTriangle className="h-4 w-4 text-rose-500" />
              <p className="text-sm font-bold">
                <span className="text-rose-400">{recentEscalations} customers</span> escalated in last 30 mins
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <p className="text-sm font-bold">
                Spike in <span className="text-emerald-400">"{spikeModule}"</span> (+{spikePercent}%)
              </p>
            </div>
          </div>

          <Button className="bg-white text-slate-900 hover:bg-indigo-50 font-black text-[10px] uppercase tracking-widest h-10 px-6 rounded-xl gap-2 shadow-xl">
            Take Action <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default AIPriorityStrip;