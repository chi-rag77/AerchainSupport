"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, CheckCircle2, Sparkles, Search, Zap, Target, ShieldCheck } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const STEPS = [
  { 
    id: 1, 
    label: "Mapping interaction history", 
    icon: Search, 
    detail: "Scanning 296 recent ticket threads..." 
  },
  { 
    id: 2, 
    label: "Identifying behavioral patterns", 
    icon: Target, 
    detail: "Detecting anomalies in resolution velocity..." 
  },
  { 
    id: 3, 
    label: "Evaluating team efficiency", 
    icon: Zap, 
    detail: "Benchmarking against SLA commitments..." 
  },
  { 
    id: 4, 
    label: "Synthesizing strategic brief", 
    icon: Brain, 
    detail: "Generating executive recommendations..." 
  }
];

const IntelligenceLoader = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [ticketCount, setTicketCount] = useState(0);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 2500);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) return prev;
        return prev + Math.random() * 2;
      });
    }, 100);

    const ticketInterval = setInterval(() => {
      setTicketCount((prev) => (prev < 296 ? prev + Math.floor(Math.random() * 15) : 296));
    }, 50);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
      clearInterval(ticketInterval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F6F8FB] dark:bg-gray-950 p-6">
      <div className="w-full max-w-md space-y-10">
        
        {/* 1. Visual Pulse Core */}
        <div className="relative flex justify-center">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-indigo-500/20 rounded-full blur-3xl"
          />
          <div className="relative p-6 rounded-[32px] bg-white dark:bg-gray-900 shadow-2xl border border-indigo-100 dark:border-indigo-900">
            <Brain className="h-12 w-12 text-indigo-600 animate-pulse" />
            <motion.div 
              className="absolute -top-1 -right-1"
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="h-5 w-5 text-amber-400" />
            </motion.div>
          </div>
        </div>

        {/* 2. Live Thinking Feed */}
        <div className="space-y-6">
          <div className="space-y-4">
            {STEPS.map((step, idx) => {
              const isPast = idx < currentStep;
              const isCurrent = idx === currentStep;
              
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ 
                    opacity: isPast || isCurrent ? 1 : 0.3,
                    x: 0,
                    scale: isCurrent ? 1.02 : 1
                  }}
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-2xl transition-all duration-500",
                    isCurrent ? "bg-white dark:bg-gray-900 shadow-md border border-indigo-100 dark:border-indigo-800" : "bg-transparent"
                  )}
                >
                  <div className={cn(
                    "mt-0.5 p-1.5 rounded-lg shrink-0",
                    isPast ? "bg-green-50 text-green-600" : isCurrent ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "bg-gray-100 text-gray-400"
                  )}>
                    {isPast ? <CheckCircle2 className="h-4 w-4" /> : <step.icon className={cn("h-4 w-4", isCurrent && "animate-pulse")} />}
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <p className={cn(
                      "text-sm font-black uppercase tracking-widest",
                      isCurrent ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {step.label}
                    </p>
                    <AnimatePresence mode="wait">
                      {isCurrent && (
                        <motion.p
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 italic"
                        >
                          {step.detail}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* 3. Progress & Confidence Builder */}
        <div className="space-y-4 pt-4">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Synthesis Progress</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tighter">{Math.round(progress)}%</span>
                <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-none font-bold text-[9px] uppercase">
                  Confidence: 92%
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Data Integrity</span>
              <p className="text-xs font-bold text-green-600 flex items-center justify-end gap-1">
                <ShieldCheck className="h-3 w-3" /> Verified
              </p>
            </div>
          </div>
          
          <div className="relative h-2 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner">
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-400"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
            <motion.div
              animate={{ x: ['0%', '100%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="absolute top-0 left-0 h-full w-20 bg-white/30 skew-x-12"
            />
          </div>

          <div className="flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-50">
            <div className="h-1 w-1 rounded-full bg-indigo-500 animate-ping" />
            Analyzing {ticketCount} tickets in real-time
          </div>
        </div>

      </div>
    </div>
  );
};

export default IntelligenceLoader;