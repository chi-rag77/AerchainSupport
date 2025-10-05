"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Clock, Info, Users, Tag, Building2, Ticket } from 'lucide-react'; // Added Tag and Building2 icons, and Ticket
import { Insight } from '@/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge'; // Import Badge component

interface InsightsPanelProps {
  insights: Insight[];
}

// Map insight types to Lucide icons for visual representation
const iconMap: { [key: string]: React.ElementType } = {
  stalledOnTech: Clock,
  highPriority: AlertCircle,
  info: Info,
  highVolumeCustomer: Users,
  Clock: Clock,
  AlertCircle: AlertCircle,
  Info: Info,
  Users: Users,
  Ticket: Ticket, // Added Ticket to iconMap
};

const InsightsPanel = ({ insights }: InsightsPanelProps) => {
  if (insights.length === 0) {
    return (
      <Card className="h-full flex items-center justify-center text-muted-foreground text-sm">
        <CardContent className="text-center">
          No insights match the current filters.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {insights.map(insight => {
        const IconComponent = (insight.icon && iconMap[insight.icon]) ? iconMap[insight.icon] : iconMap[insight.type] || iconMap.info;
        
        const severityClass = {
          'info': 'border-blue-400 bg-blue-50/50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-200',
          'warning': 'border-yellow-400 bg-yellow-50/50 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-200',
          'critical': 'border-red-400 bg-red-50/50 dark:bg-red-950/30 text-red-800 dark:text-red-200',
        }[insight.severity];

        return (
          <Card key={insight.id} className={cn("border-l-4", severityClass)}>
            <CardContent className="flex flex-col p-3">
              <div className="flex items-center mb-2">
                <IconComponent className="h-5 w-5 mr-3 flex-shrink-0" />
                <p className="text-sm font-medium flex-grow">{insight.message}</p>
                <Badge variant="secondary" className={cn(
                  "ml-2 text-xs font-semibold",
                  insight.severity === 'critical' && "bg-red-500 text-white",
                  insight.severity === 'warning' && "bg-yellow-500 text-black",
                  insight.severity === 'info' && "bg-blue-500 text-white"
                )}>
                  {insight.severity.charAt(0).toUpperCase() + insight.severity.slice(1)}
                </Badge>
              </div>

              {insight.type === 'stalledOnTech' && (
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-2">
                  {insight.ticketId && (
                    <Badge variant="outline" className="flex items-center">
                      <Tag className="h-3 w-3 mr-1" /> Ticket ID: {insight.ticketId}
                    </Badge>
                  )}
                  {insight.companyName && (
                    <Badge variant="outline" className="flex items-center">
                      <Building2 className="h-3 w-3 mr-1" /> Company: {insight.companyName}
                    </Badge>
                  )}
                  {insight.ticketStatus && (
                    <Badge variant="outline" className="flex items-center">
                      <Info className="h-3 w-3 mr-1" /> Status: {insight.ticketStatus}
                    </Badge>
                  )}
                  {insight.daysStalled !== undefined && (
                    <Badge variant="outline" className={cn(
                      "flex items-center",
                      insight.daysStalled >= 5 ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" : ""
                    )}>
                      <Clock className="h-3 w-3 mr-1" /> Stalled: <span className="font-bold ml-1">{insight.daysStalled} days</span>
                    </Badge>
                  )}
                </div>
              )}

              {insight.type === 'highVolumeCustomer' && (
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-2">
                  {insight.customerName && (
                    <Badge variant="outline" className="flex items-center">
                      <Building2 className="h-3 w-3 mr-1" /> Customer: {insight.customerName}
                    </Badge>
                  )}
                  {insight.ticketCount !== undefined && (
                    <Badge variant="outline" className={cn(
                      "flex items-center",
                      insight.ticketCount >= 10 ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" : ""
                    )}>
                      <Ticket className="h-3 w-3 mr-1" /> Tickets: <span className="font-bold ml-1">{insight.ticketCount}</span>
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default InsightsPanel;