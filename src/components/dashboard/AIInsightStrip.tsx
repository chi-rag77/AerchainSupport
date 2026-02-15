"use client";

import React from 'react';
import { Card } from "@/components/ui/card";
import { Brain, Sparkles, ArrowRight, X, AlertCircle, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AIInsightStripProps {
  insight: {
    message: string;
    type: 'risk' | 'trend' | 'anomaly';
    severity: 'info' | 'warning' | 'critical';
    link?: string;
  } | null;
  onDismiss: () => void;
}

const AIInsightStrip = ({ insight, onDismiss }: AIInsightStripProps) => {
  if (!insight) return null;

  const severityStyles = {
    critical: "border-red-200 bg-red-50/50 text-red-800 dark:bg-red-950/30 dark:text-red-200",
    warning: "border-amber-200 bg-amber-50/50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-200",
    info: "border-blue-200 bg-blue-50/50 text-blue-800 dark:bg-blue-950/30 dark:text-blue-200",
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0 }}
        className="w-full"
      >
        <Card className={cn(
          "relative flex items-center justify-between p-4 border-2 shadow-sm rounded-[20px] overflow-hidden group",
          severityStyles[insight.severity]
        )}>
          {/* Animated Background Pulse */}
          <div className="absolute inset-0 bg-white/20 dark:bg-black/10 animate-pulse-slow pointer-events-none" />

          <div className="relative z-10 flex items-center gap-4 flex-1">
            <div className="p-2 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-sm">
              <Brain className="h-5 w-5 text-indigo-600 animate-pulse" />
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <Badge variant="outline" className="bg-white/50 dark:bg-gray-800/50 border-none font-bold uppercase tracking-tighter text-[10px]">
                AI Intelligence
              </Badge>
              <p className="text-sm font-semibold leading-tight">
                {insight.message}
              </p>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-2">
            {insight.link && (
              <Button variant="ghost" size="sm" className="text-xs font-bold hover:bg-white/40 gap-1">
                Take Action <ArrowRight className="h-3 w-3" />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onDismiss}
              className="h-8 w-8 rounded-full hover:bg-white/40"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default AIInsightStrip;