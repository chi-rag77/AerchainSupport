"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { invokeEdgeFunction } from '@/lib/apiClient';
import { CustomerRiskRadarData } from '@/features/customer360/types';
import { Loader2, ShieldAlert, Target } from 'lucide-react';
import HealthScoreCard from './HealthScoreCard';
import SignalSection from './SignalSection';
import ActionSection from './ActionSection';
import RiskTrendTimeline from './RiskTrendTimeline';
import { motion } from 'framer-motion';

interface RiskOpportunityRadarProps {
  customerName: string;
}

const RiskOpportunityRadar = ({ customerName }: RiskOpportunityRadarProps) => {
  const { data, isLoading, error } = useQuery<CustomerRiskRadarData, Error>({
    queryKey: ['customerRiskRadar', customerName],
    queryFn: () => invokeEdgeFunction('get-customer-risk-radar', {
      method: 'POST',
      body: { customerName },
    }),
    enabled: !!customerName,
    staleTime: 10 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 rounded-[32px] bg-white dark:bg-gray-800/50 border border-dashed">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
        <span className="font-black text-muted-foreground uppercase tracking-widest text-xs">Calculating Strategic Health...</span>
      </div>
    );
  }

  if (error || !data || (data as any).empty) {
    return null; // Hide if no data
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-3 px-2">
        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
          <ShieldAlert className="h-5 w-5 text-indigo-600" />
        </div>
        <h3 className="text-xl font-black tracking-tight">Risk & Opportunity Radar</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Health Score & Trend */}
        <div className="space-y-8">
          <HealthScoreCard score={data.healthScore} status={data.status} />
          <RiskTrendTimeline timeline={data.trendTimeline} />
        </div>

        {/* Middle: Signals */}
        <div className="space-y-10">
          <SignalSection title="Customer Risk Signals" signals={data.riskSignals} type="risk" />
          <SignalSection title="Opportunity Signals" signals={data.opportunitySignals} type="opportunity" />
        </div>

        {/* Right: Actions */}
        <div className="lg:col-span-1">
          <ActionSection actions={data.recommendedActions} />
        </div>
      </div>
    </div>
  );
};

export default RiskOpportunityRadar;