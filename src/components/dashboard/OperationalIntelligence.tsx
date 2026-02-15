"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import VolumeSlaTrendChart from '@/components/VolumeSlaTrendChart';
import AITrendCard from './AITrendCard';
import { TrendingUp } from 'lucide-react';
import { useTrendIntelligence } from '@/features/dashboard-trend/hooks/useTrendIntelligence';
import { cn } from '@/lib/utils';

interface OperationalIntelligenceProps {
  dateRange: { from: Date; to: Date };
}

const OperationalIntelligence = ({ dateRange }: OperationalIntelligenceProps) => {
  const { trendData, signals, intelligence, isLoading } = useTrendIntelligence(dateRange);

  const riskColor = signals?.riskLevel === 'HIGH' ? 'border-red-500' : 
                    signals?.riskLevel === 'MEDIUM' ? 'border-amber-500' : 
                    'border-green-500';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Volume & SLA Performance</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
        {/* Left: Chart Section (70%) */}
        <Card className={cn(
          "lg:col-span-7 rounded-[28px] border-none bg-white dark:bg-gray-800 shadow-glass overflow-hidden transition-all duration-500",
          "border-t-4", riskColor
        )}>
          <CardHeader className="p-8 pb-0">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Performance Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 h-[450px]">
            <VolumeSlaTrendChart 
              tickets={[]} // Not used anymore, data comes from trendData
              trendData={trendData}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>

        {/* Right: AI Intelligence Card (30%) */}
        <div className="lg:col-span-3">
          <AITrendCard 
            intelligence={intelligence}
            signals={signals}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default OperationalIntelligence;