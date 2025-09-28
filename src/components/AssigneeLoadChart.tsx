"use client";

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Ticket } from '@/types';

interface AssigneeLoadChartProps {
  tickets: Ticket[];
  displayMode: 'count' | 'percentage'; // New prop for display mode
}

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
    return displayMode === 'percentage' ? `${value.toFixed(0)}%` : value.toString(); // Ensure string return
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        layout="vertical"
        data={processedData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
        <XAxis
          type="number"
          className="text-xs text-gray-600 dark:text-gray-400"
          tickFormatter={xAxisFormatter}
          domain={[0, displayMode === 'percentage' ? 100 : 'auto']}
        />
        <YAxis dataKey="name" type="category" className="text-xs text-gray-600 dark:text-gray-400" />
        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0.5rem' }}
          formatter={(value: number) => displayMode === 'percentage' ? [`${value.toFixed(1)}%`, 'Tickets Assigned'] : [value, 'Tickets Assigned']}
        />
        <Bar dataKey={displayMode} fill="#6366F1" name="Tickets Assigned" /> {/* Unified color: Indigo-500 */}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default AssigneeLoadChart;