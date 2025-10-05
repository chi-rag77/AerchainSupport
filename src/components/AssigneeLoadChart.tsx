"use client";

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts'; // Added LabelList
import { Ticket } from '@/types';

interface AssigneeLoadChartProps {
  tickets: Ticket[];
  displayMode: 'count' | 'percentage';
}

// Softer, unified color palette
const BAR_COLOR = '#8884d8'; // A default purple, will use a gradient in the Bar component

const AssigneeLoadChart = ({ tickets, displayMode }: AssigneeLoadChartProps) => {
  const processedData = useMemo(() => {
    if (!tickets || tickets.length === 0) return [];

    const assigneeCounts = new Map<string, number>();
    tickets.forEach(ticket => {
      const assignee = ticket.assignee || 'Unassigned';
      assigneeCounts.set(assignee, (assigneeCounts.get(assignee) || 0) + 1);
    });

    const totalTickets = tickets.length;

    return Array.from(assigneeCounts.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage: (count / totalTickets) * 100,
      }))
      .sort((a, b) => b.count - a.count); // Sort by count descending
  }, [tickets]);

  const xAxisFormatter = (value: number) => {
    return displayMode === 'percentage' ? `${value.toFixed(0)}%` : value.toString();
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        layout="horizontal" // Changed to horizontal layout
        data={processedData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <defs>
          <linearGradient id="colorAssignee" x1="0" y1="0" x2="1" y2="0">
            <stop offset="5%" stopColor="hsl(240 60% 70%)" stopOpacity={0.9}/> {/* Soft blue/purple */}
            <stop offset="95%" stopColor="hsl(240 60% 85%)" stopOpacity={0.7}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-200 dark:stroke-gray-700" /> {/* Removed vertical grid lines */}
        <XAxis
          type="number"
          className="text-xs text-gray-600 dark:text-gray-400"
          tickFormatter={xAxisFormatter}
          domain={[0, displayMode === 'percentage' ? 100 : 'auto']}
          axisLine={false} // Hide x-axis line
          tickLine={false} // Hide x-axis tick lines
        />
        <YAxis
          dataKey="name"
          type="category"
          width={120}
          className="text-xs text-gray-600 dark:text-gray-400"
          axisLine={false} // Hide y-axis line
          tickLine={false} // Hide y-axis tick lines
        />
        <Tooltip
          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0.5rem' }}
          formatter={(value: number) => displayMode === 'percentage' ? [`${value.toFixed(1)}%`, 'Tickets Assigned'] : [value, 'Tickets Assigned']}
        />
        <Bar dataKey={displayMode} fill="url(#colorAssignee)" name="Tickets Assigned" radius={[0, 4, 4, 0]}>
          <LabelList dataKey={displayMode} position="right" className="text-xs fill-foreground" formatter={(value: number) => displayMode === 'percentage' ? `${value.toFixed(0)}%` : value.toString()} /> {/* Added LabelList */}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default AssigneeLoadChart;