"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight, Ticket, Zap, TrendingUp, ShieldAlert } from 'lucide-react';

interface IssueIntelligenceSummaryProps {
  totalTickets: number;
  topModule: string;
  globalTrend: number;
  escalations: number;
}

const IssueIntelligenceSummary = ({ totalTickets, topModule, globalTrend, escalations }: IssueIntelligenceSummaryProps) => {
  const items = [
    { label: "Total Tickets (6M)", value: totalTickets, icon: Ticket, color: "blue" },
    { label: "Most Problematic", value: topModule, icon: Zap, color: "amber" },
    { label: "Global Trend", value: `${globalTrend > 0 ? '+' : ''}${globalTrend}%`, icon: TrendingUp, color: globalTrend > 0 ? "red" : "green" },
    { label: "Critical Escalations", value: escalations, icon: ShieldAlert, color: "red" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <Card key={item.label} className="border-none shadow-sm bg-white dark:bg-gray-800 rounded-2xl overflow-hidden group hover:shadow-md transition-all">
          <CardContent className="p-5 flex items-center gap-4">
            <div className={cn(
              "p-2.5 rounded-xl shrink-0",
              item.color === 'blue' && "bg-blue-50 text-blue-600",
              item.color === 'amber' && "bg-amber-50 text-amber-600",
              item.color === 'red' && "bg-red-50 text-red-600",
              item.color === 'green' && "bg-green-50 text-green-600",
            )}>
              <item.icon className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{item.label}</p>
              <p className="text-xl font-black tracking-tight">{item.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default IssueIntelligenceSummary;