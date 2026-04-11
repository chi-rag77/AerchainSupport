"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, ArrowUpRight, TrendingUp, TrendingDown, Minus, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CustomerRisk, RiskDistribution, RiskMovement } from '@/features/dashboard/types';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CustomerRiskIntelligenceProps {
  risks: CustomerRisk[];
  distribution: RiskDistribution;
  movement: RiskMovement;
}

const CustomerRiskIntelligence = ({ risks = [], distribution, movement }: CustomerRiskIntelligenceProps) => {
  const getActionBadge = (action: string) => {
    switch (action) {
      case 'Urgent': return <Badge className="bg-rose-500 text-white border-none font-bold text-[10px] px-3 py-0.5 rounded-full">Urgent</Badge>;
      case 'Warn': return <Badge className="bg-orange-500 text-white border-none font-bold text-[10px] px-3 py-0.5 rounded-full">Warn</Badge>;
      case 'Monitor': return <Badge className="bg-blue-500 text-white border-none font-bold text-[10px] px-3 py-0.5 rounded-full">Monitor</Badge>;
      case 'Green': return <Badge className="bg-emerald-500 text-white border-none font-bold text-[10px] px-3 py-0.5 rounded-full">Green</Badge>;
      default: return null;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-rose-600";
    if (score >= 60) return "text-orange-600";
    return "text-emerald-600";
  };

  return (
    <div className="space-y-4">
      <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 px-1">
        Customer Health & Risk
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left: Risk Distribution (4 cols) */}
        <Card className="lg:col-span-4 border-none shadow-sm bg-white dark:bg-gray-900 rounded-[16px] overflow-hidden">
          <CardContent className="p-6 space-y-8">
            <div className="flex items-center gap-2 text-indigo-600">
              <Shield className="h-4 w-4" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Risk Distribution</h4>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">High Risk</span>
                  <span className="text-[10px] font-bold text-slate-400">{distribution.high} customers</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${(distribution.high / distribution.total) * 100}%` }} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Medium Risk</span>
                  <span className="text-[10px] font-bold text-slate-400">{distribution.medium} customers</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: `${(distribution.medium / distribution.total) * 100}%` }} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Low Risk</span>
                  <span className="text-[10px] font-bold text-slate-400">{distribution.low} customers</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(distribution.low / distribution.total) * 100}%` }} />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">30-day movement:</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <div className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                  <span>→ Red: {movement.toRed}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>→ Green: {movement.toGreen}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-rose-600">
                  <div className="h-1.5 w-1.5 rounded-full bg-rose-500 opacity-50" />
                  <span>Stable Red: {movement.stableRed}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right: Churn Risk Table (8 cols) */}
        <Card className="lg:col-span-8 border-none shadow-sm bg-white dark:bg-gray-900 rounded-[16px] overflow-hidden">
          <CardContent className="p-0">
            <div className="p-6 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Customers Trending Toward Churn</h4>
              <Button variant="link" className="text-indigo-600 font-bold text-xs p-0 h-auto">View All <ArrowUpRight className="h-3 w-3 ml-1" /></Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800 border-none">
                  <TableHead className="pl-6 font-bold text-[10px] uppercase tracking-widest">Customer</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase tracking-widest">Risk Score</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase tracking-widest">Escalations</TableHead>
                  <TableHead className="pr-6 font-bold text-[10px] uppercase tracking-widest text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {risks.slice(0, 5).map((r) => (
                  <TableRow key={r.company} className="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 transition-colors">
                    <TableCell className="pl-6 py-4 font-bold text-sm">{r.company}</TableCell>
                    <TableCell>
                      <div className="flex items-baseline gap-1">
                        <span className={cn("text-base font-black", getScoreColor(r.riskScore))}>{r.riskScore}</span>
                        <span className="text-[10px] font-bold text-slate-300">/100</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{r.urgentCount}</span>
                        {r.escalationTrend === 'up' && <span className="text-rose-500 text-[10px] font-black">↑↑</span>}
                        {r.escalationTrend === 'down' && <span className="text-emerald-500 text-[10px] font-black">↓</span>}
                      </div>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      {getActionBadge(r.action)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default CustomerRiskIntelligence;