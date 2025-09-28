"use client";

import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Ticket } from '@/types';

interface PriorityDistributionChartProps {
  tickets: Ticket[];
}

const COLORS = ['#EF4444', '#F97316', '#F59E0B', '#10B981']; // Red, Orange, Amber, Green for Urgent, High, Medium, Low

const PriorityDistributionChart = ({ tickets }: PriorityDistributionChartProps) => {
  const processedData = useMemo(() => {
    if (!tickets || tickets.length === 0) return [];

    const priorityCounts = new Map<string, number>();
    tickets.forEach(ticket => {
      const priority = ticket.priority || 'Unknown';
      priorityCounts.set(priority, (priorityCounts.get(priority) || 0) + 1);
    });

    // Sort priorities for consistent color mapping and display
    const sortedPriorities = ['Urgent', 'High', 'Medium', 'Low', 'Unknown'].filter(p => priorityCounts.has(p));

    return sortedPriorities.map(priority => ({
      name: priority,
      value: priorityCounts.get(priority)!,
    }));
  }, [tickets]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={processedData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
          label
        >
          {processedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0.5rem' }} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PriorityDistributionChart;