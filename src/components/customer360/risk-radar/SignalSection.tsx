"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AlertTriangle, Sparkles, ChevronRight, ShieldAlert, TrendingUp } from 'lucide-react';
import { RiskSignal } from '@/features/customer360/types';

interface SignalSectionProps {
  title: string;
  signals: RiskSignal[];
  type: 'risk' | 'opportunity';
}

const SignalSection = ({ title, signals, type }: SignalSectionProps) => {
  const isRisk = type === 'risk';
  const Icon = isRisk ? ShieldAlert : Sparkles;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <Icon className={cn("h-4 w-4", isRisk ? "text-red-500" : "text-indigo-500")} />
        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{title}</h4>
      </div>

      <div className="space-y-3">
        {signals.length > 0 ? (
          signals.map((signal) => (
            <Card key={signal.id} className={cn(
              "border-none shadow-sm rounded-2xl transition-all hover:shadow-md group cursor-default",
              isRisk ? "bg-red-50/30 dark:bg-red-950/10" : "bg-indigo-50/30 dark:bg-indigo-950/10"
            )}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-2 w-2 rounded-full",
                    isRisk ? "bg-red-500" : "bg-indigo-500"
                  )} />
                  <span className="text-sm font-bold text-foreground/90">{signal.title}</span>
                </div>
                <Badge variant="outline" className={cn(
                  "text-[9px] font-black uppercase tracking-tighter border-none",
                  isRisk ? "bg-red-100 text-red-700" : "bg-indigo-100 text-indigo-700"
                )}>
                  {isRisk ? `Severity: ${signal.severity}` : 'Positive'}
                </Badge>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="p-8 text-center rounded-2xl border border-dashed border-border bg-gray-50/30">
            <p className="text-xs font-medium text-muted-foreground italic">No {type} signals detected.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignalSection;