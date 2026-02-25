"use client";

import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, RefreshCw, Users, Download, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WeeklyHeroProps {
  userName: string;
  selectedCustomer: string | null;
  customers: string[];
  onCustomerChange: (val: string) => void;
  weekLabel: string;
  isSyncing: boolean;
  onSync: () => void;
}

const WeeklyHero = ({ 
  userName, 
  selectedCustomer, 
  customers, 
  onCustomerChange, 
  weekLabel, 
  isSyncing, 
  onSync 
}: WeeklyHeroProps) => {
  return (
    <div className="relative w-full p-8 rounded-[32px] bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 shadow-glass overflow-hidden">
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
      
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
              Weekly Intelligence Brief
            </h1>
            <p className="text-lg text-muted-foreground font-medium">Executive summary for {userName}</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Badge variant="outline" className="bg-indigo-50/50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-200/50 py-1 px-3 gap-1.5">
              <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
              AI Synthesis Active
            </Badge>
            <Badge variant="secondary" className="bg-white/50 dark:bg-gray-700/50 py-1 px-3 gap-1.5 font-bold">
              <CalendarDays className="h-3.5 w-3.5" />
              {weekLabel}
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 bg-white/80 dark:bg-gray-900/80 p-2 rounded-2xl border border-border shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Account:</span>
            <Select value={selectedCustomer || ""} onValueChange={onCustomerChange}>
              <SelectTrigger className="w-[240px] border-none bg-transparent focus:ring-0 h-10 font-bold text-indigo-600">
                <SelectValue placeholder="Select Account..." />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-none shadow-2xl">
                {customers.map(c => (
                  <SelectItem key={c} value={c} className="font-medium">{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              onClick={onSync} 
              disabled={isSyncing}
              className="rounded-full bg-white dark:bg-gray-900 text-foreground border border-border hover:bg-gray-50 shadow-sm h-12 px-6 font-bold"
            >
              <RefreshCw className={cn("mr-2 h-4 w-4", isSyncing && "animate-spin")} />
              Sync
            </Button>
            <Button className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 h-12 px-6 font-bold gap-2">
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyHero;