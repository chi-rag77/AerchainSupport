"use client";

import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, List, LayoutGrid, Kanban, SlidersHorizontal, 
  ArrowUpDown, RefreshCw, X, Filter, Zap, Loader2,
  Target, Brain, Layers, Eye, Clock
} from 'lucide-react';
import { QueueViewMode } from '../types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CsvUploadAction from '@/components/tickets/CsvUploadAction';

interface QueueCommandBarProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  viewMode: QueueViewMode;
  onViewModeChange: (mode: QueueViewMode) => void;
  onOpenFilters: () => void;
  activeFilterCount: number;
  isSyncing: boolean;
  onSync: () => void;
  sortBy: string;
  onSortChange: (val: any) => void;
}

const QueueCommandBar = ({
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onOpenFilters,
  activeFilterCount,
  isSyncing,
  onSync,
  sortBy,
  onSortChange
}: QueueCommandBarProps) => {
  return (
    <div className="sticky top-0 z-30 w-full p-2 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-800/30 shadow-glass rounded-[24px] mb-4">
      <div className="flex items-center justify-between gap-4 px-2">
        {/* Left: Spotlight Search & Smart Sort */}
        <div className="flex-1 flex items-center gap-3">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-indigo-600 transition-colors" />
            <Input 
              placeholder="Search queue (⌘K)..." 
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-11 bg-white/50 dark:bg-gray-800/50 border-none rounded-xl shadow-inner focus-visible:ring-2 focus-visible:ring-indigo-500/50 font-medium"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-11 rounded-xl border-none bg-white/50 dark:bg-gray-800/50 shadow-sm font-bold gap-2 px-4">
                <Target className="h-4 w-4 text-indigo-600" />
                <span className="text-xs uppercase tracking-widest">Sort by Intent</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="rounded-xl w-56">
              <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Intelligence Sort</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onSortChange('intent')} className="gap-2 font-bold cursor-pointer">
                <Zap className="h-4 w-4 text-amber-500" /> Needs Attention
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange('sla')} className="gap-2 font-bold cursor-pointer">
                <Clock className="h-4 w-4 text-rose-500" /> SLA Risk
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange('intent')} className="gap-2 font-bold cursor-pointer">
                <Brain className="h-4 w-4 text-indigo-600" /> AI Priority
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onSortChange('created')} className="gap-2 font-medium cursor-pointer">
                <ArrowUpDown className="h-4 w-4" /> Newest First
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Center: Advanced View Toggles */}
        <div className="flex items-center p-1 bg-gray-100/50 dark:bg-gray-800/50 rounded-xl border border-white/10">
          <Button 
            variant="ghost" size="sm" 
            onClick={() => onViewModeChange('list')}
            className={cn("h-8 px-3 rounded-lg gap-2", viewMode === 'list' && "bg-white dark:bg-gray-700 shadow-sm")}
          >
            <List className="h-4 w-4" />
            <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest">List</span>
          </Button>
          <Button 
            variant="ghost" size="sm" 
            onClick={() => onViewModeChange('cluster')}
            className={cn("h-8 px-3 rounded-lg gap-2", viewMode === 'cluster' && "bg-white dark:bg-gray-700 shadow-sm")}
          >
            <Layers className="h-4 w-4" />
            <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest">Cluster</span>
          </Button>
          <Button 
            variant="ghost" size="sm" 
            onClick={() => onViewModeChange('focus')}
            className={cn("h-8 px-3 rounded-lg gap-2", viewMode === 'focus' && "bg-white dark:bg-gray-700 shadow-sm")}
          >
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest">Focus</span>
          </Button>
          <Button 
            variant="ghost" size="sm" 
            onClick={() => onViewModeChange('kanban')}
            className={cn("h-8 px-3 rounded-lg gap-2", viewMode === 'kanban' && "bg-white dark:bg-gray-700 shadow-sm")}
          >
            <Kanban className="h-4 w-4" />
            <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest">Board</span>
          </Button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <CsvUploadAction />
          <Button variant="outline" size="icon" onClick={onOpenFilters} className="rounded-xl relative border-none bg-white/50 dark:bg-gray-800/50 shadow-sm h-11 w-11">
            <SlidersHorizontal className="h-4 w-4" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>
          <Button 
            onClick={onSync} 
            disabled={isSyncing}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 h-11 px-6 font-black text-[10px] uppercase tracking-widest gap-2"
          >
            {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Sync
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QueueCommandBar;