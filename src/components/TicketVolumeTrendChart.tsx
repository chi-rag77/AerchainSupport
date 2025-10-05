"use client";

import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO, startOfDay, eachDayOfInterval, subDays, isWithinInterval } from 'date-fns';
import { Ticket } from '@/types';

interface TicketVolumeTrendChartProps {
  tickets: Ticket[];
  startDate: Date;
  endDate: Date;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-sm">
        <p className="text-muted-foreground mb-1">{format(parseISO(label), 'MMM dd, yyyy')}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="flex items-center">
            <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
            {entry.name === 'created' ? 'Created' : 'Resolved/Closed'}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const CustomLineChartLegend = ({ payload }: any) => {
  return (
    <ul className="flex justify-end space-x-6 text-sm absolute top-0 right-0 p-2">
      {payload.map((entry: any, index: number) => (
        <li key={`item-${index}`} className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
          <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
          <span>{entry.value === 'created' ? 'Created' : 'Resolved/Closed'}</span>
        </li>
      ))}
    </ul>
  );
};

const TicketVolumeTrendChart = ({ tickets, startDate, endDate }: TicketVolumeTrendChartProps) => {
  const processedData = useMemo(() => {
    if (!tickets || tickets.length === 0 || !startDate || !endDate) return [];

    const intervalDays = eachDayOfInterval({ start: startDate, end: endDate });

    const dataMap = new Map<string, { date: string; created: number; resolved: number; }>();

    intervalDays.forEach(day => {
      const formattedDate = format(day, 'yyyy-MM-dd');
      dataMap.set(formattedDate, { date: formattedDate, created: 0, resolved: 0 });
    });

    tickets.forEach(ticket => {
      const createdAt = startOfDay(parseISO(ticket.created_at));
      const formattedCreatedAt = format(createdAt, 'yyyy-MM-dd');

      if (isWithinInterval(createdAt, { start: startDate, end: endDate }) && dataMap.has(formattedCreatedAt)) {
        const entry = dataMap.get(formattedCreatedAt)!;
        entry.created++;
      }

      const statusLower = ticket.status.toLowerCase();
      if ((statusLower === 'resolved' || statusLower === 'closed') && ticket.updated_at) {
        const resolvedAt = startOfDay(parseISO(ticket.updated_at));
        const formattedResolvedAt = format(resolvedAt, 'yyyy-MM-dd');
        if (isWithinInterval(resolvedAt, { start: startDate, end: endDate }) && dataMap.has(formattedResolvedAt)) {
          const entry = dataMap.get(formattedResolvedAt)!;
          entry.resolved++;
        }
      }
    });

    return Array.from(dataMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [tickets, startDate, endDate]);

  return (
    <div className="relative w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={processedData}>
          <defs>
            <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(28 100% 70%)" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="hsl(28 100% 70%)" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
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
            dataKey="created"
            stackId="1"
            stroke="hsl(28 100% 70%)"
            fill="url(#colorCreated)"
            strokeWidth={2}
            dot={{ fill: 'hsl(28 100% 70%)', strokeWidth: 2, r: 4 }}
            name="created"
          />
          <Area
            type="monotone"
            dataKey="resolved"
            stackId="1"
            stroke="hsl(240 60% 70%)"
            fill="url(#colorResolved)"
            strokeWidth={2}
            dot={{ fill: 'hsl(240 60% 70%)', strokeWidth: 2, r: 4 }}
            name="resolved"
          />
        </AreaChart>
      </ResponsiveContainer>
      <CustomLineChartLegend payload={[
        { value: 'created', color: 'hsl(28 100% 70%)' },
        { value: 'resolved', color: 'hsl(240 60% 70%)' }
      ]} />
    </div>
  );
};

export default TicketVolumeTrendChart;