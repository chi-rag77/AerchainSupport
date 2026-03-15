"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { 
  Repeat, TrendingUp, TrendingDown, Minus, 
  ShieldAlert, Sparkles, ArrowRight, Zap, 
  AlertTriangle, ExternalLink, BarChart3
} from 'lucide-react';
import { RecurringIssueCluster } from '@/features/product-intelligence/types';

interface RecurringIssueCardProps {
  cluster: RecurringIssueCluster;
  onViewTickets: (ids: string[]) => void;
  isSelected?: boolean;
}

const RecurringIssueCard = ({ cluster, onViewTickets, isSelected }: RecurringIssueCardProps) => {
  const isIncreasing = cluster.trend === 'increasing';
  const isDecreasing = cluster.trend === 'decreasing';

  const impactColors = {
    High: "from-rose-500/20 to-rose-600/5 border-rose-200/50 text-rose-700 dark:text-rose-400",
    Medium: "from-amber-500/20 to-amber-600/5 border-amber-200/50 text-amber-700 dark:text-amber-400",
    Low: "from-emerald-500/20 to-emerald-600/5 border-emerald-200/50 text-emerald-700 dark:text-emerald-400",
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative"
    >
      <Card className={cn(
        "relative overflow-hidden border-none transition-all duration-500 rounded-[24px] shadow-glass group cursor-pointer",
        isSelected ? "ring-2 ring-indigo-500 ring-offset-4 dark:ring-offset-gray-950 bg-white dark:bg-gray-800" : "bg-white/60 dark:bg-gray-800/60 backdrop-blur-md hover:bg-white dark:hover:bg-gray-800"
      )}>
        {/* Impact Indicator Glow */}
        <div className={cn(
          "absolute -right-12 -top-12 w-24 h-24 rounded-full blur-3xl opacity-20 transition-opacity group-hover:opacity-40",
          cluster.impact === 'High' ? "bg-rose-500" : cluster.impact === 'Medium' ? "bg-amber-500" : "bg-emerald-500"
        )} />

        <CardContent className="p-6 space-y-5">
          <div className="flex justify-between items-start gap-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2.5 rounded-xl shadow-sm transition-colors",
                isSelected ? "bg-indigo-600 text-white" : "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600"
              )}>
                <Repeat className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-base font-black tracking-tight leading-tight group-hover:text-indigo-600 transition-colors">
                  {cluster.title}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {cluster.modules.map(m => (
                    <span key={m} className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className={cn(
                "flex items-center justify-end gap-1 font-black text-[10px] uppercase tracking-tighter mb-1",
                isIncreasing ? "text-rose-500" : isDecreasing ? "text-emerald-500" : "text-indigo-500"
              )}>
                {isIncreasing ? <TrendingUp className="h-3 w-3" /> : isDecreasing ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                {cluster.trend}
              </div>
              <div className="text-2xl font-black tracking-tighter">{cluster.occurrences}</div>
            </div>
          </div>

          {/* AI Micro-Insight */}
          <div className="p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-900/50 border border-border/50 group-hover:border-indigo-200/50 transition-all">
            <div className="flex items-start gap-2.5">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500 shrink-0 mt-0.5" />
              <p className="text-xs font-medium leading-relaxed text-muted-foreground line-clamp-2">
                {cluster.rootCause}
              </p>
            </div>
          </div>

          {/* Footer Stats */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className={cn(
                "text-[9px] font-black uppercase tracking-widest border-none px-2 py-0.5 rounded-full",
                impactColors[cluster.impact]
              )}>
                {cluster.impact} Impact
              </Badge>
              {cluster.requiresEscalation && (
                <div className="flex items-center gap-1 text-rose-600 animate-pulse">
                  <AlertTriangle className="h-3 w-3" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Escalate</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              Details <ArrowRight className="h-3 w-3" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RecurringIssueCard;