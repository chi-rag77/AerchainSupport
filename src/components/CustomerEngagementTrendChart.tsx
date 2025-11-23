"use client";

import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO, startOfMonth, eachMonthOfInterval, subMonths, isWithinInterval } from 'date-fns';
import { Ticket } from '@/types';

interface CustomerEngagementTrendChartProps {
  tickets: Ticket[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-sm">
        <p className="text-muted-foreground mb-1">{format(parseISO(label), 'MMM yyyy')}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="flex items-center">
            <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
            Tickets Created: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const CustomerEngagementTrendChart = ({ tickets }: CustomerEngagementTrendChartProps) => {
  const processedData = useMemo(() => {
    if (!tickets || tickets.length === 0) return [];

    // Determine the date range for the chart (e.g., last 12 months)
    const now = new Date();
    const twelveMonthsAgo = subMonths(now, 11); // Start 11 months before current month to include 12 months
    const intervalMonths = eachMonthOfInterval({ start: startOfMonth(twelveMonthsAgo), end: startOfMonth(now) });

    const dataMap = new Map<string, { date: string; count: number; }>();

    intervalMonths.forEach(month => {
      const formattedMonth = format(month, 'yyyy-MM');
      dataMap.set(formattedMonth, { date: formattedMonth, count: 0 });
    });

    tickets.forEach(ticket => {
      const createdAt = parseISO(ticket.created_at);
      const formattedMonth = format(startOfMonth(createdAt), 'yyyy-MM');

      if (dataMap.has(formattedMonth)) {
        const entry = dataMap.get(formattedMonth)!;
        entry.count++;
      }
    });

    return Array.from(dataMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [tickets]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={processedData}>
        <defs>
          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(240 60% 70%)" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="hsl(240 60% 70%)" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          tickFormatter={(tick) => format(parseISO(tick), 'MMM yy')}
          axisLine={false}
          tickLine={false}
          fontSize={12}
          tick={{ fill: 'hsl(215.4 16.3% 46.9%)' }}
          interval="preserveStartEnd"
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          fontSize={12}
          tick={{ fill: 'hsl(215.4 16.3% 46.9%)' }}
          domain={[0, 'auto']}
        />
        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-200 dark:stroke-gray-700" />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="count"
          stroke="hsl(240 60% 70%)"
          fill="url(#colorCount)"
          strokeWidth={2}
          dot={{ fill: 'hsl(240 60% 70%)', strokeWidth: 2, r: 4 }}
          name="Tickets Created"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default CustomerEngagementTrendChart;