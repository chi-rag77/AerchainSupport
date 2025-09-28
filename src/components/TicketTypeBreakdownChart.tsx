"use client";

import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO, startOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { Ticket } from '@/types';

interface TicketTypeBreakdownChartProps {
  tickets: Ticket[];
  dateRange: string; // e.g., "last6months", "last12months", "alltime"
}

const TicketTypeBreakdownChart = ({ tickets, dateRange }: TicketTypeBreakdownChartProps) => {
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

  const colors = [
    '#A78BFA', // Purple
    '#60A5FA', // Blue
    '#34D399', // Green
    '#FBBF24', // Yellow
    '#F87171', // Red
    '#FB923C', // Orange
    '#A3A3A3', // Gray
  ];

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

    const dataMap = new Map<string, { date: string; [key: string]: number | string; }>();

    intervalMonths.forEach(month => {
      const formattedMonth = format(month, 'yyyy-MM');
      dataMap.set(formattedMonth, { date: format(month, 'MMM yyyy') });
    });

    const uniqueTypes = new Set<string>();
    tickets.forEach(ticket => {
      const createdAt = startOfMonth(parseISO(ticket.created_at));
      const formattedCreatedAt = format(createdAt, 'yyyy-MM');
      const type = ticket.type || 'Other';
      uniqueTypes.add(type);

      if (dataMap.has(formattedCreatedAt)) {
        const entry = dataMap.get(formattedCreatedAt)!;
        entry[type] = ((entry[type] as number) || 0) + 1;
      }
    });

    return Array.from(dataMap.values()).sort((a, b) => (a.date as string).localeCompare(b.date as string));
  }, [tickets, dateRange]);

  const allTypes = useMemo(() => {
    const types = new Set<string>();
    tickets.forEach(ticket => {
      if (ticket.type) types.add(ticket.type);
    });
    return Array.from(types).sort();
  }, [tickets]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
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
          dataKey="date"
          tickFormatter={(tick) => format(parseISO(tick), 'MMM yy')}
          className="text-sm font-semibold text-gray-600 dark:text-gray-400"
          interval="preserveStartEnd"
        />
        <YAxis className="text-sm font-semibold text-gray-600 dark:text-gray-400" />
        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0.5rem' }} />
        <Legend onClick={(e) => handleLegendClick(e.dataKey)} />
        {allTypes.map((type, index) => (
          !hiddenSeries.has(type) && <Bar key={type} dataKey={type} stackId="a" fill={colors[index % colors.length]} name={type} radius={[4, 4, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TicketTypeBreakdownChart;