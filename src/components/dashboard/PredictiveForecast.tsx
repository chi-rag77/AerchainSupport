"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ForecastData } from '@/features/dashboard/types';
import { Brain, TrendingUp, ShieldAlert, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

const PredictiveForecast = ({ data }: { data: ForecastData }) => {
  return (
    <Card className="rounded-[28px] border-none bg-white dark:bg-gray-800 shadow-glass overflow-hidden">
      <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-indigo-500" />
          7-Day Operational Forecast
        </CardTitle>
        <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30">
          <Brain className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        </div>
      </CardHeader>
      
      <CardContent className="p-8 pt-0 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Expected Volume</span>
            <div className="text-4xl font-black tracking-tighter text-indigo-600">{data.forecastVolume}</div>
            <p className="text-xs font-medium text-muted-foreground">+15% vs current period</p>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Predicted SLA</span>
            <div className="text-4xl font-black tracking-tighter text-amber-500">{data.forecastSLA}%</div>
            <p className="text-xs font-medium text-muted-foreground">Potential 4% decline</p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Breach Probability</span>
              <span className="text-sm font-bold text-red-500">{Math.round(data.breachProbability * 100)}%</span>
            </div>
            <Progress value={data.breachProbability * 100} className="h-2" indicatorClassName="bg-red-500" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
            <p className="text-sm font-semibold leading-relaxed text-indigo-900 dark:text-indigo-200">
              {data.aiNarrative}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PredictiveForecast;