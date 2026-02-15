"use client";

import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, List, LayoutGrid, Kanban, SlidersHorizontal, 
  ArrowUpDown, RefreshCw, X, Filter, Zap, Loader2 
} from 'lucide-react';
import { QueueViewMode } from '../types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface QueueCommandBarProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  viewMode: QueueViewMode;
  onViewModeChange: (mode: QueueViewMode) => void;
  onOpenFilters: () => void;
  activeFilterCount: number;
  isSyncing: boolean;
  onSync: () => void;
}

const QueueCommandBar = ({
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onOpenFilters,
  activeFilterCount,
  isSyncing,
  onSync
}: QueueCommandBarProps) => {
  return (
    <div className="sticky top-0 z-30 w-full p-2 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-800/30 shadow-glass rounded-[20px] mb-6">
      <div className="flex items-center justify-between gap-4 px-2">
        {/* Left: Spotlight Search & Quick Filters */}
        <div className="flex-1 flex items-center gap-3">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search queue (⌘K)..." 
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-11 bg-white/50 dark:bg-gray-800/50 border-none rounded-xl shadow-inner focus-visible:ring-2 focus-visible:ring-indigo-500/50"
            />
            {searchTerm && (
              <button 
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          
          <div className="hidden lg:flex items-center gap-2">
            <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-none cursor-pointer hover:bg-indigo-100">
              Status: Open
            </Badge>
            <Badge variant="secondary" className="bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-none cursor-pointer hover:bg-red-100">
              Risk: High
            </Badge>
          </div>
        </div>

        {/* Center: View Toggles */}
        <div className="flex items-center p-1 bg-gray-100/50 dark:bg-gray-800/50 rounded-xl border border-white/10">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onViewModeChange('list')}
            className={cn("h-8 px-3 rounded-lg gap-2", viewMode === 'list' && "bg-white dark:bg-gray-700 shadow-sm")}
          >
            <List className="h-4 w-4" />
            <span className="hidden sm:inline text-xs font-bold">List</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onViewModeChange('compact')}
            className={cn("h-8 px-3 rounded-lg gap-2", viewMode === 'compact' && "bg-white dark:bg-gray-700 shadow-sm")}
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden sm:inline text-xs font-bold">Compact</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onViewModeChange('kanban')}
            className={cn("h-8 px-3 rounded-lg gap-2", viewMode === 'kanban' && "bg-white dark:bg-gray-700 shadow-sm")}
          >
            <Kanban className="h-4 w-4" />
            <span className="hidden sm:inline text-xs font-bold">Board</span>
          </Button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={onOpenFilters} className="rounded-xl relative border-none bg-white/50 dark:bg-gray-800/50 shadow-sm">
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
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 h-11 px-4 font-bold gap-2"
          >
            {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span className="hidden sm:inline">Sync</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QueueCommandBar;