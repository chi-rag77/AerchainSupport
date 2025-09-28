"use client";

import React, { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO, startOfMonth, eachMonthOfInterval, subMonths, addMonths } from 'date-fns';
import { Ticket } from '@/types';

interface BugsIssuesTrendChartProps {
  tickets: Ticket[];
  dateRange: string; // e.g., "last6months", "last12months", "alltime"
}

const BugsIssuesTrendChart = ({ tickets, dateRange }: BugsIssuesTrendChartProps) => {
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
      default: // "alltime" or other, default to last 12 months for trend
        startDate = subMonths(now, 12);
        break;
    }

    const intervalMonths = eachMonthOfInterval({ start: startOfMonth(startDate), end: startOfMonth(now) });

    const dataMap = new Map<string, { date: string; reported: number; resolved: number; }>();

    intervalMonths.forEach(month => {
      const formattedMonth = format(month, 'yyyy-MM');
      dataMap.set(formattedMonth, { date: format(month, 'MMM yyyy'), reported: 0, resolved: 0 });
    });

    tickets.forEach(ticket => {
      const createdAt = startOfMonth(parseISO(ticket.created_at));
      const formattedCreatedAt = format(createdAt, 'yyyy-MM');

      if (dataMap.has(formattedCreatedAt) && ticket.type?.toLowerCase() === 'bug') {
        dataMap.get(formattedCreatedAt)!.reported++;
      }

      if (ticket.resolved_at) {
        const resolvedAt = startOfMonth(parseISO(ticket.resolved_at));
        const formattedResolvedAt = format(resolvedAt, 'yyyy-MM');
        if (dataMap.has(formattedResolvedAt) && ticket.type?.toLowerCase() === 'bug') {
          dataMap.get(formattedResolvedAt)!.resolved++;
        }
      }
    });

    return Array.from(dataMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [tickets, dateRange]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
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
        <YAxis className="text-sm font-semibold text-gray-600 dark:text-gray-400" />
        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0.5rem' }} />
        <Legend onClick={(e) => handleLegendClick(e.dataKey)} />
        {!hiddenSeries.has('reported') && <Line type="monotone" dataKey="reported" stroke="#EF4444" name="Bugs Reported" activeDot={{ r: 8 }} />}
        {!hiddenSeries.has('resolved') && <Line type="monotone" dataKey="resolved" stroke="#34D399" name="Bugs Resolved" activeDot={{ r: 8 }} />}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default BugsIssuesTrendChart;