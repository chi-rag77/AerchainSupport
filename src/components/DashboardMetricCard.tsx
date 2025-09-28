"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface DashboardMetricCardProps {
  title: string;
  value: string | number;
  trend?: number; // Percentage change, e.g., 12 for +12%, -5 for -5%
  description?: string;
  className?: string;
  onClick?: () => void;
}

const DashboardMetricCard = ({
  title,
  value,
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
        <Card className={cn("relative overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] h-full", className)} onClick={onClick}>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              {title}
              {description && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 ml-1 text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>{description}</TooltipContent>
                </Tooltip>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{value}</div> {/* Adjusted font size */}
            {trend !== undefined && (
              <p className={cn("text-sm flex items-center mt-1", trendColor)}> {/* Adjusted font size */}
                <TrendIcon className="h-3 w-3 mr-1" />
                {Math.abs(trend)}% this week
              </p>
            )}
          </CardContent>
        </Card>
      </TooltipTrigger>
      {/* The main tooltip for the card is handled by TooltipTrigger asChild */}
    </Tooltip>
  );
};

export default DashboardMetricCard;