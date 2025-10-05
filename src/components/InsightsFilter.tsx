"use client";

import React, { useState, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Insight } from '@/types';
import InsightsPanel from './InsightsPanel';
import { Filter, SortAsc, SortDesc, Info, AlertCircle, ShieldAlert, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MultiSelect } from './MultiSelect';
import { cn } from '@/lib/utils';

interface InsightsFilterProps {
  insights: Insight[];
  uniqueCompanies: string[]; // Pass unique companies from parent
}

const InsightsFilter = ({ insights, uniqueCompanies }: InsightsFilterProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'daysStalled' | 'severity' | 'ticketCount' | 'none'>('none');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredAndSortedInsights = useMemo(() => {
    let currentInsights = insights;

    // Apply category filter
    if (selectedCategory === 'Stalled') {
      currentInsights = currentInsights.filter(insight => insight.type === 'stalledOnTech');
    } else if (selectedCategory === 'Customer Range') {
      currentInsights = currentInsights.filter(insight => insight.type === 'highVolumeCustomer');
    }

    // Apply severity filter
    if (selectedSeverity !== 'All') {
      currentInsights = currentInsights.filter(insight => insight.severity === selectedSeverity);
    }

    // Apply company filter
    if (selectedCompanies.length > 0) {
      currentInsights = currentInsights.filter(insight => {
        if (insight.type === 'stalledOnTech' && insight.companyName) {
          return selectedCompanies.includes(insight.companyName);
        }
        if (insight.type === 'highVolumeCustomer' && insight.customerName) {
          return selectedCompanies.includes(insight.customerName);
        }
        return false;
      });
    }

    // Apply sorting
    if (sortBy !== 'none') {
      currentInsights.sort((a, b) => {
        let compareA: any;
        let compareB: any;

        if (sortBy === 'daysStalled') {
          compareA = a.daysStalled || 0;
          compareB = b.daysStalled || 0;
        } else if (sortBy === 'ticketCount') {
          compareA = a.ticketCount || 0;
          compareB = b.ticketCount || 0;
        } else if (sortBy === 'severity') {
          const severityOrder = { 'critical': 3, 'warning': 2, 'info': 1 };
          compareA = severityOrder[a.severity] || 0;
          compareB = severityOrder[b.severity] || 0;
        }

        if (compareA < compareB) return sortOrder === 'asc' ? -1 : 1;
        if (compareA > compareB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return currentInsights;
  }, [insights, selectedCategory, selectedSeverity, selectedCompanies, sortBy, sortOrder]);

  const summary = useMemo(() => {
    const total = insights.length;
    const critical = insights.filter(i => i.severity === 'critical').length;
    const warning = insights.filter(i => i.severity === 'warning').length;
    const info = insights.filter(i => i.severity === 'info').length;
    return { total, critical, warning, info };
  }, [insights]);

  const availableSortOptions = useMemo(() => {
    const options: { value: 'daysStalled' | 'severity' | 'ticketCount' | 'none'; label: string }[] = [
      { value: 'none', label: 'None' },
      { value: 'severity', label: 'Severity' },
    ];
    if (insights.some(i => i.type === 'stalledOnTech')) {
      options.push({ value: 'daysStalled', label: 'Days Stalled' });
    }
    if (insights.some(i => i.type === 'highVolumeCustomer')) {
      options.push({ value: 'ticketCount', label: 'Ticket Count' });
    }
    return options;
  }, [insights]);

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-2">Insights Summary</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <p className="flex items-center"><Info className="h-4 w-4 mr-2 text-blue-500" /> Total: <span className="font-bold ml-1">{summary.total}</span></p>
          <p className="flex items-center"><AlertCircle className="h-4 w-4 mr-2 text-red-500" /> Critical: <span className="font-bold ml-1">{summary.critical}</span></p>
          <p className="flex items-center"><ShieldAlert className="h-4 w-4 mr-2 text-yellow-500" /> Warning: <span className="font-bold ml-1">{summary.warning}</span></p>
          <p className="flex items-center"><Info className="h-4 w-4 mr-2 text-blue-500" /> Info: <span className="font-bold ml-1">{summary.info}</span></p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center mb-4">
        {/* Category Filter */}
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2 text-gray-500" />
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Insights</SelectItem>
            <SelectItem value="Stalled">Stalled Tickets</SelectItem>
            <SelectItem value="Customer Range">Customer Activity</SelectItem>
          </SelectContent>
        </Select>

        {/* Severity Filter Buttons */}
        <Button
          variant={selectedSeverity === 'All' ? "secondary" : "outline"}
          onClick={() => setSelectedSeverity('All')}
          className={cn(selectedSeverity === 'All' ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200" : "")}
        >
          All Severity
        </Button>
        <Button
          variant={selectedSeverity === 'critical' ? "secondary" : "outline"}
          onClick={() => setSelectedSeverity('critical')}
          className={cn(selectedSeverity === 'critical' ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200" : "")}
        >
          Critical
        </Button>
        <Button
          variant={selectedSeverity === 'warning' ? "secondary" : "outline"}
          onClick={() => setSelectedSeverity('warning')}
          className={cn(selectedSeverity === 'warning' ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200" : "")}
        >
          Warning
        </Button>
        <Button
          variant={selectedSeverity === 'info' ? "secondary" : "outline"}
          onClick={() => setSelectedSeverity('info')}
          className={cn(selectedSeverity === 'info' ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200" : "")}
        >
          Info
        </Button>

        {/* Company Multi-Select Filter */}
        <MultiSelect
          options={uniqueCompanies.map(company => ({ value: company, label: company }))}
          selected={selectedCompanies}
          onSelectedChange={setSelectedCompanies}
          placeholder="Filter by Company"
          className="w-[200px]"
        />

        {/* Sort By */}
        <Select value={sortBy} onValueChange={(value: 'daysStalled' | 'severity' | 'ticketCount' | 'none') => setSortBy(value)}>
          <SelectTrigger className="w-[150px]">
            <SortAsc className="h-4 w-4 mr-2 text-gray-500" />
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            {availableSortOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort Order */}
        {sortBy !== 'none' && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
          </Button>
        )}
      </div>

      <div className="flex-grow overflow-y-auto">
        <InsightsPanel insights={filteredAndSortedInsights} />
      </div>
    </div>
  );
};

export default InsightsFilter;