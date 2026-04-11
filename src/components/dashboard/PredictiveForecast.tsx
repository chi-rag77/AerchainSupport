"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ForecastData } from '@/features/dashboard/types';
import { Brain, TrendingUp, ShieldAlert, Sparkles, ArrowRight, Zap, Users } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const PredictiveForecast = ({ data }: { data: ForecastData }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 px-2">
        <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
          <Brain className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-xl font-black tracking-tight">7-Day AI Forecast</h3>
      </div>

      <Card className="rounded-[32px] border-none bg-white dark:bg-gray-800 shadow-glass overflow-hidden">
        <CardContent className="p-10 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Volume Forecast */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-indigo-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Expected Volume</span>
              </div>
              <div className="space-y-1">
                <div className="text-5xl font-black tracking-tighter text-indigo-600">~950</div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">±12% Variance • ↑ 7% WoW</p>
              </div>
            </div>

            {/* SLA Risk Forecast */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-rose-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Predicted SLA Risk</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-3xl font-black tracking-tighter text-rose-600">38%</span>
                  <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">Breach Probability</span>
                </div>
                <Progress value={38} className="h-2" indicatorClassName="bg-rose-500" />
              </div>
            </div>

            {/* Churn Risk Forecast */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-amber-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Churn Risk Accounts</span>
              </div>
              <div className="space-y-1">
                <div className="text-5xl font-black tracking-tighter text-amber-600">4-6</div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Accounts trending red</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8 border-t border-gray-100 dark:border-gray-800">
            <div className="p-6 rounded-[24px] bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 flex items-start gap-4">
              <Sparkles className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h5 className="text-[10px] font-black uppercase tracking-widest text-indigo-600">AI Strategic Recommendation</h5>
                <p className="text-sm font-bold leading-relaxed text-indigo-900 dark:text-indigo-200">
                  "Payment issues are likely to spike based on current support patterns. Alert the product team now to coordinate a fix before the weekend volume."
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-4">
              <Button variant="outline" className="rounded-xl font-black text-[10px] uppercase tracking-widest h-12 px-8">Full Forecast Report</Button>
              <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-widest h-12 px-8 shadow-lg shadow-indigo-500/20">Export Intelligence</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PredictiveForecast;