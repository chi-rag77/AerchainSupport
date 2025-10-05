"use client";

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Cell } from 'recharts';
import { Ticket } from '@/types';

interface TopCustomersChartProps {
  tickets: Ticket[];
  topN?: number; // Optional prop to show top N customers
}

const BAR_COLORS = [
  "hsl(28 100% 70%)", // Orange
  "hsl(10 80% 70%)",  // Red
  "180 60% 70%)", // Cyan
  "hsl(240 60% 70%)", // Purple
  "hsl(48 100% 70%)", // Yellow
  "hsl(210 10% 70%)", // Gray
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const entry = payload[0];
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-sm">
        <p className="font-medium text-foreground mb-1">Customer: {label}</p>
        <p style={{ color: entry.color }} className="flex items-center">
          <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
          Tickets: {entry.value}
        </p>
      </div>
    );
  }
  return null;
};

const TopCustomersChart = ({ tickets, topN = 10 }: TopCustomersChartProps) => {
  const processedData = useMemo(() => {
    if (!tickets || tickets.length === 0) return [];

    const customerCounts = new Map<string, number>();
    tickets.forEach(ticket => {
      const customer = ticket.cf_company || 'Unknown Company';
      customerCounts.set(customer, (customerCounts.get(customer) || 0) + 1);
    });

    const sortedCustomers = Array.from(customerCounts.entries())
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, topN) // Apply topN filter
      .map(([name, count], index) => ({
        name,
        count,
        color: BAR_COLORS[index % BAR_COLORS.length],
      }));

    return sortedCustomers;
  }, [tickets, topN]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={processedData} layout="vertical" margin={{ left: 20, right: 20 }}>
        <defs>
          {processedData.map((entry, index) => (
            <linearGradient key={`grad-${entry.name}`} id={`color${index}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="5%" stopColor={entry.color} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={entry.color} stopOpacity={0.3}/>
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-gray-200 dark:stroke-gray-700" />
        <XAxis
          type="number"
          axisLine={false}
          tickLine={false}
          fontSize={12}
          tick={{ fill: 'hsl(215.4 16.3% 46.9%)' }}
        />
        <YAxis
          dataKey="name"
          type="category"
          axisLine={false}
          tickLine={false}
          fontSize={12}
          tick={{ fill: 'hsl(215.4 16.3% 46.9%)' }}
          width={120}
          interval={0}
          tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 12)}...` : value}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {processedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={`url(#color${index})`} />
          ))}
          <LabelList dataKey="count" position="right" className="text-xs fill-foreground" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TopCustomersChart;