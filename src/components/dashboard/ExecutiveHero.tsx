"use client";

import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Clock, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import LiveActivityTicker from './LiveActivityTicker';
import { motion } from 'framer-motion';

interface ExecutiveHeroProps {
  tickerMetrics: {
    created: { value: number; delta: number };
    resolved: { value: number; delta: number };
  };
  lastSync: string;
}

const ExecutiveHero = ({ tickerMetrics, lastSync }: ExecutiveHeroProps) => {
  return (
    <div className="relative w-full p-6 rounded-[24px] bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 shadow-glass overflow-hidden">
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
      
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          {/* Live Activity Ticker */}
          <div className="min-w-[320px]">
            <LiveActivityTicker metrics={tickerMetrics} />
          </div>
          
          <Separator orientation="vertical" className="h-10 hidden lg:block" />

          <div className="flex flex-wrap gap-3">
            <Badge variant="outline" className="bg-green-50/50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200/50 py-1 px-3 gap-1.5">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              AI Monitoring Active
            </Badge>
            <Badge variant="secondary" className="bg-white/50 dark:bg-gray-700/50 py-1 px-3 gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Synced {format(new Date(lastSync), 'HH:mm')}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

import { Separator } from '@/components/ui/separator';
export default ExecutiveHero;