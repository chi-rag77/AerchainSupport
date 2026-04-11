"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Repeat, TrendingUp, ArrowRight, Zap, AlertTriangle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const ProductIntelligence = () => {
  const issues = [
    { title: 'Payment Integration', count: 28, trend: 'spiking', affected: 12, status: 'Needs Fix' },
    { title: 'Export Feature', count: 15, trend: 'stable', affected: 8, status: 'Workaround' },
    { title: 'SSO Setup', count: 12, trend: 'improving', affected: 6, status: 'Docs Update' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
            <Repeat className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-xl font-black tracking-tight">Product Intelligence</h3>
        </div>
        <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-none font-bold text-[10px] uppercase tracking-widest">
          <Sparkles className="h-3 w-3 mr-1.5" /> AI Pattern Recognition
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {issues.map((issue, idx) => (
          <Card key={issue.title} className="group relative overflow-hidden border-none bg-white dark:bg-gray-900 shadow-glass hover:shadow-md transition-all rounded-[28px]">
            <CardContent className="p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h4 className="text-lg font-black tracking-tight group-hover:text-indigo-600 transition-colors">{issue.title}</h4>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{issue.affected} Customers Affected</p>
                </div>
                <Badge className={cn(
                  "font-black uppercase tracking-widest text-[9px] border-none px-3 py-1 rounded-full",
                  issue.trend === 'spiking' ? "bg-rose-50 text-rose-600" : issue.trend === 'stable' ? "bg-indigo-50 text-indigo-600" : "bg-green-50 text-green-600"
                )}>
                  {issue.trend}
                </Badge>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black tracking-tighter">{issue.count}</span>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Tickets</span>
              </div>

              <div className="pt-4 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={cn("h-3.5 w-3.5", issue.status === 'Needs Fix' ? "text-rose-500" : "text-amber-500")} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{issue.status}</span>
                </div>
                <button className="text-indigo-600 font-black text-[10px] uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                  Details <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProductIntelligence;