"use client";

import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { RefreshCw, Brain, CalendarDays, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useDashboard } from '@/features/dashboard/DashboardContext';

interface ExecutiveHeroProps {
  userName: string;
  slaRiskScore: number;
  lastSync: string;
  isSyncing: boolean;
  onSync: () => void;
  onViewInsights: () => void;
}

const ExecutiveHero = ({ userName, slaRiskScore, lastSync, isSyncing, onSync, onViewInsights }: ExecutiveHeroProps) => {
  const { dateRange, setDateRange, datePreset, setDatePreset } = useDashboard();

  const getRiskColor = (score: number) => {
    if (score < 40) return "bg-green-500";
    if (score < 75) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="relative w-full p-8 rounded-[24px] bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 shadow-glass overflow-hidden">
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Good morning, {userName}
            </h1>
            <p className="text-lg text-muted-foreground font-medium">Executive Intelligence Overview</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Badge variant="outline" className="bg-green-50/50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200/50 py-1 px-3 gap-1.5">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              AI Monitoring Active
            </Badge>
            <Badge variant="secondary" className="bg-white/50 dark:bg-gray-700/50 py-1 px-3 gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Synced {format(new Date(lastSync), 'HH:mm')}
            </Badge>
          </div>
        </div>

        <div className="flex-1 max-w-md space-y-3">
          <div className="flex justify-between items-end">
            <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">SLA Breach Risk</span>
            <span className={cn("text-sm font-bold", slaRiskScore > 75 ? "text-red-500" : "text-muted-foreground")}>
              {slaRiskScore.toFixed(0)}%
            </span>
          </div>
          <div className="h-3 w-full bg-gray-200/50 dark:bg-gray-700/50 rounded-full overflow-hidden">
            <div 
              className={cn("h-full transition-all duration-1000 ease-out rounded-full", getRiskColor(slaRiskScore))}
              style={{ width: `${slaRiskScore}%` }}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date Range Selector */}
          <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-900/80 p-1 rounded-full border border-border shadow-sm">
            <Select value={datePreset} onValueChange={setDatePreset}>
              <SelectTrigger className="w-[140px] border-none bg-transparent focus:ring-0 h-9 rounded-full text-xs font-bold uppercase tracking-wider">
                <CalendarDays className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last7days">Last 7 Days</SelectItem>
                <SelectItem value="last30days">Last 30 Days</SelectItem>
                <SelectItem value="thismonth">This Month</SelectItem>
                <SelectItem value="lastmonth">Last Month</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
            
            {datePreset === 'custom' && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 rounded-full text-[10px] font-black px-3">
                    {dateRange.from ? format(dateRange.from, 'MMM dd') : ''} - {dateRange.to ? format(dateRange.to, 'MMM dd') : ''}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    initialFocus
                    mode="range"
                    selected={dateRange}
                    onSelect={(range) => range && setDateRange(range)}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>

          <Button 
            onClick={onSync} 
            disabled={isSyncing}
            className="rounded-full bg-white dark:bg-gray-900 text-foreground border border-border hover:bg-gray-50 shadow-sm h-11 px-6"
          >
            <RefreshCw className={cn("mr-2 h-4 w-4", isSyncing && "animate-spin")} />
            Sync
          </Button>
          <Button 
            onClick={onViewInsights}
            className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 h-11 px-6"
          >
            <Brain className="mr-2 h-4 w-4" />
            AI Insights
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveHero;