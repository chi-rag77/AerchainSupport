"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { invokeEdgeFunction } from '@/lib/apiClient';
import { CustomerIntelligenceData } from '@/features/customer360/types';
import { Loader2, AlertTriangle, Info, RefreshCw } from 'lucide-react';
import MetricWidget from './MetricWidget';
import AISummary from './AISummary';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CustomerIntelligenceHeaderProps {
  customerName: string;
}

const CustomerIntelligenceHeader = ({ customerName }: CustomerIntelligenceHeaderProps) => {
  const { data, isLoading, error, refetch, isFetching } = useQuery<CustomerIntelligenceData, Error>({
    queryKey: ['customerIntelligence', customerName],
    queryFn: () => invokeEdgeFunction('get-customer-intelligence', {
      method: 'POST',
      body: { customerName },
    }),
    enabled: !!customerName,
    staleTime: 15 * 60 * 1000,
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 rounded-[28px] bg-white dark:bg-gray-800/50 border border-dashed border-indigo-200 shadow-sm">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Synthesizing Customer Intelligence...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 rounded-[28px] bg-rose-50 dark:bg-rose-900/20 border border-dashed border-rose-200 text-rose-600 shadow-sm">
        <div className="flex items-start gap-4">
          <AlertTriangle className="h-8 w-8 shrink-0" />
          <div className="space-y-3">
            <div>
              <p className="font-bold text-lg tracking-tight">Intelligence Engine Offline</p>
              <p className="text-sm opacity-80 max-w-2xl leading-relaxed">
                {error.message.includes("GEMINI_API_KEY") 
                  ? "The AI analysis engine is missing its API key. Please contact your administrator to set the GEMINI_API_KEY secret."
                  : `We encountered an error while processing data for ${customerName}: ${error.message}`}
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()} 
              disabled={isFetching}
              className="bg-white hover:bg-rose-50 border-rose-200 text-rose-600 gap-2 rounded-xl font-bold"
            >
              {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.status === 'No Data') {
    return (
      <div className="p-8 rounded-[28px] bg-white dark:bg-gray-800/50 border border-dashed border-border flex items-center gap-4 shadow-sm">
        <Info className="h-8 w-8 text-muted-foreground opacity-50" />
        <div>
          <h2 className="text-xl font-bold tracking-tight">{customerName}</h2>
          <p className="text-sm text-muted-foreground font-medium">
            {data?.ai_summary?.status || "Insufficient ticket history to generate a comprehensive intelligence profile."}
          </p>
          <Button variant="link" onClick={() => refetch()} className="p-0 h-auto text-xs mt-2 font-bold text-indigo-600">Refresh Data</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricWidget type="health" data={data} />
        <MetricWidget type="activity" data={data} />
        <MetricWidget type="sla" data={data} />
      </div>

      <AISummary summary={data.ai_summary} confidence={data.confidence} explainability={data.explainability} />
    </div>
  );
};

export default CustomerIntelligenceHeader;