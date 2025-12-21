"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight, Clock, AlertCircle, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from 'framer-motion';
import CountUp from 'react-countup';

// Define Archetypes
type KpiArchetype = 'attention' | 'health' | 'volume';

interface DashboardMetricCardV2Props {
  title: string;
  value: string | number;
  icon: React.ElementType;
  archetype: KpiArchetype;
  trend?: number; // Percentage change
  subtext: string; // Contextual interpretation or secondary number
  cta?: string; // Call to action text
  onClick: () => void;
  isLoading?: boolean;
}

const DashboardMetricCardV2 = ({
  title,
  value,
  icon: Icon,
  archetype,
  trend,
  subtext,
  cta,
  onClick,
  isLoading = false,
}: DashboardMetricCardV2Props) => {
  const isNumericValue = typeof value === 'number';
  const numericValue = isNumericValue ? value : 0;
  const displayValue = isNumericValue ? (
    <CountUp 
      start={0} 
      end={numericValue} 
      duration={1.5} 
      separator="," 
      decimals={0} 
      className="text-4xl font-extrabold"
    />
  ) : (
    <span className="text-4xl font-extrabold">{value}</span>
  );

  const trendColor = trend && trend > 0 ? "text-red-500" : trend && trend < 0 ? "text-green-500" : "text-gray-500";
  const TrendIcon = trend && trend > 0 ? ArrowUpRight : ArrowDownRight;

  // --- Archetype Styling ---
  const baseClasses = "relative overflow-hidden transition-all duration-300 shadow-sm rounded-[16px] cursor-pointer border-none";
  let accentClasses = "";
  let iconColor = "text-muted-foreground";

  switch (archetype) {
    case 'attention':
      accentClasses = "bg-red-50/50 dark:bg-red-950/30 hover:shadow-red-200/50 dark:hover:shadow-red-900/50";
      iconColor = "text-red-600 dark:text-red-400";
      break;
    case 'health':
      accentClasses = "bg-yellow-50/50 dark:bg-yellow-950/30 hover:shadow-yellow-200/50 dark:hover:shadow-yellow-900/50";
      iconColor = "text-yellow-600 dark:text-yellow-400";
      break;
    case 'volume':
    default:
      accentClasses = "bg-card hover:shadow-blue-200/50 dark:hover:shadow-blue-900/50";
      iconColor = "text-blue-600 dark:text-blue-400";
      break;
  }

  const LeftAccent = () => {
    if (archetype === 'attention') {
      return (
        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-red-500 to-red-700 rounded-l-[16px]">
          <div className="absolute top-2 left-0.5 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      className={cn(baseClasses, accentClasses)}
      whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(0,0,0,0.1)" }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <LeftAccent />
      <Card className={cn("h-full p-4 border-none bg-transparent", archetype === 'attention' && "pl-6")}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[150px] text-gray-500 dark:text-gray-400">
            <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
            <p className="text-xs">Loading...</p>
          </div>
        ) : (
          <>
            {/* Header (Label + Signal) */}
            <CardHeader className="flex flex-row items-start justify-between space-y-0 p-0 mb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Icon className={cn("h-4 w-4", iconColor)} />
                {title}
              </CardTitle>
              {archetype === 'attention' && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse-slow" />
                  </TooltipTrigger>
                  <TooltipContent>Critical attention required</TooltipContent>
                </Tooltip>
              )}
            </CardHeader>

            {/* Primary Value */}
            <CardContent className="p-0 space-y-1">
              <div className="text-foreground">
                {displayValue}
              </div>

              {/* Secondary Insight */}
              <p className="text-sm text-muted-foreground min-h-[20px]">{subtext}</p>

              {/* Micro Trend / CTA */}
              <div className="flex justify-between items-center pt-2">
                {trend !== undefined && (
                  <p className={cn("text-xs flex items-center font-medium", trendColor)}>
                    <TrendIcon className="h-3 w-3 mr-1" />
                    {Math.abs(trend)}% vs. prev period
                  </p>
                )}
                {cta && (
                  <span className="text-xs text-blue-600 dark:text-blue-400 flex items-center font-medium group-hover:underline">
                    {cta} <ArrowRight className="h-3 w-3 ml-1" />
                  </span>
                )}
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </motion.div>
  );
};

export default DashboardMetricCardV2;