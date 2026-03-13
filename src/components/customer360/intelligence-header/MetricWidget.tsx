"use client";

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MetricWidgetProps {
  label: string;
  value: string | number;
  subValue?: string;
  status?: 'Excellent' | 'Healthy' | 'Watchlist' | 'At Risk' | 'Critical' | 'Low' | 'Medium' | 'High' | 'No Data';
}

const MetricWidget = ({ label, value, subValue, status }: MetricWidgetProps) => {
  const getStatusColor = () => {
    switch (status) {
      case 'Excellent':
      case 'Healthy':
      case 'Low':
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case 'Watchlist':
      case 'Medium':
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
      case 'At Risk':
      case 'Critical':
      case 'High':
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  return (
    <div className="space-y-1">
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-black tracking-tighter text-foreground">{value}</p>
        {subValue && <p className="text-lg font-bold text-muted-foreground">{subValue}</p>}
        {status && <Badge className={cn("text-xs font-bold", getStatusColor())}>{status}</Badge>}
      </div>
    </div>
  );
};

export default MetricWidget;