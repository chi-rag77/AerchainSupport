"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { RiskLevel, RiskMetricData } from '@/features/active-risk/types';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface RiskCardProps {
  title: string;
  data: RiskMetricData;
  icon: React.ElementType;
  isSelected: boolean;
  onClick: () => void;
}

const RiskCard = ({ title, data, icon: Icon, isSelected, onClick }: RiskCardProps) => {
  const colors = {
    HIGH: "border-red-200 bg-red-50/30 text-red-800 dark:bg-red-950/20 dark:text-red-200",
    MEDIUM: "border-amber-200 bg-amber-50/30 text-amber-800 dark:bg-amber-950/20 dark:text-amber-200",
    LOW: "border-green-200 bg-green-50/30 text-green-800 dark:bg-green-950/20 dark:text-green-200",
  };

  const accentColors = {
    HIGH: "bg-red-500",
    MEDIUM: "bg-amber-500",
    LOW: "bg-green-500",
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className={cn(
        "relative overflow-hidden border-2 transition-all duration-300 rounded-[20px] shadow-sm",
        isSelected ? "ring-2 ring-primary ring-offset-2" : "hover:shadow-md",
        colors[data.riskLevel]
      )}>
        {/* Top Accent Bar */}
        <div className={cn("absolute top-0 left-0 w-full h-1", accentColors[data.riskLevel])} />

        <CardContent className="p-5 space-y-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 opacity-70" />
              <span className="text-xs font-bold uppercase tracking-wider opacity-70">{title}</span>
            </div>
            {data.riskLevel === 'HIGH' && (
              <AlertCircle className="h-4 w-4 text-red-500 animate-pulse" />
            )}
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tighter">
              {title.includes('Spike') ? `${data.count}%` : data.count}
            </span>
            <span className="text-xs font-bold opacity-60">
              {title.includes('Spike') ? 'Increase' : 'Tickets'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-bold">
            {data.trend !== 0 && (
              <span className={cn(
                "flex items-center",
                data.trend > 0 ? "text-red-600" : "text-green-600"
              )}>
                {data.trend > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {Math.abs(data.trend)}%
              </span>
            )}
            <span className="opacity-40">•</span>
            <span className="flex items-center gap-1 italic">
              <Sparkles className="h-2.5 w-2.5" />
              {data.microInsight}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RiskCard;