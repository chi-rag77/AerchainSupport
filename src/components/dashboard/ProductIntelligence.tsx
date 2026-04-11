"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Package, ExternalLink, TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IssueCluster } from '@/features/dashboard/types';

interface ProductIntelligenceProps {
  clusters: IssueCluster[];
}

const ProductIntelligence = ({ clusters = [] }: ProductIntelligenceProps) => {
  return (
    <Card className="border-none shadow-sm bg-white dark:bg-gray-900 rounded-[16px] overflow-hidden h-full flex flex-col">
      <div className="p-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-blue-600" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Top Recurring Issues</h3>
        </div>
        <button className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
          View All <ExternalLink className="h-3 w-3" />
        </button>
      </div>

      <CardContent className="p-6 pt-0 flex-1 flex flex-col justify-between">
        <div className="space-y-6">
          {clusters.slice(0, 3).map((issue, idx) => (
            <div key={issue.id} className="flex gap-4 group">
              <span className="text-sm font-bold text-slate-400 mt-0.5">{idx + 1}.</span>
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors cursor-pointer">
                    {issue.title}
                  </h4>
                  <span className="text-xs font-medium text-slate-400">({issue.occurrences} tickets)</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-medium text-slate-500">
                  <div className="flex items-center gap-1">
                    <span>Trend:</span>
                    {issue.trend === 'increasing' ? (
                      <span className="text-rose-600 flex items-center gap-0.5 font-bold">
                        <TrendingUp className="h-3 w-3" /> ↑300%
                      </span>
                    ) : issue.trend === 'decreasing' ? (
                      <span className="text-emerald-600 flex items-center gap-0.5 font-bold">
                        <TrendingDown className="h-3 w-3" /> ↓20%
                      </span>
                    ) : (
                      <span className="text-slate-400 flex items-center gap-0.5 font-bold">
                        <Minus className="h-3 w-3" /> Stable
                      </span>
                    )}
                  </div>
                  <span>Affected: 12 customers</span>
                  <span className="text-slate-400 italic">{issue.suggestedFix || "Needs product fix"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 mt-8">
          <Button className="h-9 px-6 rounded-full bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs">
            Alert Product
          </Button>
          <Button variant="secondary" className="h-9 px-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs">
            Stats
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductIntelligence;