"use client";

import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { Ticket } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from '@/lib/utils';

interface TicketBreakdownChartProps {
  tickets: Ticket[];
  uniqueCompanies: string[];
  uniqueModules: string[];
  uniqueCountries: string[];
}

const PRIORITY_COLORS: { [key: string]: string } = {
  Urgent: "hsl(10 80% 70%)", // Red
  High: "hsl(28 100% 70%)", // Orange
  Medium: "hsl(120 60% 70%)", // Green
  Low: "hsl(180 60% 70%)", // Cyan
  'Unknown (N/A)': "hsl(210 10% 70%)", // Gray for unknown
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const totalForCategory = payload.reduce((sum: number, entry: any) => sum + (entry.value || 0), 0);
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-sm">
        <p className="font-medium text-foreground mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="flex items-center">
            <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
            {entry.name}: {entry.value} ({((entry.value / totalForCategory) * 100).toFixed(1)}%)
          </p>
        ))}
        <p className="font-semibold text-foreground mt-1">Total: {totalForCategory}</p>
      </div>
    );
  }
  return null;
};

const CustomBarChartLegend = ({ payload }: any) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 mt-4 text-xs text-gray-600 dark:text-gray-400">
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center space-x-1">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span>{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

const TicketBreakdownChart = ({ tickets, uniqueCompanies, uniqueModules, uniqueCountries }: TicketBreakdownChartProps) => {
  const [dimension, setDimension] = useState<'company' | 'module' | 'country'>('company');

  const processedData = useMemo(() => {
    if (!tickets || tickets.length === 0) return [];

    const breakdownMap = new Map<string, { [key: string]: number | string }>();

    tickets.forEach(ticket => {
      let category: string;
      switch (dimension) {
        case 'company':
          category = ticket.cf_company || 'Unknown Company';
          break;
        case 'module':
          category = ticket.cf_module || 'Unknown Module';
          break;
        case 'country':
          category = ticket.cf_country || 'Unknown Country';
          break;
        default:
          category = 'Unknown';
      }

      if (!breakdownMap.has(category)) {
        breakdownMap.set(category, { name: category });
      }
      const categoryData = breakdownMap.get(category)!;

      const priority = ticket.priority || 'Unknown (N/A)';
      categoryData[priority] = ((categoryData[priority] as number) || 0) + 1;
    });

    // Convert map to array and sort by total tickets
    const dataArray = Array.from(breakdownMap.values()).map(data => {
      let total = 0;
      for (const key in data) {
        if (key !== 'name' && typeof data[key] === 'number') {
          total += data[key] as number;
        }
      }
      return { ...data, totalTickets: total };
    });

    return dataArray.sort((a, b) => (b.totalTickets as number) - (a.totalTickets as number));
  }, [tickets, dimension]);

  const uniquePrioritiesInData = useMemo(() => {
    const prioritiesSet = new Set<string>();
    processedData.forEach(dataRow => {
      for (const key in dataRow) {
        if (key !== 'name' && key !== 'totalTickets' && typeof dataRow[key] === 'number' && dataRow[key] > 0) {
          prioritiesSet.add(key);
        }
      }
    });
    const orderedPriorities = ['Urgent', 'High', 'Medium', 'Low', 'Unknown (N/A)'];
    return orderedPriorities.filter(p => prioritiesSet.has(p));
  }, [processedData]);

  const legendPayload = uniquePrioritiesInData.map(priority => ({
    value: priority,
    color: PRIORITY_COLORS[priority] || PRIORITY_COLORS['Unknown (N/A)'],
  }));

  return (
    <div className="flex flex-col items-center w-full h-full">
      <div className="flex justify-end w-full mb-4">
        <Select value={dimension} onValueChange={(value: 'company' | 'module' | 'country') => setDimension(value)}>
          <SelectTrigger className="w-[180px] h-8 bg-card">
            <SelectValue placeholder="Group By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="company">Company</SelectItem>
            <SelectItem value="module">Module</SelectItem>
            <SelectItem value="country">Country</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <ResponsiveContainer width="100%" height="calc(100% - 40px)">
        <BarChart
          data={processedData}
          layout="vertical"
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            fontSize={12}
            tick={{ fill: 'hsl(215.4 16.3% 46.9%)' }}
          />
          <YAxis
            dataKey="name"
            type="category"
            axisLine={false}
            tickLine={false}
            fontSize={11}
            width={120}
            tick={{ fill: 'hsl(215.4 16.3% 46.9%)' }}
            interval={0}
            tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 12)}...` : value}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomBarChartLegend payload={legendPayload} />} />
          {uniquePrioritiesInData.map((priority, index) => (
            <Bar
              key={priority}
              dataKey={priority}
              stackId="a"
              fill={PRIORITY_COLORS[priority] || PRIORITY_COLORS['Unknown (N/A)']}
              name={priority}
              radius={[0, 4, 4, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TicketBreakdownChart;