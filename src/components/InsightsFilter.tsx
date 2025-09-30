"use client";

import React, { useState, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Insight } from '@/types';
import InsightsPanel from './InsightsPanel';
import { Filter } from 'lucide-react';

interface InsightsFilterProps {
  insights: Insight[];
}

const InsightsFilter = ({ insights }: InsightsFilterProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredInsights = useMemo(() => {
    if (selectedCategory === 'All') {
      return insights;
    } else if (selectedCategory === 'Stalled') {
      return insights.filter(insight => insight.type === 'stalledOnTech');
    } else if (selectedCategory === 'Customer Range') {
      return insights.filter(insight => insight.type === 'highVolumeCustomer');
    }
    return [];
  }, [insights, selectedCategory]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Insights</h3>
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
      </div>
      <div className="flex-grow overflow-y-auto">
        <InsightsPanel insights={filteredInsights} />
      </div>
    </div>
  );
};

export default InsightsFilter;