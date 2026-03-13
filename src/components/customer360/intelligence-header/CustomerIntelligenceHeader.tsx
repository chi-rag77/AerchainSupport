"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { invokeEdgeFunction } from '@/lib/apiClient';
import { CustomerIntelligenceData } from '@/features/customer360/types';
import { Loader2, AlertTriangle } from 'lucide-react';
import CustomerMetadata from './CustomerMetadata';
import MetricWidget from './MetricWidget';
import AISummary from './AISummary';
import { Separator } from '@/components/ui/separator';

interface CustomerIntelligenceHeaderProps {
  customerName: string;
}

const CustomerIntelligenceHeader = ({ customerName }: CustomerIntelligenceHeaderProps) => {
  const { data, isLoading, error } = useQuery<CustomerIntelligenceData, Error>({
    queryKey: ['customerIntelligence', customerName],
    queryFn: () => invokeEdgeFunction('get-customer-intelligence', {
      method: 'POST',
      body: { customerName },
    }),
    enabled: !!customerName,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-dashed">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mr-3" />
        <span className="font-bold text-muted-foreground">Synthesizing Customer Intelligence...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-dashed border-red-200 text-red-600">
        <AlertTriangle className="h-8 w-8 mr-3" />
        <span className="font-bold">Error: {error.message}</span>
      </div>
    );
  }

  if (!data || data.status === 'No Data') {
    return (
      <div className="p-8 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-dashed">
        <h2 className="text-xl font-bold mb-2">{customerName}</h2>
        <p className="text-muted-foreground">{data?.ai_summary.status || "Not enough data to generate insights for this customer."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{data.customer}</h2>
        <CustomerMetadata metadata={data.metadata} />
      </div>
      
      <Separator />

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