"use client";

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Cell, Legend } from 'recharts';
import { Ticket } from '@/types';

interface CustomerResolutionOutcomePatternsProps {
  tickets: Ticket[];
}

const BAR_COLORS = {
  Resolved: "hsl(120 60% 70%)", // Green
  Closed: "hsl(210 10% 70%)", // Gray
  Other: "hsl(28 100% 70%)", // Orange
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const entry = payload[0];
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-sm">
        <p className="font-medium text-foreground mb-1">Category: {label}</p>
        <p style={{ color: entry.color }} className="flex items-center">
          <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
          {entry.name}: {entry.value}
        </p>
      </div>
    );
  }
  return null;
};

const CustomBarChartLegend = ({ payload }: any) => {
  return (
    <div className="flex justify-center space-x-4 text-sm mt-4 text-gray-600 dark:text-gray-400">
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

const CustomerResolutionOutcomePatterns = ({ tickets }: CustomerResolutionOutcomePatternsProps) => {
  const processedData = useMemo(() => {
    if (!tickets || tickets.length === 0) return [];

    const outcomeMap = new Map<string, { name: string; Resolved: number; Closed: number; Other: number; total: number }>();

    tickets.forEach(ticket => {
      const category = ticket.type || 'Unknown Type'; // Group by ticket type for now
      if (!outcomeMap.has(category)) {
        outcomeMap.set(category, { name: category, Resolved: 0, Closed: 0, Other: 0, total: 0 });
      }
      const entry = outcomeMap.get(category)!;
      entry.total++;

      const statusLower = ticket.status.toLowerCase();
      if (statusLower === 'resolved') {
        entry.Resolved++;
      } else if (statusLower === 'closed') {
        entry.Closed++;
      } else {
        entry.Other++;
      }
    });

    // Filter out categories with very few tickets to keep the chart clean
    return Array.from(outcomeMap.values())
      .filter(item => item.total > 1) // Only show categories with more than 1 ticket
      .sort((a, b) => b.total - a.total) // Sort by total tickets in category
      .slice(0, 7); // Show top 7 categories
  }, [tickets]);

  const legendPayload = [
    { value: 'Resolved', color: BAR_COLORS.Resolved },
    { value: 'Closed', color: BAR_COLORS.Closed },
    { value: 'Other', color: BAR_COLORS.Other },
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-200 dark:stroke-gray-700" />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          fontSize={12}
          tick={{ fill: 'hsl(215.4 16.3% 46.9%)' }}
          interval={0}
          angle={-30}
          textAnchor="end"
          height={60}
          tickFormatter={(value) => value.length > 10 ? `${value.substring(0, 8)}...` : value}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          fontSize={12}
          tick={{ fill: 'hsl(215.4 16.3% 46.9%)' }}
          domain={[0, 'auto']}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend content={<CustomBarChartLegend payload={legendPayload} />} />
        <Bar dataKey="Resolved" stackId="a" fill={BAR_COLORS.Resolved} name="Resolved" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Closed" stackId="a" fill={BAR_COLORS.Closed} name="Closed" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Other" stackId="a" fill={BAR_COLORS.Other} name="Other Active" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default CustomerResolutionOutcomePatterns;