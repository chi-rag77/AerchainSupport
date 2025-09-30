"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Clock, Info, Users } from 'lucide-react'; // Added Users icon
import { Insight } from '@/types';
import { cn } from '@/lib/utils';

interface InsightsPanelProps {
  insights: Insight[];
}

// Map insight types to Lucide icons for visual representation
const iconMap: { [key: string]: React.ElementType } = {
  stalledOnTech: Clock,
  highPriority: AlertCircle,
  info: Info,
  highVolumeCustomer: Users, // Added mapping for highVolumeCustomer
  Clock: Clock,
  AlertCircle: AlertCircle,
  Info: Info,
  Users: Users, // Explicitly map string "Users" to Users icon
};

const InsightsPanel = ({ insights }: InsightsPanelProps) => {
  if (insights.length === 0) {
    return (
      <Card className="h-full flex items-center justify-center text-muted-foreground text-sm">
        <CardContent className="text-center">
          No new insights for the selected period.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground mb-2">Insights</h3>
      {insights.map(insight => {
        const IconComponent = (insight.icon && iconMap[insight.icon]) ? iconMap[insight.icon] : iconMap[insight.type] || iconMap.info;
        
        const severityClass = {
          'info': 'border-blue-400 bg-blue-50/50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-200',
          'warning': 'border-yellow-400 bg-yellow-50/50 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-200',
          'critical': 'border-red-400 bg-red-50/50 dark:bg-red-950/30 text-red-800 dark:text-red-200',
        }[insight.severity];

        return (
          <Card key={insight.id} className={cn("border-l-4", severityClass)}>
            <CardContent className="flex items-center p-3">
              <IconComponent className="h-5 w-5 mr-3 flex-shrink-0" />
              <p className="text-sm font-medium">{insight.message}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default InsightsPanel;