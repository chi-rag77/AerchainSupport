"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ShieldCheck, Activity } from 'lucide-react';

interface HealthScoreCardProps {
  score: number;
  status: string;
}

const HealthScoreCard = ({ score, status }: HealthScoreCardProps) => {
  const getStatusColor = (s: string) => {
    switch (s) {
      case 'Healthy': return 'text-green-600 bg-green-50 dark:bg-green-900/20 border-green-100';
      case 'Stable': return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-100';
      case 'At Risk': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 border-orange-100';
      case 'Critical': return 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-100';
      default: return 'text-gray-600 bg-gray-50 border-gray-100';
    }
  };

  const getCircleColor = (s: string) => {
    switch (s) {
      case 'Healthy': return '#22C55E';
      case 'Stable': return '#F59E0B';
      case 'At Risk': return '#F97316';
      case 'Critical': return '#EF4444';
      default: return '#94A3B8';
    }
  };

  return (
    <Card className="border-none shadow-glass rounded-[32px] bg-white dark:bg-gray-800 overflow-hidden h-full">
      <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-6">
        <div className="space-y-1">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Customer Health Score</h3>
          <p className="text-sm font-medium text-muted-foreground">Composite stability index</p>
        </div>

        <div className="relative h-48 w-48 flex items-center justify-center">
          {/* Background Circle */}
          <svg className="absolute inset-0 h-full w-full -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="88"
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              className="text-gray-100 dark:text-gray-700"
            />
            <motion.circle
              cx="96"
              cy="96"
              r="88"
              fill="none"
              stroke={getCircleColor(status)}
              strokeWidth="12"
              strokeDasharray="552.92"
              initial={{ strokeDashoffset: 552.92 }}
              animate={{ strokeDashoffset: 552.92 - (552.92 * score) / 100 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              strokeLinecap="round"
            />
          </svg>
          
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-6xl font-black tracking-tighter">{score}</span>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">/ 100</span>
          </div>
        </div>

        <div className="space-y-3 w-full">
          <Badge className={cn("px-6 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px] border-2", getStatusColor(status))}>
            Status: {status}
          </Badge>
          
          <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
            <Activity className="h-3 w-3" />
            Updated in real-time
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthScoreCard;