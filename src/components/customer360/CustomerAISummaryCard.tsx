"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Brain, AlertCircle, Sparkles, TrendingUp, UserCircle2, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface CustomerAISummaryCardProps {
  customerName: string;
  analysis: any;
  isLoading: boolean;
  error: Error | null;
}

const CustomerAISummaryCard = ({ customerName, analysis, isLoading, error }: CustomerAISummaryCardProps) => {
  if (isLoading) {
    return (
      <Card className="relative overflow-hidden rounded-[24px] border-none bg-white dark:bg-gray-800 shadow-glass lg:col-span-2">
        <CardContent className="flex flex-col items-center justify-center h-64 text-gray-500">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
          <p className="text-lg font-bold animate-pulse">Synthesizing Customer Intelligence...</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !analysis) {
    return (
      <Card className="relative overflow-hidden rounded-[24px] border-none bg-white dark:bg-gray-800 shadow-glass lg:col-span-2">
        <CardContent className="flex flex-col items-center justify-center h-64 text-red-500 text-center p-8">
          <AlertCircle className="h-12 w-12 mb-4 opacity-50" />
          <p className="font-bold">Intelligence Unavailable</p>
          <p className="text-sm text-muted-foreground mt-2">{error?.message || "Select a customer to generate AI insights."}</p>
        </CardContent>
      </Card>
    );
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'Critical': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'Frustrated': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20';
      default: return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  return (
    <Card className="relative overflow-hidden rounded-[24px] border-none bg-white dark:bg-gray-800 shadow-glass lg:col-span-2 group">
      {/* Top Accent */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
      
      <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20">
            <Brain className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-2xl font-black tracking-tight">AI Executive Intelligence</CardTitle>
            <p className="text-sm font-medium text-muted-foreground">Holistic analysis for {customerName}</p>
          </div>
        </div>
        <Badge variant="outline" className="rounded-full px-4 py-1 font-black uppercase tracking-widest text-[10px] border-2">
          AI Confidence: 94%
        </Badge>
      </CardHeader>

      <CardContent className="p-8 pt-0 space-y-8">
        {/* Summary Section */}
        <div className="p-6 rounded-[20px] bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-900/50">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-indigo-600 shrink-0 mt-1" />
            <p className="text-lg font-bold leading-relaxed text-indigo-900 dark:text-indigo-200">
              {analysis.summary}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sentiment & Risk */}
          <div className="space-y-4">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Customer Sentiment</span>
              <div className={cn("flex items-center gap-2 p-3 rounded-xl font-bold", getSentimentColor(analysis.sentiment))}>
                <TrendingUp className="h-4 w-4" />
                {analysis.sentiment}
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Churn Risk</span>
              <div className={cn(
                "flex items-center gap-2 p-3 rounded-xl font-bold",
                analysis.churnRisk === 'High' ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'
              )}>
                <ShieldAlert className="h-4 w-4" />
                {analysis.churnRisk} Risk
              </div>
            </div>
          </div>

          {/* Persona */}
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Behavioral Persona</span>
            <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-900/50 h-full">
              <div className="flex items-center gap-2 mb-2">
                <UserCircle2 className="h-5 w-5 text-purple-600" />
                <span className="font-black text-purple-900 dark:text-purple-200">{analysis.persona}</span>
              </div>
              <p className="text-xs font-medium text-purple-800/70 dark:text-purple-300/70 leading-relaxed">
                {analysis.personaDescription}
              </p>
            </div>
          </div>

          {/* Pain Points */}
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Top Pain Points</span>
            <div className="space-y-2">
              {analysis.topPainPoints?.map((point: string, i: number) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-border">
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
                  <span className="text-xs font-bold text-foreground">{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerAISummaryCard;