"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExecutiveSummary, ForecastData } from '@/features/dashboard/types';
import { Ticket } from '@/types';
import VolumeSlaTrendChart from '@/components/VolumeSlaTrendChart';
import { Brain, Sparkles, TrendingUp, CheckCircle2, AlertTriangle, ArrowRight, Loader2, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface OperationalIntelligenceProps {
  summary: ExecutiveSummary | null;
  tickets: Ticket[];
  startDate: Date;
  endDate: Date;
  forecast: ForecastData;
  onViewDetails: () => void;
}

const OperationalIntelligence = ({ summary, tickets, startDate, endDate, forecast, onViewDetails }: OperationalIntelligenceProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left: Chart Section */}
      <Card className="lg:col-span-2 rounded-[28px] border-none bg-white dark:bg-gray-800 shadow-glass overflow-hidden">
        <CardHeader className="p-8 pb-0 flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Volume & SLA Performance
            </CardTitle>
            <p className="text-xs font-medium text-muted-foreground">Historical data with AI predictive overlay</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Projected SLA</p>
              <p className="text-sm font-black text-indigo-600">{forecast.forecastSLA}%</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-right">
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Breach Risk</p>
              <p className={cn(
                "text-sm font-black",
                forecast.breachProbability > 0.2 ? "text-rose-600" : "text-green-600"
              )}>
                {forecast.breachProbability > 0.2 ? 'Medium' : 'Low'}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 h-[400px]">
          {tickets && tickets.length > 0 ? (
            <VolumeSlaTrendChart tickets={tickets} startDate={startDate} endDate={endDate} />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground italic">
              No ticket data available for the selected range.
            </div>
          )}
        </CardContent>
        <div className="px-8 pb-6">
          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 flex items-center gap-3">
            <Sparkles className="h-4 w-4 text-indigo-600 shrink-0" />
            <p className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
              {forecast.aiNarrative}
            </p>
          </div>
        </div>
      </Card>

      {/* Right: AI Narrative Panel */}
      <Card className="rounded-[28px] border-none bg-indigo-600 text-white shadow-glass-glow overflow-hidden flex flex-col">
        <CardHeader className="p-8 pb-4">
          <div className="flex justify-between items-center mb-4">
            <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <Badge className="bg-white/20 text-white border-none font-bold">
              {summary?.confidenceScore || 0}% Confidence
            </Badge>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">AI Executive Summary</CardTitle>
        </CardHeader>
        
        <CardContent className="p-8 pt-0 flex-grow space-y-6">
          {summary ? (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                <p className="text-sm font-medium leading-relaxed">{summary.summary}</p>
              </div>

              {/* Key Risk Drivers */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-200">Key Risk Drivers</h4>
                <div className="space-y-2">
                  {summary.keyDrivers && summary.keyDrivers.length > 0 ? (
                    summary.keyDrivers.map((driver, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                        <AlertTriangle className="h-4 w-4 text-amber-300 shrink-0" />
                        <span className="text-sm font-semibold">{driver}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                      <CheckCircle2 className="h-4 w-4 text-green-300 shrink-0" />
                      <span className="text-sm font-semibold">No significant risks identified.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Suggested Action */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-200">Suggested Action</h4>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                  <div className="p-1.5 rounded-lg bg-amber-400 text-indigo-900 shrink-0">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-bold leading-snug">
                    {summary.executiveAction || "Continue monitoring current trends."}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-indigo-200">
              <Loader2 className="h-8 w-8 animate-spin mb-2" />
              <p className="text-sm font-medium">Generating AI Narrative...</p>
            </div>
          )}
        </CardContent>

        <div className="p-6 bg-indigo-700/50 border-t border-white/10">
          <Button variant="ghost" className="w-full text-white hover:bg-white/10 font-bold gap-2" onClick={onViewDetails}>
            View Detailed Reasoning <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default OperationalIntelligence;