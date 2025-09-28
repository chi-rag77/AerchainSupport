"use client";

import React, { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO, startOfDay, eachDayOfInterval, subDays } from 'date-fns';
import { Ticket } from '@/types';

interface TicketsOverTimeChartProps {
  tickets: Ticket[];
  dateRange: string; // e.g., "last7days", "last30days", "alltime"
}

const TicketsOverTimeChart = ({ tickets, dateRange }: TicketsOverTimeChartProps) => {
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

  const handleLegendClick = (dataKey: any) => { // dataKey can be string or number, so use 'any' for type safety here
    setHiddenSeries(prev => {
      const newSet = new Set(prev);
      const keyAsString = String(dataKey); // Convert to string for Set operations
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
      case "last7days":
        startDate = subDays(now, 7);
        break;
      case "last14days":
        startDate = subDays(now, 14);
        break;
      case "last30days":
        startDate = subDays(now, 30);
        break;
      case "last90days":
        startDate = subDays(now, 90);
        break;
      default: // All time or custom, for now default to last 30 days if not specified
        startDate = subDays(now, 30);
        break;
    }

    const intervalDays = eachDayOfInterval({ start: startDate, end: now });

    const dataMap = new Map<string, { date: string; open: number; 'in progress': number; resolved: number; closed: number; }>();

    intervalDays.forEach(day => {
      const formattedDate = format(day, 'yyyy-MM-dd');
      dataMap.set(formattedDate, { date: formattedDate, open: 0, 'in progress': 0, resolved: 0, closed: 0 });
    });

    tickets.forEach(ticket => {
      const createdAt = startOfDay(parseISO(ticket.created_at));
      const formattedDate = format(createdAt, 'yyyy-MM-dd');

      if (dataMap.has(formattedDate)) {
        const entry = dataMap.get(formattedDate)!;
        const status = ticket.status.toLowerCase();
        if (status.includes('open')) {
          entry.open++;
        } else if (status.includes('pending') || status.includes('on tech') || status.includes('on product') || status.includes('waiting on customer')) {
          entry['in progress']++;
        } else if (status.includes('resolved')) {
          entry.resolved++;
        } else if (status.includes('closed')) {
          entry.closed++;
        }
      }
    });

    return Array.from(dataMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [tickets, dateRange]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart
        data={processedData}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <defs>
          <linearGradient id="colorOpen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#60A5FA" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorInProgress" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#34D399" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#34D399" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#FBBF24" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#FBBF24" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorClosed" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#F87171" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#F87171" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
        <XAxis dataKey="date" tickFormatter={(tick) => format(parseISO(tick), 'MMM dd')} className="text-xs text-gray-600 dark:text-gray-400" />
        <YAxis className="text-xs text-gray-600 dark:text-gray-400" />
        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0.5rem' }} />
        <Legend onClick={(e) => handleLegendClick(e.dataKey)} />
        {!hiddenSeries.has('open') && <Area type="monotone" dataKey="open" stackId="1" stroke="#60A5FA" fill="url(#colorOpen)" name="Open" />}
        {!hiddenSeries.has('in progress') && <Area type="monotone" dataKey="in progress" stackId="1" stroke="#34D399" fill="url(#colorInProgress)" name="In Progress" />}
        {!hiddenSeries.has('resolved') && <Area type="monotone" dataKey="resolved" stackId="1" stroke="#FBBF24" fill="url(#colorResolved)" name="Resolved" />}
        {!hiddenSeries.has('closed') && <Area type="monotone" dataKey="closed" stackId="1" stroke="#F87171" fill="url(#colorClosed)" name="Closed" />}
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default TicketsOverTimeChart;