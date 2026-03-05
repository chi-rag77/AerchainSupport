"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Ticket, CheckCircle2, ArrowUp, ArrowDown } from 'lucide-react';
import CountUp from 'react-countup';
import { cn } from '@/lib/utils';

interface TickerItem {
  id: string;
  label: string;
  value: number;
  delta: number;
  color: string;
  icon: React.ElementType;
}

interface LiveActivityTickerProps {
  metrics: {
    created: { value: number; delta: number };
    resolved: { value: number; delta: number };
  };
}

const LiveActivityTicker = ({ metrics }: LiveActivityTickerProps) => {
  const [index, setIndex] = useState(0);

  const items: TickerItem[] = [
    {
      id: 'created',
      label: 'Created Today',
      value: metrics.created.value,
      delta: metrics.created.delta,
      color: 'text-blue-600 dark:text-blue-400',
      icon: Ticket
    },
    {
      id: 'resolved',
      label: 'Resolved Today',
      value: metrics.resolved.value,
      delta: metrics.resolved.delta,
      color: 'text-green-600 dark:text-green-400',
      icon: CheckCircle2
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [items.length]);

  const current = items[index];
  const DeltaIcon = current.delta >= 0 ? ArrowUp : ArrowDown;

  return (
    <div className="h-14 overflow-hidden flex flex-col justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="flex items-center justify-between gap-8"
        >
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg bg-white dark:bg-gray-900 shadow-sm border border-border", current.color)}>
              <current.icon className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Ticket Activity
              </span>
              <span className="text-sm font-bold text-foreground">
                {current.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className={cn("text-3xl font-black tracking-tighter", current.color)}>
              <CountUp end={current.value} duration={1.5} />
            </div>
            
            <div className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
              current.delta >= 0 
                ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" 
                : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
            )}>
              <DeltaIcon className="h-3 w-3" />
              {Math.abs(current.delta)} vs yesterday
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default LiveActivityTicker;