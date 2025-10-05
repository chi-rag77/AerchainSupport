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
    const totalTickets = payload.reduce((sum: number, item: any) => sum + item.value, 0);
    const percentage = totalTickets > 0 ? ((entry.value / totalTickets) * 100).toFixed(1) : 0;

    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-sm">
        <p className="font-medium text-foreground mb-1">{entry.name}</p>
        <p style={{ color: entry.color }} className="flex items-center">
          <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
          Tickets: {entry.value} ({percentage}%)
        </p>
      </div>
    );
  }
  return null;
};

// Custom Legend component for the right side with counts
const CustomPieChartLegend = ({ payload }: any) => {
  return (
    <div className="flex flex-col space-y-2 text-sm text-gray-600 dark:text-gray-400">
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center space-x-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span>{entry.value}: <span className="font-semibold text-foreground">{entry.payload.value}</span></span>
        </div>
      ))}
    </div>
  );
};

// Custom Label component for percentages with leader lines
const CustomPieChartLabel = ({ cx, cy, midAngle, outerRadius, percent, name, value, index, fill }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 10; // Position labels slightly outside
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + outerRadius * cos;
  const sy = cy + outerRadius * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} dominantBaseline="central" fill="hsl(var(--foreground))" className="text-xs">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    </g>
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
    payload: { value: entry.value } // Pass value for custom legend
  }));

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
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
            innerRadius={60}
            outerRadius={100}
            dataKey="value"
            startAngle={90}
            endAngle={450}
            label={CustomPieChartLabel} // Use custom label component
            labelLine={false}
            filter="url(#shadow)" // Apply shadow filter
          >
            {processedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold fill-foreground">
            {totalTickets}
          </text>
          <text x="50%" y="50%" dy="20" textAnchor="middle" dominantBaseline="middle" className="text-sm fill-muted-foreground">
            Total Tickets
          </text>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 mr-4"> {/* Position legend to the right */}
        <CustomPieChartLegend payload={legendPayload} />
      </div>
    </div>
  );
};

export default PriorityDistributionChart;