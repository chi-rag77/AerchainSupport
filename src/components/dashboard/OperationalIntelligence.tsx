"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExecutiveSummary } from '@/features/dashboard/types';
import { Ticket } from '@/types';
import VolumeSlaTrendChart from '@/components/VolumeSlaTrendChart';
import { Brain, Sparkles, TrendingUp, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface OperationalIntelligenceProps {
  summary: ExecutiveSummary | null;
  tickets: Ticket[];
  startDate: Date;
  endDate: Date;
}

const OperationalIntelligence = ({ summary, tickets, startDate, endDate }: OperationalIntelligenceProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left: Chart Section */}
      <Card className="lg:col-span-2 rounded-[28px] border-none bg-white dark:bg-gray-800 shadow-glass overflow-hidden">
        <CardHeader className="p-8 pb-0">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Volume & SLA Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 h-[400px]">
          <VolumeSlaTrendChart tickets={tickets} startDate={startDate} endDate={endDate} />
        </CardContent>
      </Card>

      {/* Right: AI Narrative Panel */}
      <Card className="rounded-[28px] border-none bg-indigo-600 text-white shadow-glass-glow overflow-hidden flex flex-col">
        <CardHeader className="p-8 pb-4">
          <div className="flex justify-between items-center mb-4">
            <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <Badge className="bg-white/20 text-white border-none font-bold">
              {summary?.confidenceScore}% Confidence
            </Badge>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">AI Executive Summary</CardTitle>
        </CardHeader>
        
        <CardContent className="p-8 pt-0 flex-grow space-y-6">
          <p className="text-indigo-50 leading-relaxed font-medium">
            {summary?.summary}
          </p>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-200">Key Risk Drivers</h4>
            <div className="space-y-2">
              {summary?.keyDrivers.map((driver, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-300" />
                  <span className="text-sm font-semibold">{driver}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-200 mb-3">Suggested Action</h4>
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-amber-400 text-indigo-900">
                <Sparkles className="h-4 w-4" />
              </div>
              <p className="text-sm font-bold leading-snug">
                {summary?.executiveAction}
              </p>
            </div>
          </div>
        </CardContent>

        <div className="p-6 bg-indigo-700/50 border-t border-white/10">
          <Button variant="ghost" className="w-full text-white hover:bg-white/10 font-bold gap-2">
            View Detailed Reasoning <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default OperationalIntelligence;