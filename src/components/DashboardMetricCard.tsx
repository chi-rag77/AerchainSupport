"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"; // Import Tooltip components

interface DashboardMetricCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType; // Changed to React.ElementType for Lucide icons
  trend?: number; // Percentage change, e.g., 12 for +12%, -5 for -5%
  description?: string;
  className?: string;
  onClick?: () => void;
  isTier1?: boolean; // New prop for visual tiering
}

const DashboardMetricCard = ({
  title,
  value,
  icon: Icon,
  trend,
  description,
  className,
  onClick,
  isTier1 = false,
}: DashboardMetricCardProps) => {
  const trendColor = trend && trend > 0 ? "text-red-500" : trend && trend < 0 ? "text-green-500" : "text-gray-500";
  const TrendIcon = trend && trend > 0 ? ArrowUpRight : ArrowDownRight;

  const tier1Classes = isTier1 ? "border-2 border-red-500 dark:border-red-400 bg-red-50/50 dark:bg-red-950/30 shadow-red-200/50 dark:shadow-red-900/50" : "";
  const valueClasses = isTier1 ? "text-3xl font-extrabold text-red-600 dark:text-red-400" : "text-2xl font-bold text-foreground";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Card 
          className={cn(
            "relative overflow-hidden group cursor-pointer transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-[1.02]", 
            className,
            tier1Classes
          )} 
          onClick={onClick}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pt-2 pb-0"> {/* Adjusted padding */}
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <Icon className={cn("h-4 w-4", isTier1 ? "text-red-500 dark:text-red-400" : "text-muted-foreground")} />
          </CardHeader>
          <CardContent className="p-2"> {/* Reduced padding */}
            <div className={valueClasses}>{value}</div> {/* Reduced font size */}
            {trend !== undefined && trend !== 0 && ( // Added explicit check for trend !== 0
              <p className={cn("text-xs flex items-center mt-1", trendColor)}>
                <TrendIcon className="h-3 w-3 mr-1" />
                {Math.abs(trend)}% vs. prev period
              </p>
            )}
            {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
          </CardContent>
        </Card>
      </TooltipTrigger>
      {description && <TooltipContent>{description}</TooltipContent>}
    </Tooltip>
  );
};

export default DashboardMetricCard;