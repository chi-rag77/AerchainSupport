"use client";

import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Dot } from 'recharts';
import { format, parseISO, startOfDay, eachDayOfInterval, isWithinInterval, differenceInDays } from 'date-fns';
import { Ticket } from '@/types';

interface VolumeSlaTrendChartProps {
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
            {entry.name === 'created' ? 'Tickets Created' : 'SLA Compliance'}: {entry.name === 'slaCompliance' ? `${entry.value.toFixed(1)}%` : entry.value}
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
          <span>{entry.value === 'created' ? 'Tickets Created' : 'SLA Compliance'}</span>
        </li>
      ))}
    </ul>
  );
};

const VolumeSlaTrendChart = ({ tickets, startDate, endDate }: VolumeSlaTrendChartProps) => {
  const processedData = useMemo(() => {
    if (!tickets || tickets.length === 0 || !startDate || !endDate) return [];

    const intervalDays = eachDayOfInterval({ start: startDate, end: endDate });
    const dataMap = new Map<string, { date: string; created: number; slaMetCount: number; slaTotalCount: number; slaCompliance: number }>();

    intervalDays.forEach(day => {
      const formattedDate = format(day, 'yyyy-MM-dd');
      dataMap.set(formattedDate, { date: formattedDate, created: 0, slaMetCount: 0, slaTotalCount: 0, slaCompliance: 0 });
    });

    tickets.forEach(ticket => {
      const createdAt = startOfDay(parseISO(ticket.created_at));
      const formattedCreatedAt = format(createdAt, 'yyyy-MM-dd');

      if (isWithinInterval(createdAt, { start: startDate, end: endDate }) && dataMap.has(formattedCreatedAt)) {
        const entry = dataMap.get(formattedCreatedAt)!;
        entry.created++;

        // For SLA compliance, we consider tickets resolved/closed within their due_by
        if (ticket.due_by && (ticket.status.toLowerCase() === 'resolved' || ticket.status.toLowerCase() === 'closed')) {
          const resolvedAt = parseISO(ticket.updated_at); // Using updated_at as proxy for resolved_at
          const dueBy = parseISO(ticket.due_by);
          
          entry.slaTotalCount++;
          if (resolvedAt <= dueBy) {
            entry.slaMetCount++;
          }
        }
      }
    });

    // Calculate SLA compliance percentage for each day
    Array.from(dataMap.values()).forEach(entry => {
      if (entry.slaTotalCount > 0) {
        entry.slaCompliance = (entry.slaMetCount / entry.slaTotalCount) * 100;
      } else {
        entry.slaCompliance = 100; // If no SLA applicable tickets, assume 100% compliance
      }
    });

    return Array.from(dataMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [tickets, startDate, endDate]);

  const legendPayload = [
    { value: 'created', color: 'hsl(28 100% 70%)' },
    { value: 'slaCompliance', color: 'hsl(240 60% 70%)' }
  ];

  return (
    <div className="relative w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={processedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-200 dark:stroke-gray-700" />
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
            yAxisId="left"
            axisLine={false}
            tickLine={false}
            fontSize={12}
            tick={{ fill: 'hsl(215.4 16.3% 46.9%)' }}
            domain={[0, 'auto']}
            label={{ value: 'Tickets', angle: -90, position: 'insideLeft', fill: 'hsl(215.4 16.3% 46.9%)', fontSize: 12 }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            axisLine={false}
            tickLine={false}
            fontSize={12}
            tickFormatter={(tick) => `${tick}%`}
            tick={{ fill: 'hsl(215.4 16.3% 46.9%)' }}
            domain={[0, 100]}
            label={{ value: 'SLA %', angle: 90, position: 'insideRight', fill: 'hsl(215.4 16.3% 46.9%)', fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLineChartLegend payload={legendPayload} />} />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="created"
            stroke="hsl(28 100% 70%)"
            strokeWidth={2}
            dot={{ fill: 'hsl(28 100% 70%)', strokeWidth: 2, r: 4 }}
            name="created"
            activeDot={{ r: 6, strokeWidth: 2, fill: 'hsl(28 100% 70%)' }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="slaCompliance"
            stroke="hsl(240 60% 70%)"
            strokeWidth={2}
            dot={{ fill: 'hsl(240 60% 70%)', strokeWidth: 2, r: 4 }}
            name="slaCompliance"
            activeDot={{ r: 6, strokeWidth: 2, fill: 'hsl(240 60% 70%)' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VolumeSlaTrendChart;