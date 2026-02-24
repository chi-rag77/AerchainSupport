"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AutomationROI } from '@/features/insights/types';
import { Zap, Sparkles, ArrowRight, MousePointer2, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const AutomationOpportunity = ({ data }: { data: AutomationROI }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
          <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </div>
        <h3 className="text-xl font-black tracking-tight">Automation Opportunity Detector</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ROI Summary */}
        <Card className="rounded-[28px] border-none bg-white dark:bg-gray-800 shadow-sm p-8 space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Potential Automation Rate</span>
            <div className="text-5xl font-black tracking-tighter text-amber-500">{data.potentialAutomationRate}%</div>
            <Progress value={data.potentialAutomationRate} className="h-2" indicatorClassName="bg-amber-500" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Estimated Monthly Savings</span>
            <div className="text-3xl font-black tracking-tighter">₹{(data.estimatedSavings / 100000).toFixed(1)}L</div>
          </div>
          <Button className="w-full rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold gap-2">
            View ROI Dashboard <ArrowRight className="h-4 w-4" />
          </Button>
        </Card>

        {/* Top Categories */}
        <Card className="lg:col-span-2 rounded-[28px] border-none bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              High-Deflection Potential Topics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-0 space-y-4">
            {data.topCategories.map((cat, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-border group hover:border-amber-200 transition-all">
                <div className="space-y-1">
                  <h5 className="font-bold">{cat.name}</h5>
                  <p className="text-xs text-muted-foreground font-medium">Avg. Resolution: {cat.avgResolutionTime}h</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Deflection</span>
                    <div className="text-lg font-black text-amber-600">{cat.deflectionPotential}%</div>
                  </div>
                  <Button variant="ghost" size="sm" className="rounded-full font-bold text-xs gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Convert to Automation <MousePointer2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AutomationOpportunity;