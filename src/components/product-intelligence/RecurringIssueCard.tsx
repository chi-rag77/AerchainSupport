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
  MessageSquare, AlertTriangle, ExternalLink
} from 'lucide-react';
import { RecurringIssueCluster } from '@/features/product-intelligence/types';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface RecurringIssueCardProps {
  cluster: RecurringIssueCluster;
  onViewTickets: (ids: string[]) => void;
}

const RecurringIssueCard = ({ cluster, onViewTickets }: RecurringIssueCardProps) => {
  const isIncreasing = cluster.trend === 'increasing';
  const isDecreasing = cluster.trend === 'decreasing';

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.01 }}
      className="relative group"
    >
      <Card className={cn(
        "border-none shadow-glass rounded-[32px] bg-white dark:bg-gray-800 overflow-hidden transition-all duration-500",
        cluster.requiresEscalation ? "ring-2 ring-red-500/20" : "hover:shadow-glass-glow"
      )}>
        {/* Top Status Bar */}
        <div className={cn(
          "h-1.5 w-full",
          cluster.impact === 'High' ? "bg-red-500" : cluster.impact === 'Medium' ? "bg-amber-500" : "bg-blue-500"
        )} />

        <CardContent className="p-8 space-y-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600">
                <Repeat className="h-6 w-6" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xl font-black tracking-tight group-hover:text-indigo-600 transition-colors">
                  {cluster.title}
                </h4>
                <div className="flex items-center gap-2">
                  {cluster.modules.map(m => (
                    <Badge key={m} variant="outline" className="text-[9px] font-black uppercase tracking-widest border-none bg-gray-100 dark:bg-gray-900">
                      {m}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center justify-end gap-1.5 font-black text-[10px] uppercase tracking-widest mb-1">
                {isIncreasing ? <TrendingUp className="h-3 w-3 text-red-500" /> : isDecreasing ? <TrendingDown className="h-3 w-3 text-green-500" /> : <Minus className="h-3 w-3 text-blue-500" />}
                <span className={cn(isIncreasing ? "text-red-500" : isDecreasing ? "text-green-500" : "text-blue-500")}>
                  {cluster.trend}
                </span>
              </div>
              <div className="text-3xl font-black tracking-tighter">{cluster.occurrences}</div>
              <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Occurrences</div>
            </div>
          </div>

          {/* AI Insight Hover Area */}
          <div className="relative p-5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-border group-hover:border-indigo-200 transition-all">
            <div className="flex items-start gap-3">
              <Sparkles className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h5 className="text-[10px] font-black uppercase tracking-widest text-indigo-600">AI Root Cause Insight</h5>
                <p className="text-sm font-medium leading-relaxed text-foreground/80">
                  {cluster.rootCause}
                </p>
              </div>
            </div>
            
            {/* Hidden Detail on Hover */}
            <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
              <div className="flex items-start gap-3">
                <Zap className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-amber-600">Suggested Permanent Fix</h5>
                  <p className="text-xs font-bold text-foreground/90">{cluster.suggestedFix}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[9px] font-bold border-none bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600">
                AI Confidence: {cluster.confidence}%
              </Badge>
              {cluster.requiresEscalation && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 text-red-600 animate-pulse">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Escalation Recommended</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>This issue has crossed the critical threshold of 50 occurrences.</TooltipContent>
                </Tooltip>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onViewTickets(cluster.sampleTickets)}
                className="text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 gap-1.5"
              >
                View Tickets <ExternalLink className="h-3 w-3" />
              </Button>
              {cluster.requiresEscalation && (
                <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white rounded-full h-8 px-4 text-[10px] font-black uppercase tracking-widest gap-1.5 shadow-lg shadow-red-500/20">
                  <ShieldAlert className="h-3 w-3" />
                  Escalate to Product
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RecurringIssueCard;