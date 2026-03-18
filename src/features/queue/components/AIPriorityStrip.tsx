"use client";

import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { 
  ArrowRight, TrendingUp, AlertTriangle, Zap 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AIPriorityStripProps {
  approachingSlaCount: number;
  recentEscalations: number;
  spikeModule: string;
  spikePercent: number;
}

const AIPriorityStrip = ({ approachingSlaCount, recentEscalations, spikeModule, spikePercent }: AIPriorityStripProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Card 
          className={cn(
            "relative overflow-hidden border-none bg-[#0B1220] text-white shadow-2xl rounded-[24px] p-1 transition-all duration-500",
            isHovered ? "shadow-indigo-500/20" : ""
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* 1. Layered Background Effects */}
          <motion.div 
            animate={{ 
              background: [
                "radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)",
                "radial-gradient(circle at 80% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)",
                "radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)"
              ]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 pointer-events-none"
          />

          <motion.div
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 4 }}
            className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 pointer-events-none"
          />

          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-6 px-6 py-4">
            
            {/* 2. AI System Label */}
            <div className="flex items-center gap-4 pr-6 border-r border-white/10">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 blur-md opacity-40 animate-pulse" />
                <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] shadow-lg">
                  <Zap className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">Live Intelligence</span>
                <span className="text-[8px] font-bold text-white/40 uppercase tracking-tighter">AI Detected • Real-time</span>
              </div>
            </div>

            {/* 3. Signal Grid */}
            <div className="flex-1 flex flex-wrap items-center gap-10">
              
              {/* SLA Risk Signal */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="relative">
                      <div className="absolute inset-0 bg-amber-500/20 blur-sm rounded-full" />
                      <AlertTriangle className="h-4 w-4 text-[#F59E0B] relative z-10" />
                    </div>
                    <p className="text-sm font-medium text-white/90">
                      <span className="text-[#FBBF24] font-black">{approachingSlaCount} tickets</span> approaching SLA breach
                    </p>
                    <div className="flex gap-0.5 ml-1">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className={cn("h-3 w-1 rounded-full", i <= 3 ? "bg-[#F59E0B]" : "bg-white/10")} />
                      ))}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-[#1A1F2E] border-white/10 text-white p-3 rounded-xl shadow-2xl">
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-amber-400">SLA Risk Breakdown</p>
                    <ul className="text-[10px] space-y-1 text-white/70">
                      <li>• 5 tickets due in less than 1 hour</li>
                      <li>• 7 tickets inactive more than 2 hours</li>
                    </ul>
                  </div>
                </TooltipContent>
              </Tooltip>

              {/* Escalation Signal */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="relative flex items-center justify-center">
                      <motion.div 
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute h-4 w-4 bg-rose-500 rounded-full"
                      />
                      <div className="h-2 w-2 bg-rose-500 rounded-full relative z-10" />
                    </div>
                    <p className="text-sm font-medium text-white/90">
                      <span className="text-[#F87171] font-black">{recentEscalations} customers</span> escalated in last 30m
                    </p>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-[#1A1F2E] border-white/10 text-white p-3 rounded-xl shadow-2xl">
                  <p className="text-[10px] font-medium">High-risk sentiment detected in recent replies from 3 key accounts.</p>
                </TooltipContent>
              </Tooltip>

              {/* Spike Signal */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="p-1 rounded-lg bg-emerald-500/10">
                      <TrendingUp className="h-4 w-4 text-[#10B981]" />
                    </div>
                    <p className="text-sm font-medium text-white/90">
                      Spike in <span className="text-[#34D399] font-black">"{spikeModule}"</span> (+{spikePercent}%)
                    </p>
                    <div className="flex items-end gap-0.5 h-4 ml-1">
                      {[3, 5, 4, 7, 9].map((h, i) => (
                        <motion.div 
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${h * 10}%` }}
                          className="w-1 bg-[#10B981] rounded-t-full" 
                        />
                      ))}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-[#1A1F2E] border-white/10 text-white p-3 rounded-xl shadow-2xl">
                  <p className="text-[10px] font-medium">Volume for {spikeModule} is 27% higher than the 7-day rolling average.</p>
                </TooltipContent>
              </Tooltip>

            </div>

            {/* 4. Action Button */}
            <Button className="bg-white text-[#0B1220] hover:bg-indigo-50 font-black text-[10px] uppercase tracking-widest h-11 px-8 rounded-xl gap-2 shadow-xl transition-all hover:scale-105 active:scale-95">
              Take Action <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </motion.div>
    </TooltipProvider>
  );
};

export default AIPriorityStrip;