"use client";

import React from 'react';
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/MultiSelect";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { TicketFilters } from '@/features/tickets/types';
import { 
  User, Building2, Tag, ShieldAlert, Clock, 
  FilterX, CheckCircle2, AlertCircle 
} from 'lucide-react';

interface QueueFiltersProps {
  filters: TicketFilters;
  onFilterChange: (filters: TicketFilters) => void;
  uniqueFilters: {
    assignees: string[];
    statuses: string[];
    priorities: string[];
    companies: string[];
    types: string[];
    dependencies: string[];
  };
  onReset: () => void;
}

const QueueFilters = ({ filters, onFilterChange, uniqueFilters, onReset }: QueueFiltersProps) => {
  const updateFilter = (key: keyof TicketFilters, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="space-y-8 p-1">
      {/* Section 1: Quick Intelligence */}
      <div className="space-y-4">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Quick Intelligence</h4>
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-indigo-600" />
              <Label className="text-sm font-bold">My Tickets Only</Label>
            </div>
            <Switch 
              checked={filters.myTickets} 
              onCheckedChange={(val) => updateFilter('myTickets', val)} 
            />
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <Label className="text-sm font-bold">High Priority Focus</Label>
            </div>
            <Switch 
              checked={filters.highPriority} 
              onCheckedChange={(val) => updateFilter('highPriority', val)} 
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/50">
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-4 w-4 text-orange-600" />
              <Label className="text-sm font-bold">SLA Breached</Label>
            </div>
            <Switch 
              checked={filters.slaBreached} 
              onCheckedChange={(val) => updateFilter('slaBreached', val)} 
            />
          </div>
        </div>
      </div>

      <Separator className="opacity-50" />

      {/* Section 2: Core Attributes */}
      <div className="space-y-6">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Core Attributes</h4>
        
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Status</Label>
          <Select value={filters.status} onValueChange={(val) => updateFilter('status', val)}>
            <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-gray-800 border-none shadow-sm">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              {uniqueFilters.statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Priority</Label>
          <Select value={filters.priority} onValueChange={(val) => updateFilter('priority', val)}>
            <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-gray-800 border-none shadow-sm">
              <SelectValue placeholder="Select Priority" />
            </SelectTrigger>
            <SelectContent>
              {uniqueFilters.priorities.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Assignees</Label>
          <MultiSelect
            options={uniqueFilters.assignees.map(a => ({ value: a, label: a }))}
            selected={filters.assignees}
            onSelectedChange={(val) => updateFilter('assignees', val)}
            placeholder="Filter by Assignee"
            className="h-11 rounded-xl bg-white dark:bg-gray-800 border-none shadow-sm"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Companies</Label>
          <MultiSelect
            options={uniqueFilters.companies.map(c => ({ value: c, label: c }))}
            selected={filters.companies}
            onSelectedChange={(val) => updateFilter('companies', val)}
            placeholder="Filter by Company"
            className="h-11 rounded-xl bg-white dark:bg-gray-800 border-none shadow-sm"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Ticket Types</Label>
          <MultiSelect
            options={uniqueFilters.types.map(t => ({ value: t, label: t }))}
            selected={filters.types}
            onSelectedChange={(val) => updateFilter('types', val)}
            placeholder="Filter by Type"
            className="h-11 rounded-xl bg-white dark:bg-gray-800 border-none shadow-sm"
          />
        </div>
      </div>

      <div className="pt-6">
        <Button 
          variant="ghost" 
          onClick={onReset}
          className="w-full h-12 rounded-xl font-bold text-red-600 hover:bg-red-50 gap-2"
        >
          <FilterX className="h-4 w-4" />
          Reset All Filters
        </Button>
      </div>
    </div>
  );
};

export default QueueFilters;