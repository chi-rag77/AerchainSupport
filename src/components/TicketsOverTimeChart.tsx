"use client";

import React, { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Dot } from 'recharts';
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
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-sm">
        <p className="text-muted-foreground mb-1">{format(parseISO(label), 'MMM dd, yyyy')}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="flex items-center">
            <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
            {entry.name === 'achieved' ? 'Achieved' : 'Target'}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Custom Legend component to match the image
const CustomLineChartLegend = ({ payload }: any) => {
  return (
    <ul className="flex justify-end space-x-6 text-sm absolute top-0 right-0 p-2"> {/* Positioned top-right */}
      {payload.map((entry: any, index: number) => (
        <li key={`item-${index}`} className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
          <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
          <span>{entry.value === 'achieved' ? 'Achieved' : 'Target'}</span>
        </li>
      ))}
    </ul>
  );
};

const TicketsOverTimeChart = ({ tickets, dateRange, startDate, endDate }: TicketsOverTimeChartProps) => {
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

    const dataMap = new Map<string, { date: string; achieved: number; target: number; }>();

    intervalDays.forEach(day => {
      const formattedDate = format(day, 'yyyy-MM-dd');
      dataMap.set(formattedDate, { date: formattedDate, achieved: 0, target: 0 });
    });

    tickets.forEach(ticket => {
      const createdAt = startOfDay(parseISO(ticket.created_at));
      const formattedDate = format(createdAt, 'yyyy-MM-dd');

      if (isWithinInterval(createdAt, { start: effectiveStartDate, end: effectiveEndDate }) && dataMap.has(formattedDate)) {
        const entry = dataMap.get(formattedDate)!;
        const status = ticket.status.toLowerCase();
        if (status.includes('open')) { // Mapping 'open' to 'achieved'
          entry.achieved++;
        } else if (status.includes('closed') || status.includes('resolved')) { // Mapping 'closed'/'resolved' to 'target'
          entry.target++;
        }
      }
    });

    return Array.from(dataMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [tickets, dateRange, startDate, endDate]);

  return (
    <div className="relative w-full h-full"> {/* Added relative positioning for absolute legend */}
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={processedData}> {/* Changed to AreaChart */}
          <defs>
            <linearGradient id="colorAchieved" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(28 100% 70%)" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="hsl(28 100% 70%)" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(240 60% 70%)" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="hsl(240 60% 70%)" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tickFormatter={(tick) => format(parseISO(tick), 'MMM dd')}
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
            dataKey="achieved"
            stackId="1" // Stacked areas
            stroke="hsl(28 100% 70%)"
            fill="url(#colorAchieved)"
            strokeWidth={2}
            dot={{ fill: 'hsl(28 100% 70%)', strokeWidth: 2, r: 4 }}
            name="achieved"
          />
          <Area
            type="monotone"
            dataKey="target"
            stackId="1" // Stacked areas
            stroke="hsl(240 60% 70%)"
            fill="url(#colorTarget)"
            strokeWidth={2}
            dot={{ fill: 'hsl(240 60% 70%)', strokeWidth: 2, r: 4 }}
            name="target"
          />
        </AreaChart>
      </ResponsiveContainer>
      <CustomLineChartLegend payload={[
        { value: 'achieved', color: 'hsl(28 100% 70%)' },
        { value: 'target', color: 'hsl(240 60% 70%)' }
      ]} />
    </div>
  );
};

export default TicketsOverTimeChart;