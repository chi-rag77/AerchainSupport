"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface DualMetricCardProps {
  title: string;
  metric1Title: string;
  metric1Value: string | number;
  metric1Trend?: number;
  metric1Description?: string;
  metric2Title: string;
  metric2Value: string | number;
  metric2Trend?: number;
  metric2Description?: string;
  className?: string;
  onClick?: () => void;
}

const DualMetricCard = ({
  title,
  metric1Title,
  metric1Value,
  metric1Trend,
  metric1Description,
  metric2Title,
  metric2Value,
  metric2Trend,
  metric2Description,
  className,
  onClick,
}: DualMetricCardProps) => {
  const getTrendDisplay = (trend?: number) => {
    if (trend === undefined) return null;
    const trendColor = trend > 0 ? "text-green-500" : trend < 0 ? "text-red-500" : "text-gray-500";
    const TrendIcon = trend > 0 ? ArrowUpRight : ArrowDownRight;
    return (
      <p className={cn("text-sm flex items-center", trendColor)}>
        <TrendIcon className="h-3 w-3 mr-1" />
        {Math.abs(trend)}%
      </p>
    );
  };

  const MetricDisplay = ({ metricTitle, metricValue, metricTrend, metricDescription }: {
    metricTitle: string;
    metricValue: string | number;
    metricTrend?: number;
    metricDescription?: string;
  }) => (
    <div>
      <div className="flex items-center text-sm font-medium text-muted-foreground mb-1">
        {metricTitle}
        {metricDescription && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3 w-3 ml-1 text-gray-400 cursor-help" />
            </TooltipTrigger>
            <TooltipContent>{metricDescription}</TooltipContent>
          </Tooltip>
        )}
      </div>
      <div className="flex items-baseline justify-between">
        <div className="text-3xl font-bold text-foreground">{metricValue}</div>
        {getTrendDisplay(metricTrend)}
      </div>
    </div>
  );

  return (
    <Card className={cn("relative overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] h-full flex flex-col", className)} onClick={onClick}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-around space-y-4">
        <MetricDisplay
          metricTitle={metric1Title}
          metricValue={metric1Value} // Corrected prop name
          metricTrend={metric1Trend}
          metricDescription={metric1Description}
        />
        <MetricDisplay
          metricTitle={metric2Title}
          metricValue={metric2Value}
          metricTrend={metric2Trend}
          metricDescription={metric2Description}
        />
      </CardContent>
    </Card>
  );
};

export default DualMetricCard;