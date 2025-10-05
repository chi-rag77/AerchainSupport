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
  'hsl(30 100% 70%)', // Orange-ish for 'a'
  'hsl(10 80% 70%)',  // Red-ish for 'b'
  'hsl(180 60% 70%)', // Cyan-ish for 'c'
  'hsl(240 60% 70%)', // Purple-ish for 'd'
  'hsl(210 10% 70%)', // Grey for others
];

// Custom Legend Component to match the image
const CustomAssigneeLegend = ({ payload }: any) => {
  if (!payload || payload.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 justify-center">
      {payload.map((entry: any, index: number) => (
        <div key={`item-${index}`} className="flex items-center text-sm text-muted-foreground">
          <span className="font-bold mr-1 text-foreground">{entry.shortName}</span>
          <span className="inline-block w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: entry.color }}></span>
          {entry.value}
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
      .map(([name, count]) => ({ name, count }));

    const totalTickets = tickets.length;

    return sortedAssignees.map((entry, index) => {
      const shortName = String.fromCharCode(97 + index); // 'a', 'b', 'c', ...
      const color = BAR_COLORS[index % BAR_COLORS.length];
      return {
        shortName,
        name: entry.name, // Full assignee name for tooltip/legend
        count: entry.count,
        percentage: (entry.count / totalTickets) * 100,
        color,
      };
    });
  }, [tickets]);

  const yAxisFormatter = (value: number) => {
    return displayMode === 'percentage' ? `${value.toFixed(0)}%` : value.toString();
  };

  // Prepare legend payload for the custom legend component
  const legendPayload = processedData.map(entry => ({
    shortName: entry.shortName,
    value: entry.name, // Display full name in legend
    color: entry.color,
  }));

  return (
    <div className="flex flex-col items-center w-full">
      <ResponsiveContainer width="100%" height={250}>
        <BarChart
          data={processedData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis
            dataKey="shortName" // Use shortName for X-axis labels
            type="category"
            className="text-xs text-gray-600 dark:text-gray-400"
            axisLine={false}
            tickLine={false}
            padding={{ left: 20, right: 20 }} // Add padding to X-axis
          />
          <YAxis
            type="number"
            className="text-xs text-gray-600 dark:text-gray-400"
            axisLine={false}
            tickLine={false}
            tickFormatter={yAxisFormatter}
            domain={[0, 'auto']}
          />
          <Tooltip
            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0.5rem' }}
            formatter={(value: number, name: string, props: any) => [
              displayMode === 'percentage' ? `${value.toFixed(1)}%` : value,
              props.payload.name // Show full assignee name in tooltip
            ]}
            labelFormatter={(label) => `Assignee: ${processedData.find(d => d.shortName === label)?.name || label}`}
          />
          <Bar dataKey={displayMode === 'percentage' ? 'percentage' : 'count'} radius={[4, 4, 0, 0]}>
            {processedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
            <LabelList dataKey={displayMode === 'percentage' ? 'percentage' : 'count'} position="top" className="text-xs fill-foreground" formatter={(value: number) => displayMode === 'percentage' ? `${value.toFixed(0)}%` : value.toString()} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <CustomAssigneeLegend payload={legendPayload} /> {/* Render custom legend */}
    </div>
  );
};

export default AssigneeLoadChart;