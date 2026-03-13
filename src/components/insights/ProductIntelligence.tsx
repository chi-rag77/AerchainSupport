"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, MessageSquare, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { IssueCluster } from '@/features/insights/types';

const ProductIntelligence = ({ clusters }: { clusters: IssueCluster[] }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
          <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-xl font-black tracking-tight">Product Intelligence</h3>
      </div>
      <div className="space-y-4">
        {clusters.slice(0, 2).map((item, index) => (
          <Card key={index} className="border-none shadow-sm rounded-[24px] bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-base font-bold">{item.topic}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase text-muted-foreground mb-1">Probable Issue</h4>
                <p className="text-sm font-semibold">{item.linkedEvent}</p>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase text-muted-foreground mb-1">Indicators</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{item.count} related tickets</Badge>
                  <Badge variant="secondary">{item.trend > 0 ? `+${item.trend}%` : `${item.trend}%`} trend this week</Badge>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <h4 className="text-xs font-bold uppercase text-blue-600 mb-1">Recommendation</h4>
                <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">Investigate correlation with recent release and user journey.</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProductIntelligence;