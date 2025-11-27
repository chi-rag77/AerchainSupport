"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Brain, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface CustomerAISummaryCardProps {
  customerName: string;
  summary: string | null | undefined;
  isLoading: boolean;
  error: Error | null;
}

const CustomerAISummaryCard = ({ customerName, summary, isLoading, error }: CustomerAISummaryCardProps) => {
  return (
    <Card className="relative overflow-hidden group transition-all duration-300 hover:shadow-lg hover:scale-[1.02] h-full bg-card border border-border shadow-sm lg:col-span-2">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-500" /> AI Customer Summary
        </CardTitle>
        <Badge variant="secondary" className="text-sm font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
          {customerName}
        </Badge>
      </CardHeader>
      <CardContent className="text-sm space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500 dark:text-gray-400">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500 mb-3" />
            <p className="text-base font-medium">Generating summary...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-32 text-red-500 dark:text-red-400 text-center">
            <AlertCircle className="h-8 w-8 mb-2" />
            <p className="font-medium">Error generating summary:</p>
            <p className="text-xs">{error.message}</p>
            <p className="text-xs mt-1">Please ensure the GEMINI_API_KEY is set as a Supabase secret.</p>
          </div>
        ) : summary ? (
          <p className="text-foreground leading-relaxed">{summary}</p>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-center">
            <Brain className="h-8 w-8 mb-3" />
            <p className="text-base font-medium">Select a customer to generate an AI summary.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerAISummaryCard;