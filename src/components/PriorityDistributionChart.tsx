"use client";

import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Ticket } from '@/types';

interface PriorityDistributionChartProps {
  tickets: Ticket[];
}

// Softer, unified color palette inspired by the image
const COLORS = [
  'hsl(10 80% 70%)',   // Soft Red/Coral for Urgent
  'hsl(28 100% 70%)',  // Soft Orange/Peach for High
  'hsl(48 100% 70%)',  // Soft Yellow for Medium
  'hsl(120 60% 70%)',  // Soft Green for Low
  'hsl(210 10% 70%)',  // Soft Gray for Unknown
];

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
          innerRadius={70}
          outerRadius={100}
          paddingAngle={5}
          dataKey="value"
          labelLine={false} // Hide default label lines
          filter="url(#shadow)" // Apply shadow filter
        >
          {processedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0.5rem' }} />
        <Legend
          layout="vertical" // Changed to vertical layout for legend
          align="right"    // Aligned to the right
          verticalAlign="middle" // Vertically centered
          wrapperStyle={{ paddingLeft: '20px' }} // Add some padding
        />
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