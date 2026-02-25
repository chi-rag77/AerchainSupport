"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Zap, ArrowRight, Sparkles, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface WeeklyActionCenterProps {
  actions: { title: string; reason: string; priority: 'high' | 'medium' | 'low' }[];
}

const WeeklyActionCenter = ({ actions }: WeeklyActionCenterProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight">Prescriptive Next Steps</h3>
            <p className="text-sm font-medium text-muted-foreground">AI-recommended focus for the upcoming week</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {actions.map((action, index) => (
          <motion.div
            key={index}
            whileHover={{ y: -4 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="group relative overflow-hidden border-none bg-white dark:bg-gray-800 shadow-glass hover:shadow-glass-glow transition-all duration-500 rounded-[24px]">
              <div className={cn(
                "absolute left-0 top-0 h-full w-1.5",
                action.priority === 'high' ? "bg-red-500" : "bg-amber-500"
              )} />
              
              <CardContent className="p-8 flex items-center justify-between gap-6">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn(
                      "text-[10px] font-black uppercase tracking-widest",
                      action.priority === 'high' ? "text-red-600 border-red-200" : "text-amber-600 border-amber-200"
                    )}>
                      {action.priority} Priority
                    </Badge>
                  </div>

                  <h4 className="text-lg font-bold leading-tight group-hover:text-indigo-600 transition-colors">
                    {action.title}
                  </h4>

                  <div className="flex items-start gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-border">
                    <Sparkles className="h-3.5 w-3.5 text-purple-500 shrink-0 mt-0.5" />
                    <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                      {action.reason}
                    </p>
                  </div>
                </div>

                <Button className="rounded-full h-12 w-12 p-0 bg-gray-50 dark:bg-gray-700 text-foreground hover:bg-indigo-600 hover:text-white transition-all duration-300 shadow-sm">
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyActionCenter;