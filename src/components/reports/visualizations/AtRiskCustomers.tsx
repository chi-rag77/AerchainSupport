"use client";

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingDown, AlertTriangle, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

const DATA = [
  { id: '1', name: 'Danone', health: 42, trend: -12, risk: 'High', reason: 'SLA Breaches (4)' },
  { id: '2', name: 'Unilever', health: 58, trend: -8, risk: 'Medium', reason: 'Declining Engagement' },
  { id: '3', name: 'Nestle', health: 35, trend: -15, risk: 'Critical', reason: 'Executive Escalation' },
  { id: '4', name: 'PepsiCo', health: 62, trend: -5, risk: 'Medium', reason: 'Backlog Growth' },
];

const AtRiskCustomers = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black tracking-tight">Prioritized Risk List</h3>
        <Badge variant="destructive" className="font-black uppercase tracking-widest text-[10px]">
          {DATA.length} Accounts Requiring Attention
        </Badge>
      </div>

      <div className="rounded-[24px] border border-border overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-gray-800">
            <TableRow>
              <TableHead className="font-black text-[10px] uppercase tracking-widest">Customer</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-center">Health Score</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-center">30D Trend</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest">Primary Risk Factor</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {DATA.map((item) => (
              <TableRow key={item.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <TableCell className="font-bold text-base">{item.name}</TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className={cn(
                      "text-lg font-black",
                      item.health < 40 ? "text-rose-600" : "text-amber-600"
                    )}>{item.health}</span>
                    <div className="w-16 h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full", item.health < 40 ? "bg-rose-500" : "bg-amber-500")} 
                        style={{ width: `${item.health}%` }} 
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1 text-rose-600 font-black text-xs">
                    <TrendingDown className="h-3 w-3" />
                    {item.trend}%
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "p-1.5 rounded-lg",
                      item.risk === 'Critical' ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
                    )}>
                      {item.risk === 'Critical' ? <ShieldAlert className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                    </div>
                    <span className="text-sm font-bold text-foreground/80">{item.reason}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    Investigate <ArrowRight className="h-3 w-3" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AtRiskCustomers;