"use client";

import React, { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Dot } from 'recharts'; // Changed to LineChart, added Dot
import { format, parseISO, startOfDay, eachDayOfInterval, subDays, isWithinInterval } from 'date-fns';
import { Ticket } from '@/types';

interface TicketsOverTimeChartProps {
  tickets: Ticket[];
  dateRange?: string;
  startDate?: Date;
  endDate?: Date;
}

const TicketsOverTimeChart = ({ tickets, dateRange, startDate, endDate }: TicketsOverTimeChartProps) => {
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

    let effectiveStartDate: Date;
    let effectiveEndDate: Date = new Date();

    if (startDate && endDate) {
      effectiveStartDate = startDate;
      effectiveEndDate = endDate;
    } else {
      const now = new Date();
      switch (dateRange) {
        case "last7days":
          effectiveStartDate = subDays(now, 7);
          break;
        case "last14days":
          effectiveStartDate = subDays(now, 14);
          break;
        case "last30days":
          effectiveStartDate = subDays(now, 30);
          break;
        case "last90days":
          effectiveStartDate = subDays(now, 90);
          break;
        case "alltime":
          effectiveStartDate = new Date(0);
          break;
        default:
          effectiveStartDate = subDays(now, 30);
          break;
      }
    }

    const intervalDays = eachDayOfInterval({ start: effectiveStartDate, end: effectiveEndDate });

    const dataMap = new Map<string, { date: string; open: number; 'in progress': number; resolved: number; closed: number; }>();

    intervalDays.forEach(day => {
      const formattedDate = format(day, 'yyyy-MM-dd');
      dataMap.set(formattedDate, { date: formattedDate, open: 0, 'in progress': 0, resolved: 0, closed: 0 });
    });

    tickets.forEach(ticket => {
      const createdAt = startOfDay(parseISO(ticket.created_at));
      const formattedDate = format(createdAt, 'yyyy-MM-dd');

      if (isWithinInterval(createdAt, { start: effectiveStartDate, end: effectiveEndDate }) && dataMap.has(formattedDate)) {
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
  }, [tickets, dateRange, startDate, endDate]);

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
        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-200 dark:stroke-gray-700" /> {/* Removed vertical grid lines */}
        <XAxis
          dataKey="date"
          tickFormatter={(tick) => format(parseISO(tick), 'MMM yy')} // Simplified date format
          className="text-xs font-semibold text-gray-600 dark:text-gray-400"
          interval="preserveStartEnd"
          axisLine={false} // Hide x-axis line
          tickLine={false} // Hide x-axis tick lines
        />
        <YAxis
          className="text-xs font-semibold text-gray-600 dark:text-gray-400"
          axisLine={false} // Hide y-axis line
          tickLine={false} // Hide y-axis tick lines
        />
        <Tooltip
          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0.5rem' }}
          labelFormatter={(label) => format(parseISO(label), 'MMM dd, yyyy')}
        />
        <Legend onClick={(e) => handleLegendClick(e.dataKey)} />
        {!hiddenSeries.has('open') && <Line type="monotone" dataKey="open" stroke="hsl(28 100% 70%)" strokeWidth={2} dot={<Dot r={4} />} name="Open" />} {/* Soft Orange/Peach */}
        {!hiddenSeries.has('closed') && <Line type="monotone" dataKey="closed" stroke="hsl(240 60% 70%)" strokeWidth={2} dot={<Dot r={4} />} name="Closed" />} {/* Soft Blue/Purple */}
        {/* Removed 'in progress' and 'resolved' lines for simplicity and to match image style */}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TicketsOverTimeChart;