"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface QueueSummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  colorClass?: string; // For custom background/text colors
  onClick?: () => void;
}

const QueueSummaryCard = ({
  title,
  value,
  icon: Icon,
  description,
  colorClass,
  onClick,
}: QueueSummaryCardProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Card
          className={cn(
            "relative overflow-hidden group cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.01] h-full",
            colorClass,
            onClick && "hover:border-primary"
          )}
          onClick={onClick}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div className="text-3xl font-bold text-foreground">{value}</div>
            {description && (
              <Info className="h-4 w-4 text-muted-foreground ml-2" />
            )}
          </CardContent>
        </Card>
      </TooltipTrigger>
      {description && <TooltipContent>{description}</TooltipContent>}
    </Tooltip>
  );
};

export default QueueSummaryCard;