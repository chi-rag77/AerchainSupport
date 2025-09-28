"use client";

import React, { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO, startOfDay, eachDayOfInterval, subDays } from 'date-fns';
import { Ticket } from '@/types';

interface TicketsOverTimeChartProps {
  tickets: Ticket[];
  dateRange: string; // e.g., "last7days", "last30days", "alltime"
}

// Custom X-Axis Tick Component for circles and month names
const CustomXAxisTick = (props: any) => {
  const { x, y, payload } = props;
  const date = parseISO(payload.value);
  const month = format(date, 'MMM');

  return (
    <g transform={`translate(${x},${y})`}>
      <circle cx={0} cy={10} r={3} fill="hsl(var(--muted-foreground))" /> {/* Static grey circle */}
      <text x={0} y={25} textAnchor="middle" fill="hsl(var(--foreground))" className="text-xs">
        {month}
      </text>
    </g>
  );
};

// Custom Tooltip Component to match the design's style
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const date = format(parseISO(label), 'MMM dd, yyyy');
    return (
      <div className="rounded-md border bg-card p-2 shadow-sm text-sm">
        <p className="font-semibold mb-1">{date}</p>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center justify-between">
            <span className="flex items-center">
              <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
              {entry.name}:
            </span>
            <span className="font-medium ml-2">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const TicketsOverTimeChart = ({ tickets, dateRange }: TicketsOverTimeChartProps) => {
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

    const dataMap = new Map<string, { date: string; openTickets: number; closedTickets: number; }>();

    intervalDays.forEach(day => {
      const formattedDate = format(day, 'yyyy-MM-dd');
      dataMap.set(formattedDate, { date: formattedDate, openTickets: 0, closedTickets: 0 });
    });

    tickets.forEach(ticket => {
      const createdAt = startOfDay(parseISO(ticket.created_at));
      const formattedDate = format(createdAt, 'yyyy-MM-dd');

      if (dataMap.has(formattedDate)) {
        const entry = dataMap.get(formattedDate)!;
        const status = ticket.status.toLowerCase();
        if (status.includes('open') || status.includes('pending') || status.includes('on tech') || status.includes('on product') || status.includes('waiting on customer')) {
          entry.openTickets++;
        } else if (status.includes('resolved') || status.includes('closed')) {
          entry.closedTickets++;
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
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid horizontal={false} strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
          minTickGap={20}
          padding={{ left: 20, right: 20 }}
          className="text-xs text-gray-600 dark:text-gray-400"
          tick={<CustomXAxisTick />}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          className="text-xs text-gray-600 dark:text-gray-400"
        />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
        <Legend
          align="right"
          verticalAlign="top"
          height={36}
          iconType="circle"
          wrapperStyle={{ paddingBottom: '10px' }}
          onClick={(e) => handleLegendClick(e.dataKey)}
        />
        {!hiddenSeries.has('closedTickets') && <Line type="monotone" dataKey="closedTickets" stroke="#60A5FA" strokeWidth={2} dot={false} activeDot={{ r: 5, fill: '#60A5FA', stroke: '#60A5FA', strokeWidth: 2 }} name="Closed" />}
        {!hiddenSeries.has('openTickets') && <Line type="monotone" dataKey="openTickets" stroke="#EF4444" strokeWidth={2} dot={false} activeDot={{ r: 5, fill: '#EF4444', stroke: '#EF4444', strokeWidth: 2 }} name="Open" />}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TicketsOverTimeChart;