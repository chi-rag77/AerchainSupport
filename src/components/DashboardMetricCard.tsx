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
}

const DashboardMetricCard = ({
  title,
  value,
  icon: Icon,
  trend,
  description,
  className,
  onClick,
}: DashboardMetricCardProps) => {
  const trendColor = trend && trend > 0 ? "text-green-500" : trend && trend < 0 ? "text-red-500" : "text-gray-500";
  const TrendIcon = trend && trend > 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Card className={cn("relative overflow-hidden group cursor-pointer transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-[1.02]", className)} onClick={onClick}>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pt-2 pb-0"> {/* Adjusted padding */}
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-2"> {/* Reduced padding */}
            <div className="text-2xl font-bold text-foreground">{value}</div> {/* Reduced font size */}
            {trend !== undefined && trend !== 0 && ( // Added explicit check for trend !== 0
              <p className={cn("text-xs flex items-center mt-1", trendColor)}>
                <TrendIcon className="h-3 w-3 mr-1" />
                {Math.abs(trend)}% this week
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