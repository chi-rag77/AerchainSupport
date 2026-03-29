"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { 
  RefreshCw, Brain, CalendarDays, Search, 
  Filter, ChevronRight, Activity 
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useDashboard } from '@/features/dashboard/DashboardContext';

interface DashboardSubbarProps {
  isSyncing: boolean;
  onSync: () => void;
  onViewInsights: () => void;
  uniqueCompanies: string[];
  selectedCustomer: string;
  onCustomerChange: (val: string) => void;
}

const DashboardSubbar = ({ 
  isSyncing, 
  onSync, 
  onViewInsights, 
  uniqueCompanies, 
  selectedCustomer, 
  onCustomerChange 
}: DashboardSubbarProps) => {
  const { dateRange, setDateRange, datePreset, setDatePreset } = useDashboard();

  return (
    <div className="h-12 border-b border-border bg-white/50 dark:bg-gray-900/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-16 z-40">
      {/* Left: Context & Breadcrumb */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
          <span>Operations</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">Overview</span>
        </div>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">Live</span>
        </div>
      </div>

      {/* Right: Action Chips */}
      <div className="flex items-center gap-3">
        {/* Search Hint */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-[10px] font-bold text-muted-foreground border border-border/50">
          <Search className="h-3 w-3" />
          <span>Search Queue</span>
          <kbd className="bg-white dark:bg-gray-700 px-1 rounded border border-border shadow-sm">⌘K</kbd>
        </div>

        <Separator orientation="vertical" className="h-4" />

        {/* Customer Filter */}
        <Select value={selectedCustomer} onValueChange={onCustomerChange}>
          <SelectTrigger className="h-8 w-fit min-w-[140px] border-none bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-[11px] font-bold uppercase tracking-tight gap-2">
            <Filter className="h-3 w-3 text-muted-foreground" />
            <SelectValue placeholder="All Accounts" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-none shadow-2xl">
            <SelectItem value="All">All Accounts</SelectItem>
            {uniqueCompanies.map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date Picker */}
        <div className="flex items-center gap-1 bg-gray-100/50 dark:bg-gray-800/50 p-0.5 rounded-lg border border-border/50">
          <Select value={datePreset} onValueChange={setDatePreset}>
            <SelectTrigger className="h-7 border-none bg-transparent focus:ring-0 text-[10px] font-bold uppercase tracking-tight px-2">
              <CalendarDays className="mr-1.5 h-3 w-3 text-muted-foreground" />
              <SelectValue placeholder="Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last7days">Last 7 Days</SelectItem>
              <SelectItem value="last30days">Last 30 Days</SelectItem>
              <SelectItem value="thismonth">This Month</SelectItem>
              <SelectItem value="lastmonth">Last Month</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
          
          {datePreset === 'custom' && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="h-7 px-2 text-[9px] font-black uppercase">
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

        <Separator orientation="vertical" className="h-4" />

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onSync} 
            disabled={isSyncing}
            className="h-8 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest gap-2 hover:bg-indigo-50 text-indigo-600"
          >
            <RefreshCw className={cn("h-3 w-3", isSyncing && "animate-spin")} />
            Sync
          </Button>
          <Button 
            size="sm" 
            onClick={onViewInsights}
            className="h-8 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
          >
            <Brain className="h-3 w-3" />
            AI Insights
          </Button>
        </div>
      </div>
    </div>
  );
};

import { Separator } from '@/components/ui/separator';
export default DashboardSubbar;