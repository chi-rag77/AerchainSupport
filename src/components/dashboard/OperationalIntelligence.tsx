"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExecutiveSummary } from '@/features/dashboard/types';
import { Ticket } from '@/types';
import VolumeSlaTrendChart from '@/components/VolumeSlaTrendChart';
import { Brain, Sparkles, TrendingUp, CheckCircle2, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface OperationalIntelligenceProps {
  summary: ExecutiveSummary | null;
  tickets: Ticket[];
  startDate: Date;
  endDate: Date;
  onViewDetails: () => void;
}

const OperationalIntelligence = ({ summary, tickets, startDate, endDate, onViewDetails }: OperationalIntelligenceProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
      {/* Left: Chart Section */}
      <Card className="lg:col-span-2 rounded-[28px] border-none bg-white dark:bg-gray-800 shadow-glass overflow-hidden flex flex-col">
        <CardHeader className="p-8 pb-0">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Volume & SLA Performance
          </CardTitle>
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
      </Card>

      {/* Right: AI Narrative Panel */}
      <Card className="rounded-[28px] border-none bg-indigo-600 text-white shadow-glass-glow overflow-hidden flex flex-col h-full">
        <CardHeader className="p-8 pb-4 shrink-0">
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
        
        {/* Scrollable Content Area with fixed height matching the chart */}
        <ScrollArea className="h-[400px]">
          <CardContent className="p-8 pt-0 space-y-6">
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
        </ScrollArea>

        <div className="p-6 bg-indigo-700/50 border-t border-white/10 mt-auto shrink-0">
          <button 
            className="w-full flex items-center justify-center text-white hover:text-indigo-100 font-bold gap-2 transition-colors" 
            onClick={onViewDetails}
          >
            View Detailed Reasoning <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </Card>
    </div>
  );
};

export default OperationalIntelligence;