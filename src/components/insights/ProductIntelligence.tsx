"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, MessageSquare, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const issues = [
  { feature: "Payment Retry", issue: "Retry flow unclear, causing double charges.", indicators: ["Repeated user confusion", "Double charge concerns"], recommendation: "Add confirmation step and retry guidance." },
  { feature: "User Authentication", issue: "Login fails on mobile after password reset.", indicators: ["Spike in login errors", "Negative app store reviews"], recommendation: "Investigate token expiry mismatch on Android v3.2." },
];

const ProductIntelligence = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
          <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-xl font-black tracking-tight">Product Intelligence</h3>
      </div>
      <div className="space-y-4">
        {issues.map((item, index) => (
          <Card key={index} className="border-none shadow-sm rounded-[24px] bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-base font-bold">{item.feature}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase text-muted-foreground mb-1">Probable Issue</h4>
                <p className="text-sm font-semibold">{item.issue}</p>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase text-muted-foreground mb-1">Indicators</h4>
                <div className="flex flex-wrap gap-2">
                  {item.indicators.map((ind, i) => <Badge key={i} variant="secondary">{ind}</Badge>)}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <h4 className="text-xs font-bold uppercase text-blue-600 mb-1">Recommendation</h4>
                <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">{item.recommendation}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProductIntelligence;