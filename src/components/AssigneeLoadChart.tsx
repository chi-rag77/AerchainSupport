"use client";

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Ticket } from '@/types';

interface AssigneeLoadChartProps {
  tickets: Ticket[];
}

const AssigneeLoadChart = ({ tickets }: AssigneeLoadChartProps) => {
  const processedData = useMemo(() => {
    if (!tickets || tickets.length === 0) return [];

    const assigneeCounts = new Map<string, number>();
    tickets.forEach(ticket => {
      const assignee = ticket.assignee || 'Unassigned';
      assigneeCounts.set(assignee, (assigneeCounts.get(assignee) || 0) + 1);
    });

    return Array.from(assigneeCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count); // Sort by count descending
  }, [tickets]);

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
        <XAxis type="number" className="text-xs text-gray-600 dark:text-gray-400" />
        <YAxis dataKey="name" type="category" className="text-xs text-gray-600 dark:text-gray-400" />
        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0.5rem' }} />
        <Bar dataKey="count" fill="#8884d8" name="Tickets Assigned" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default AssigneeLoadChart;