"use client";

import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Ticket } from '@/types';

interface PriorityDistributionChartProps {
  tickets: Ticket[];
}

// Specific colors for each priority from the reference
const PRIORITY_COLORS: { [key: string]: string } = {
  Urgent: "hsl(10 80% 70%)", // Red
  High: "hsl(28 100% 70%)", // Orange
  Medium: "hsl(120 60% 70%)", // Green
  Low: "hsl(180 60% 70%)", // Cyan
  Unknown: "hsl(210 10% 70%)", // Gray for unknown
};

// Custom Tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const entry = payload[0];
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-sm">
        <p className="font-medium text-foreground mb-1">{entry.name}</p>
        <p style={{ color: entry.color }} className="flex items-center">
          <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
          Tickets: {entry.value}
        </p>
      </div>
    );
  }
  return null;
};

// Custom Legend component
const CustomPieChartLegend = ({ payload }: any) => {
  return (
    <div className="grid grid-cols-2 gap-y-2 mt-4 text-sm text-gray-600 dark:text-gray-400">
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center space-x-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span>{entry.value}</span>
        </div>
      ))}
    </div>
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
      color: PRIORITY_COLORS[priority] || PRIORITY_COLORS['Unknown'],
    }));
  }, [tickets]);

  const totalTickets = useMemo(() => {
    return processedData.reduce((sum, item) => sum + item.value, 0);
  }, [processedData]);

  const legendPayload = processedData.map(entry => ({
    value: entry.name,
    color: entry.color,
  }));

  return (
    <> {/* Use a React Fragment to wrap multiple top-level elements */}
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={processedData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            dataKey="value"
            startAngle={90}
            endAngle={450}
            labelLine={false}
          >
            {processedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {/* These text elements are now children of PieChart */}
          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold fill-foreground">
            {totalTickets}
          </text>
          <text x="50%" y="50%" dy="20" textAnchor="middle" dominantBaseline="middle" className="text-sm fill-muted-foreground">
            Total Tickets
          </text>
        </PieChart>
      </ResponsiveContainer>
      {/* CustomPieChartLegend is now outside ResponsiveContainer */}
      <CustomPieChartLegend payload={legendPayload} />
    </>
  );
};

export default PriorityDistributionChart;