"use client";

import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Dot } from 'recharts';
import { format, parseISO, startOfDay, eachDayOfInterval, subDays, isWithinInterval } from 'date-fns';
import { Ticket } from '@/types';

interface CustomerEngagementTrendChartProps {
  tickets: Ticket[];
  startDate: Date;
  endDate: Date;
  selectedCustomers: string[]; // Customers to display trends for
}

// A diverse color palette for multiple lines
const CUSTOMER_COLORS = [
  "hsl(28 100% 70%)", // Orange
  "hsl(240 60% 70%)", // Purple
  "hsl(120 60% 70%)", // Green
  "hsl(10 80% 70%)",  // Red
  "hsl(180 60% 70%)", // Cyan
  "hsl(48 100% 70%)", // Yellow
  "hsl(210 10% 70%)", // Gray
  "hsl(300 60% 70%)", // Magenta
  "hsl(60 60% 70%)",  // Lime
  "hsl(270 60% 70%)", // Indigo
];

// Custom Tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-sm">
        <p className="text-muted-foreground mb-1">{format(parseISO(label), 'MMM dd, yyyy')}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="flex items-center">
            <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
            {entry.name}: {entry.value} tickets
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Custom Legend component
const CustomLineChartLegend = ({ payload }: any) => {
  return (
    <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm mt-4 text-gray-600 dark:text-gray-400">
      {payload.map((entry: any, index: number) => (
        <li key={`item-${index}`} className="flex items-center space-x-2">
          <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
          <span>{entry.value}</span>
        </li>
      ))}
    </ul>
  );
};

const CustomerEngagementTrendChart = ({ tickets, startDate, endDate, selectedCustomers }: CustomerEngagementTrendChartProps) => {
  const processedData = useMemo(() => {
    if (!tickets || tickets.length === 0 || !startDate || !endDate) return [];

    const intervalDays = eachDayOfInterval({ start: startDate, end: endDate });
    const dataMap = new Map<string, { date: string; [customer: string]: number | string }>();

    intervalDays.forEach(day => {
      const formattedDate = format(day, 'yyyy-MM-dd');
      const initialEntry: { date: string; [customer: string]: number | string } = { date: formattedDate };
      selectedCustomers.forEach(customer => {
        initialEntry[customer] = 0;
      });
      dataMap.set(formattedDate, initialEntry);
    });

    tickets.forEach(ticket => {
      const customerName = ticket.cf_company || 'Unknown Company';
      if (selectedCustomers.length > 0 && !selectedCustomers.includes(customerName)) {
        return; // Skip if customer is not selected
      }

      const createdAt = startOfDay(parseISO(ticket.created_at));
      const formattedCreatedAt = format(createdAt, 'yyyy-MM-dd');

      if (isWithinInterval(createdAt, { start: startDate, end: endDate }) && dataMap.has(formattedCreatedAt)) {
        const entry = dataMap.get(formattedCreatedAt)!;
        entry[customerName] = ((entry[customerName] as number) || 0) + 1;
      }
    });

    return Array.from(dataMap.values()).sort((a, b) => (a.date as string).localeCompare(b.date as string));
  }, [tickets, startDate, endDate, selectedCustomers]);

  const legendPayload = selectedCustomers.map((customer, index) => ({
    value: customer,
    color: CUSTOMER_COLORS[index % CUSTOMER_COLORS.length],
  }));

  return (
    <div className="relative w-full h-full flex flex-col">
      <ResponsiveContainer width="100%" height="calc(100% - 40px)"> {/* Adjust height for legend */}
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
            axisLine={false}
            tickLine={false}
            fontSize={12}
            tick={{ fill: 'hsl(215.4 16.3% 46.9%)' }}
            domain={[0, 'auto']}
          />
          <Tooltip content={<CustomTooltip />} />
          {selectedCustomers.map((customer, index) => (
            <Line
              key={customer}
              type="monotone"
              dataKey={customer}
              stroke={CUSTOMER_COLORS[index % CUSTOMER_COLORS.length]}
              strokeWidth={2}
              dot={{ fill: CUSTOMER_COLORS[index % CUSTOMER_COLORS.length], strokeWidth: 2, r: 4 }}
              name={customer}
              activeDot={{ r: 6, strokeWidth: 2, fill: CUSTOMER_COLORS[index % CUSTOMER_COLORS.length] }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <CustomLineChartLegend payload={legendPayload} />
    </div>
  );
};

export default CustomerEngagementTrendChart;