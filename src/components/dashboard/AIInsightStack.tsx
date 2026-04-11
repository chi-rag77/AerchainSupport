"use client";

import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Brain, Sparkles, ArrowRight, X, AlertCircle, TrendingUp, Info, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AIInsight {
  id: string;
  message: string;
  type: string;
  severity: 'info' | 'warning' | 'critical';
  link?: string;
}

interface AIInsightStackProps {
  insights: AIInsight[];
}

const AIInsightStack = ({ insights }: AIInsightStackProps) => {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const visibleInsights = insights.filter(i => !dismissedIds.has(i.id)).slice(0, 3);

  if (visibleInsights.length === 0) return null;

  const severityStyles = {
    critical: "border-red-200 bg-red-50/50 text-red-800 dark:bg-red-950/30 dark:text-red-200",
    warning: "border-amber-200 bg-amber-50/50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-200",
    info: "border-blue-200 bg-blue-50/50 text-blue-800 dark:bg-blue-950/30 dark:text-blue-200",
  };

  const handleDismiss = (id: string) => {
    setDismissedIds(prev => new Set(prev).add(id));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-2">
        <Brain className="h-4 w-4 text-indigo-600" />
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">AI Intelligence Stack</h3>
      </div>
      
      <AnimatePresence mode="popLayout">
        {visibleInsights.map((insight, idx) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className={cn(
              "relative flex items-center justify-between p-5 border-2 shadow-sm rounded-[24px] overflow-hidden group",
              severityStyles[insight.severity]
            )}>
              <div className="relative z-10 flex items-center gap-5 flex-1">
                <div className="p-2.5 rounded-xl bg-white/80 dark:bg-gray-800/80 shadow-sm">
                  {insight.severity === 'critical' ? <ShieldAlert className="h-5 w-5 text-red-600 animate-pulse" /> :
                   insight.severity === 'warning' ? <AlertCircle className="h-5 w-5 text-amber-600" /> :
                   <Info className="h-5 w-5 text-blue-600" />}
                </div>
                
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-white/50 dark:bg-gray-800/50 border-none font-black uppercase tracking-tighter text-[9px]">
                      {insight.severity}
                    </Badge>
                    <span className="text-[9px] font-bold opacity-40 uppercase tracking-widest">Detected 2m ago</span>
                  </div>
                  <p className="text-sm font-bold leading-tight">
                    {insight.message}
                  </p>
                </div>
              </div>

              <div className="relative z-10 flex items-center gap-3">
                <Button variant="ghost" size="sm" className="rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/40 gap-2 h-9 px-4">
                  Take Action <ArrowRight className="h-3.5 w-3.5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDismiss(insight.id)}
                  className="h-9 w-9 rounded-full hover:bg-white/40"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default AIInsightStack;