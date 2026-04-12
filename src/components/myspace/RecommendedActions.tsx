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
    <Card className="border-none shadow-glass rounded-[32px] bg-white dark:bg-gray-900 overflow-hidden">
      <CardHeader className="p-8 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
              <Zap className="h-5 w-5 text-amber-600" />
            </div>
            <CardTitle className="text-xl font-black tracking-tight">Daily Action Pointers</CardTitle>
          </div>
          <Badge variant="outline" className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-200/50 font-bold text-[10px] uppercase tracking-widest">
            <Sparkles className="h-3 w-3 mr-1.5" /> AI Prioritized
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-8 pt-4 space-y-4">
        <AnimatePresence mode="popLayout">
          {actions.map((action, idx) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.1 }}
              className={cn(
                "group relative flex items-start gap-5 p-5 rounded-[24px] border-2 transition-all duration-300",
                action.done ? "bg-gray-50/50 dark:bg-gray-800/30 border-transparent opacity-60" : 
                action.priority === 'urgent' ? "bg-rose-50/30 dark:bg-rose-950/10 border-rose-100 dark:border-rose-900/50" : "bg-white dark:bg-gray-800 border-border/50 hover:border-indigo-200"
              )}
            >
              <div className="pt-1">
                <Checkbox 
                  checked={action.done} 
                  onCheckedChange={() => onToggle(action.id)}
                  className="h-5 w-5 rounded-lg border-2 border-indigo-200 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                />
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <h4 className={cn(
                    "text-base font-bold leading-tight transition-all",
                    action.done ? "line-through text-muted-foreground" : "text-foreground"
                  )}>
                    {action.action}
                  </h4>
                  <Badge className={cn(
                    "text-[9px] font-black uppercase tracking-widest border-none px-2 py-0.5 rounded-full",
                    action.priority === 'urgent' ? "bg-rose-500 text-white" : "bg-indigo-50 text-indigo-700"
                  )}>
                    {action.priority}
                  </Badge>
                </div>

                <div className="flex items-center gap-4">
                  <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                    <span className="font-black text-indigo-600 uppercase tracking-tighter mr-1.5">Why:</span>
                    {action.why}
                  </p>
                  <div className="h-3 w-px bg-border shrink-0" />
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-tighter shrink-0">
                    <Zap className="h-3 w-3" />
                    +{action.impactMinutes}m Impact
                  </div>
                </div>
              </div>

              <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-xl hover:bg-indigo-50 text-indigo-600">
                <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {actions.length === 0 && (
          <div className="py-12 text-center space-y-3 opacity-30">
            <Target className="h-12 w-12 mx-auto" />
            <p className="text-sm font-black uppercase tracking-widest">All caught up!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecommendedActions;