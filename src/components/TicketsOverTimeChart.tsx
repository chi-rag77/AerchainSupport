"use client";

import React, { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Dot } from 'recharts';
import { format, parseISO, startOfDay, eachDayOfInterval, subDays, isWithinInterval } from 'date-fns';
import { Ticket } from '@/types';

interface TicketsOverTimeChartProps {
  tickets: Ticket[];
  dateRange?: string;
  startDate?: Date;
  endDate?: Date;
}

// Custom Tooltip component to match the image
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const openData = payload.find((p: any) => p.dataKey === 'open');
    const closedData = payload.find((p: any) => p.dataKey === 'closed');

    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-sm">
        <p className="text-muted-foreground mb-1">{format(parseISO(label), 'MMM dd, yyyy')}</p>
        {openData && (
          <p className="flex items-center text-orange-500">
            <span className="inline-block w-2 h-2 rounded-full bg-orange-500 mr-2"></span>
            {openData.value} Open
          </p>
        )}
        {closedData && (
          <p className="flex items-center text-purple-500">
            <span className="inline-block w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
            {closedData.value} Closed
          </p>
        )}
      </div>
    );
  }
  return null;
};

// Custom Legend component to match the image
const CustomLineChartLegend = ({ payload }: any) => {
  return (
    <ul className="flex justify-end space-x-4 text-sm">
      {payload.map((entry: any, index: number) => (
        <li key={`item-${index}`} className="flex items-center text-muted-foreground">
          <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
          {entry.value === 'open' ? 'Achieved' : 'Target'} {/* Map 'open' to 'Achieved' and 'closed' to 'Target' */}
        </li>
      ))}
    </ul>
  );
};

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

    const dataMap = new Map<string, { date: string; open: number; closed: number; }>(); // Simplified to only open and closed

    intervalDays.forEach(day => {
      const formattedDate = format(day, 'yyyy-MM-dd');
      dataMap.set(formattedDate, { date: formattedDate, open: 0, closed: 0 });
    });

    tickets.forEach(ticket => {
      const createdAt = startOfDay(parseISO(ticket.created_at));
      const formattedDate = format(createdAt, 'yyyy-MM-dd');

      if (isWithinInterval(createdAt, { start: effectiveStartDate, end: effectiveEndDate }) && dataMap.has(formattedDate)) {
        const entry = dataMap.get(formattedDate)!;
        const status = ticket.status.toLowerCase();
        if (status.includes('open')) {
          entry.open++;
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
        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-200 dark:stroke-gray-700" />
        <XAxis
          dataKey="date"
          tickFormatter={(tick) => format(parseISO(tick), 'MMM yy')}
          className="text-xs font-semibold text-gray-600 dark:text-gray-400"
          interval="preserveStartEnd"
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          className="text-xs font-semibold text-gray-600 dark:text-gray-400"
          axisLine={false}
          tickLine={false}
          domain={[0, 'auto']} // Ensure Y-axis starts from 0
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ strokeDasharray: '3 3' }} // Vertical dashed line on hover
        />
        <Legend content={<CustomLineChartLegend />} onClick={(e) => handleLegendClick(e.dataKey)} />
        {!hiddenSeries.has('open') && <Line type="monotone" dataKey="open" stroke="hsl(28 100% 70%)" strokeWidth={2} dot={<Dot r={4} fill="hsl(28 100% 70%)" stroke="hsl(28 100% 70%)" />} name="open" />} {/* Orange */}
        {!hiddenSeries.has('closed') && <Line type="monotone" dataKey="closed" stroke="hsl(240 60% 70%)" strokeWidth={2} dot={<Dot r={4} fill="hsl(240 60% 70%)" stroke="hsl(240 60% 70%)" />} name="closed" />} {/* Purple */}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TicketsOverTimeChart;