"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Zap, ArrowRight, Clock, Target, ShieldAlert, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Action {
  id: string;
  action: string;
  why: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  impactMinutes: number;
  done: boolean;
}

interface RecommendedActionsProps {
  actions: Action[];
  onToggle: (id: string) => void;
}

const RecommendedActions = ({ actions, onToggle }: RecommendedActionsProps) => {
  return (
    <Card className="border-none shadow-glass rounded-[28px] bg-white dark:bg-gray-900 overflow-hidden">
      <CardHeader className="p-6 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
              <Zap className="h-4 w-4 text-amber-600" />
            </div>
            <CardTitle className="text-base font-black tracking-tight">Daily Action Pointers</CardTitle>
          </div>
          <Badge variant="outline" className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-200/50 font-bold text-[9px] uppercase tracking-widest">
            <Sparkles className="h-3 w-3 mr-1.5" /> AI Prioritized
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-2 space-y-3">
        <AnimatePresence mode="popLayout">
          {actions.map((action, idx) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ delay: idx * 0.05 }}
              className={cn(
                "group relative flex items-center gap-4 p-4 rounded-[18px] border transition-all duration-300",
                action.done ? "bg-gray-50/50 dark:bg-gray-800/30 border-transparent opacity-50" : 
                action.priority === 'urgent' ? "bg-rose-50/30 dark:bg-rose-950/10 border-rose-100 dark:border-rose-900/50" : "bg-white dark:bg-gray-800 border-border/50 hover:border-indigo-200"
              )}
            >
              <div className="shrink-0">
                <Checkbox 
                  checked={action.done} 
                  onCheckedChange={() => onToggle(action.id)}
                  className="h-5 w-5 rounded-lg border-2 border-indigo-200 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-4">
                  <h4 className={cn(
                    "text-sm font-bold leading-tight truncate transition-all",
                    action.done ? "line-through text-muted-foreground" : "text-foreground"
                  )}>
                    {action.action}
                  </h4>
                  <Badge className={cn(
                    "text-[8px] font-black uppercase tracking-widest border-none px-2 py-0.5 rounded-full shrink-0",
                    action.priority === 'urgent' ? "bg-rose-500 text-white" : "bg-indigo-50 text-indigo-700"
                  )}>
                    {action.priority}
                  </Badge>
                </div>

                <div className="flex items-center gap-3">
                  <p className="text-[11px] font-medium text-muted-foreground truncate">
                    <span className="font-black text-indigo-600 uppercase tracking-tighter mr-1">Why:</span>
                    {action.why}
                  </p>
                  <div className="h-2.5 w-px bg-border shrink-0" />
                  <div className="flex items-center gap-1 text-[9px] font-black text-emerald-600 uppercase tracking-tighter shrink-0">
                    <Zap className="h-2.5 w-2.5" />
                    +{action.impactMinutes}m Impact
                  </div>
                </div>
              </div>

              <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-600 shrink-0">
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default RecommendedActions;