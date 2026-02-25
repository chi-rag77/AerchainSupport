"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';
import { AlertTriangle, ShieldAlert, Sparkles, ArrowRight, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const RiskSignalSection = ({ signals }: { signals: any[] }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
          <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-xl font-black tracking-tight">Risk & Opportunity Signals</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {signals.map((signal, i) => (
          <motion.div key={i} whileHover={{ y: -4 }}>
            <Card className={cn(
              "relative overflow-hidden border-none shadow-glass rounded-[24px] p-6 space-y-4",
              signal.severity === 'critical' ? "bg-red-50/50 dark:bg-red-950/20" : "bg-white dark:bg-gray-800"
            )}>
              <div className="flex justify-between items-start">
                <Badge className={cn(
                  "border-none font-black text-[9px] uppercase tracking-widest px-2 py-0.5",
                  signal.severity === 'critical' ? "bg-red-500 text-white" : "bg-amber-500 text-white"
                )}>
                  {signal.severity}
                </Badge>
                <span className="text-[10px] font-bold text-muted-foreground">Confidence: {signal.confidence}%</span>
              </div>

              <div className="space-y-2">
                <h4 className="font-black text-lg leading-tight">{signal.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{signal.description}</p>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  <Info className="h-3 w-3" />
                  Impact: {signal.impactScope}
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RiskSignalSection;