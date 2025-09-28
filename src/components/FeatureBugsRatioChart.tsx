"use client";

import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO, startOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { Ticket } from '@/types';

interface FeatureBugsRatioChartProps {
  tickets: Ticket[];
  dateRange: string; // e.g., "last6months", "last12months", "alltime"
}

const FeatureBugsRatioChart = ({ tickets, dateRange }: FeatureBugsRatioChartProps) => {
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

  const handleLegendClick = (dataKey: any) => {
    setHiddenSeries(prev => {
      const newSet = new Set(prev);
      const keyAsString = String(dataKey);
      if (newSet.has(keyAsString)) {
        newSet.delete(keyAsString);
      } else {
        newSet.add(keyAsString);
      }
      return newSet;
    });
  };

  const processedData = useMemo(() => {
    if (!tickets || tickets.length === 0) return [];

    const now = new Date();
    let startDate: Date;

    switch (dateRange) {
      case "last6months":
        startDate = subMonths(now, 6);
        break;
      case "last12months":
        startDate = subMonths(now, 12);
        break;
      default: // "alltime" or other, default to last 12 months
        startDate = subMonths(now, 12);
        break;
    }

    const intervalMonths = eachMonthOfInterval({ start: startOfMonth(startDate), end: startOfMonth(now) });

    const dataMap = new Map<string, { date: string; bugs: number; features: number; }>();

    intervalMonths.forEach(month => {
      const formattedMonth = format(month, 'yyyy-MM');
      dataMap.set(formattedMonth, { date: format(month, 'MMM yyyy'), bugs: 0, features: 0 });
    });

    tickets.forEach(ticket => {
      const createdAt = startOfMonth(parseISO(ticket.created_at));
      const formattedCreatedAt = format(createdAt, 'yyyy-MM');

      if (dataMap.has(formattedCreatedAt)) {
        const entry = dataMap.get(formattedCreatedAt)!;
        if (ticket.type?.toLowerCase() === 'bug') {
          entry.bugs++;
        } else if (ticket.type?.toLowerCase() === 'feature request') {
          entry.features++;
        }
      }
    });

    return Array.from(dataMap.values()).sort((a, b) => (a.date as string).localeCompare(b.date as string));
  }, [tickets, dateRange]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={processedData}
        margin={{
          top: 10,
          right: 40,
          left: 20,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
        <XAxis
          dataKey="date"
          tickFormatter={(tick) => format(parseISO(tick), 'MMM yy')}
          className="text-sm font-semibold text-gray-600 dark:text-gray-400"
          interval="preserveStartEnd"
        />
        <YAxis yAxisId="left" orientation="left" stroke="#EF4444" className="text-sm font-semibold text-gray-600 dark:text-gray-400" />
        <YAxis yAxisId="right" orientation="right" stroke="#60A5FA" className="text-sm font-semibold text-gray-600 dark:text-gray-400" />
        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0.5rem' }} />
        <Legend onClick={(e) => handleLegendClick(e.dataKey)} />
        {!hiddenSeries.has('bugs') && <Bar yAxisId="left" dataKey="bugs" fill="#EF4444" name="Bugs" radius={[4, 4, 0, 0]} />}
        {!hiddenSeries.has('features') && <Bar yAxisId="right" dataKey="features" fill="#60A5FA" name="Feature Requests" radius={[4, 4, 0, 0]} />}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default FeatureBugsRatioChart;