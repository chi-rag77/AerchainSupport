"use client";

import React from 'react';
import { useDashboard } from '@/features/dashboard/DashboardContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { X, Filter, Building2, ListFilter, Flag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const DashboardFilterBar = ({ uniqueCompanies }: { uniqueCompanies: string[] }) => {
  const { filters, setFilters, resetFilters } = useDashboard();

  const hasFilters = Object.keys(filters).length > 0;

  const updateFilter = (key: string, value: string) => {
    if (value === 'all') {
      const newFilters = { ...filters };
      delete (newFilters as any)[key];
      setFilters(newFilters);
    } else {
      setFilters({ ...filters, [key]: value });
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-4 py-2">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground mr-2">
        <Filter className="h-3.5 w-3.5" />
        Filters
      </div>

      {/* Company Filter */}
      <Select value={filters.company || 'all'} onValueChange={(v) => updateFilter('company', v)}>
        <SelectTrigger className="w-fit min-w-[140px] h-9 rounded-full bg-white dark:bg-gray-800 border-none shadow-sm text-xs font-semibold px-4 gap-2">
          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
          <SelectValue placeholder="Company" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Companies</SelectItem>
          {uniqueCompanies.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select value={filters.status || 'all'} onValueChange={(v) => updateFilter('status', v)}>
        <SelectTrigger className="w-fit min-w-[140px] h-9 rounded-full bg-white dark:bg-gray-800 border-none shadow-sm text-xs font-semibold px-4 gap-2">
          <ListFilter className="h-3.5 w-3.5 text-muted-foreground" />
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="Open (Being Processed)">Open</SelectItem>
          <SelectItem value="On Tech">On Tech</SelectItem>
          <SelectItem value="Escalated">Escalated</SelectItem>
        </SelectContent>
      </Select>

      {/* Priority Filter */}
      <Select value={filters.priority || 'all'} onValueChange={(v) => updateFilter('priority', v)}>
        <SelectTrigger className="w-fit min-w-[140px] h-9 rounded-full bg-white dark:bg-gray-800 border-none shadow-sm text-xs font-semibold px-4 gap-2">
          <Flag className="h-3.5 w-3.5 text-muted-foreground" />
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priorities</SelectItem>
          <SelectItem value="Urgent">Urgent</SelectItem>
          <SelectItem value="High">High</SelectItem>
          <SelectItem value="Medium">Medium</SelectItem>
          <SelectItem value="Low">Low</SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={resetFilters}
          className="h-9 rounded-full text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 gap-1"
        >
          <X className="h-3.5 w-3.5" />
          Reset
        </Button>
      )}
    </div>
  );
};

export default DashboardFilterBar;