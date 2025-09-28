"use client";

import React, { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO, startOfMonth, eachMonthOfInterval, subMonths, differenceInHours } from 'date-fns';
import { Ticket } from '@/types';

interface AverageResolutionTimeChartProps {
  tickets: Ticket[];
  dateRange: string; // e.g., "last6months", "last12months", "alltime"
}

const AverageResolutionTimeChart = ({ tickets, dateRange }: AverageResolutionTimeChartProps) => {
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

  const priorityColors: { [key: string]: string } = {
    'Urgent': '#EF4444', // Red
    'High': '#F97316',   // Orange
    'Medium': '#FBBF24', // Yellow
    'Low': '#34D399',    // Green
    'Unknown': '#6B7280' // Gray
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

    const monthlyDataMap = new Map<string, { [key: string]: { totalHours: number; count: number; }; }>();

    intervalMonths.forEach(month => {
      const formattedMonth = format(month, 'yyyy-MM');
      monthlyDataMap.set(formattedMonth, {});
    });

    tickets.forEach(ticket => {
      if (ticket.created_at && ticket.resolved_at) {
        const createdAt = parseISO(ticket.created_at);
        const resolvedAt = parseISO(ticket.resolved_at);
        const resolutionHours = differenceInHours(resolvedAt, createdAt);

        const monthKey = format(startOfMonth(createdAt), 'yyyy-MM');
        const priority = ticket.priority || 'Unknown';

        if (monthlyDataMap.has(monthKey)) {
          const monthEntry = monthlyDataMap.get(monthKey)!;
          if (!monthEntry[priority]) {
            monthEntry[priority] = { totalHours: 0, count: 0 };
          }
          monthEntry[priority].totalHours += resolutionHours;
          monthEntry[priority].count++;
        }
      }
    });

    const chartData = Array.from(monthlyDataMap.entries())
      .map(([monthKey, prioritiesData]) => {
        const entry: { date: string; [key: string]: string | number; } = { date: format(parseISO(monthKey), 'MMM yyyy') };
        Object.keys(prioritiesData).forEach(priority => {
          const { totalHours, count } = prioritiesData[priority];
          if (count > 0) {
            entry[priority] = Math.round(totalHours / count); // Average resolution time in hours
          }
        });
        return entry;
      })
      .sort((a, b) => (a.date as string).localeCompare(b.date as string));

    return chartData;
  }, [tickets, dateRange]);

  const allPriorities = useMemo(() => {
    const priorities = new Set<string>();
    tickets.forEach(ticket => {
      if (ticket.priority) priorities.add(ticket.priority);
    });
    return Array.from(priorities).sort((a, b) => {
      const order = ['Urgent', 'High', 'Medium', 'Low', 'Unknown'];
      return order.indexOf(a) - order.indexOf(b);
    });
  }, [tickets]);

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
        <YAxis
          label={{ value: 'Avg. Resolution (Hours)', angle: -90, position: 'insideLeft', className: "text-sm font-semibold text-gray-600 dark:text-gray-400" }}
          className="text-sm font-semibold text-gray-600 dark:text-gray-400"
        />
        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0.5rem' }} />
        <Legend onClick={(e) => handleLegendClick(e.dataKey)} />
        {allPriorities.map(priority => (
          !hiddenSeries.has(priority) && (
            <Line
              key={priority}
              type="monotone"
              dataKey={priority}
              stroke={priorityColors[priority]}
              name={`${priority} Priority`}
              activeDot={{ r: 8 }}
            />
          )
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default AverageResolutionTimeChart;