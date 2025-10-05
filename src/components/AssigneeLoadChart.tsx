"use client";

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Cell } from 'recharts';
import { Ticket } from '@/types';
import { cn } from '@/lib/utils';

interface AssigneeLoadChartProps {
  tickets: Ticket[];
  displayMode: 'count' | 'percentage';
}

// Custom color palette for the bars from the image
const BAR_COLORS = [
  "hsl(28 100% 70%)", // Orange
  "hsl(10 80% 70%)",  // Red
  "hsl(180 60% 70%)", // Cyan
  "hsl(240 60% 70%)", // Purple
  "hsl(210 10% 70%)", // Gray
  "hsl(210 10% 70%)", // Gray
  "hsl(210 10% 70%)", // Gray
];

// Custom Tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const entry = payload[0];
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-sm">
        <p className="font-medium text-foreground mb-1">Assignee: {entry.payload.assignee}</p>
        <p style={{ color: entry.color }} className="flex items-center">
          <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
          Tickets: {entry.value}
        </p>
      </div>
    );
  }
  return null;
};

// Custom Legend Component to match the image
const CustomAssigneeLegend = ({ payload }: any) => {
  if (!payload || payload.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-4 text-xs text-gray-600 dark:text-gray-400">
      {payload.map((entry: any, index: number) => (
        <div key={`item-${index}`} className="flex items-center space-x-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="font-medium text-foreground">{entry.name}</span>
          <span className="text-gray-600 dark:text-gray-400">{entry.assignee}</span>
          <span className="text-gray-500 dark:text-gray-500">{entry.id}</span>
        </div>
      ))}
    </div>
  );
};

const AssigneeLoadChart = ({ tickets, displayMode }: AssigneeLoadChartProps) => {
  const processedData = useMemo(() => {
    if (!tickets || tickets.length === 0) return [];

    const assigneeCounts = new Map<string, number>();
    tickets.forEach(ticket => {
      const assignee = ticket.assignee || 'Unassigned';
      assigneeCounts.set(assignee, (assigneeCounts.get(assignee) || 0) + 1);
    });

    const sortedAssignees = Array.from(assigneeCounts.entries())
      .sort(([, countA], [, countB]) => countB - countA) // Sort by count descending
      .map(([name, count], index) => ({
        name: String.fromCharCode(97 + index), // 'a', 'b', 'c', ... for X-axis
        count,
        assignee: name, // Full assignee name
        id: `id-${index + 1}`, // Placeholder ID
        color: BAR_COLORS[index % BAR_COLORS.length],
      }));

    return sortedAssignees;
  }, [tickets]);

  const legendPayload = processedData.map(entry => ({
    name: entry.name,
    assignee: entry.assignee,
    id: entry.id,
    color: entry.color,
  }));

  return (
    <div className="flex flex-col items-center w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={processedData}>
          <XAxis
            dataKey="name" // Use short labels for X-axis
            axisLine={false}
            tickLine={false}
            fontSize={12}
            tick={{ fill: 'hsl(215.4 16.3% 46.9%)' }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            fontSize={12}
            tick={{ fill: 'hsl(215.4 16.3% 46.9%)' }}
          />
          <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-200 dark:stroke-gray-700" />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {processedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
            <LabelList dataKey="count" position="top" className="text-xs fill-foreground" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <CustomAssigneeLegend payload={legendPayload} />
    </div>
  );
};

export default AssigneeLoadChart;