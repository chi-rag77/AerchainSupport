"use client";

import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Ticket } from '@/types';

interface PriorityDistributionChartProps {
  tickets: Ticket[];
}

// Less saturated, unified color palette
const COLORS = ['#EF4444', '#F97316', '#F59E0B', '#34D399', '#6B7280']; // Red, Orange, Amber, Green, Gray for Unknown

// Custom label component for the PieChart
const CustomPieChartLabel = ({ cx, cy, midAngle, outerRadius, percent, index, name, value }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 20; // Position labels slightly outside the pie
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="hsl(var(--foreground))"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-xs"
    >
      {`${name} (${value}, ${(percent * 100).toFixed(0)}%)`}
    </text>
  );
};

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
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="rgba(0,0,0,0.1)" />
          </filter>
        </defs>
        <Pie
          data={processedData}
          cx="50%"
          cy="50%"
          innerRadius={70} // Thicker donut
          outerRadius={100} // Thicker donut
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
          label={CustomPieChartLabel} // Use custom label component
          labelLine={false} // Hide default label lines
          filter="url(#shadow)" // Apply shadow filter
        >
          {processedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0.5rem' }} />
        <Legend />
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-xl font-bold fill-foreground">
          {tickets.length}
        </text>
        <text x="50%" y="50%" dy="20" textAnchor="middle" dominantBaseline="middle" className="text-sm fill-muted-foreground">
          Total Tickets
        </text>
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PriorityDistributionChart;