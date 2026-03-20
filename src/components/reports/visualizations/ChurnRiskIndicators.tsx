"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  TrendingDown, Users, ShieldAlert, 
  Zap, ArrowRight, AlertTriangle, Heart
} from 'lucide-react';

const INDICATORS = [
  { label: "Health Score Decline", value: "12 Accounts", trend: "+15%", status: "critical", icon: TrendingDown },
  { label: "High SLA Breaches", value: "8 Accounts", trend: "+5%", status: "warning", icon: ShieldAlert },
  { label: "Low Engagement", value: "15 Accounts", trend: "-2%", status: "warning", icon: Users },
  { label: "Critical Escalations", value: "4 Accounts", trend: "+100%", status: "critical", icon: AlertTriangle },
];

const ChurnRiskIndicators = () => {
  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {INDICATORS.map((item) => (
          <div key={item.label} className="p-6 rounded-[28px] bg-gray-50 dark:bg-gray-800 border border-border/50 space-y-4">
            <div className={cn(
              "p-2.5 rounded-xl w-fit",
              item.status === 'critical' ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-600"
            )}>
              <item.icon className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{item.label}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-black tracking-tighter">{item.value}</p>
                <span className={cn("text-[10px] font-bold", item.status === 'critical' ? "text-rose-600" : "text-amber-600")}>
                  {item.trend}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Top Churn Risk Accounts</h4>
        <div className="grid grid-cols-1 gap-3">
          {['Danone', 'Nestle', 'Unilever'].map((customer) => (
            <div key={customer} className="p-5 rounded-[24px] bg-white dark:bg-gray-800 border border-border shadow-sm flex items-center justify-between group hover:border-rose-200 transition-all">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 font-black">
                  {customer[0]}
                </div>
                <div>
                  <p className="text-sm font-black">{customer}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Health Score: 34/100</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 text-rose-600 hover:bg-rose-50">
                View Risk Profile <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChurnRiskIndicators;