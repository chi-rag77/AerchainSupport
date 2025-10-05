"use client";

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Ticket } from '@/types';

interface TicketTypeByCustomerChartProps {
  tickets: Ticket[];
  selectedCustomer?: string;
}

// Custom Tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-sm">
        <p className="font-medium text-foreground mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="flex items-center">
            <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Custom Legend component
const CustomBarChartLegend = ({ payload }: any) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 mt-4 text-xs text-gray-600 dark:text-gray-400">
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center space-x-1">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span>{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

// Specific colors for each ticket type from the reference
const TYPE_COLORS: { [key: string]: string } = {
  bug: "hsl(28 100% 70%)", // Orange
  csTask: "hsl(240 60% 70%)", // Purple
  duplicate: "hsl(180 60% 70%)", // Cyan
  notRelevant: "hsl(10 80% 70%)", // Red
  query: "hsl(48 100% 70%)", // Yellow
  techTask: "hsl(210 10% 70%)", // Gray
  'Unknown Type': "hsl(210 10% 70%)", // Default for unknown
};

const TicketTypeByCustomerChart = ({ tickets, selectedCustomer }: TicketTypeByCustomerChartProps) => {
  const processedData = useMemo(() => {
    if (!tickets || tickets.length === 0) return [];

    const customerTypeMap = new Map<string, { [key: string]: number | string }>();

    const relevantTickets = selectedCustomer && selectedCustomer !== "All"
      ? tickets.filter(ticket => (ticket.cf_company || 'Unknown Company') === selectedCustomer)
      : tickets;

    relevantTickets.forEach(ticket => {
      const customerName = ticket.cf_company || 'Unknown Customer';
      const type = ticket.type || 'Unknown Type';

      if (!customerTypeMap.has(customerName)) {
        customerTypeMap.set(customerName, { customer: customerName });
      }
      const customerData = customerTypeMap.get(customerName)!;

      // Map Freshdesk types to the desired categories
      let mappedType: string;
      switch (type.toLowerCase()) {
        case 'bug': mappedType = 'bug'; break;
        case 'cs task': mappedType = 'csTask'; break;
        case 'duplicate': mappedType = 'duplicate'; break;
        case 'not relevant': mappedType = 'notRelevant'; break;
        case 'query': mappedType = 'query'; break;
        case 'tech-task': mappedType = 'techTask'; break;
        default: mappedType = 'Unknown Type'; break;
      }

      customerData[mappedType] = ((customerData[mappedType] as number) || 0) + 1;
    });

    // Convert map to array and sort by total tickets (sum of all types)
    const dataArray = Array.from(customerTypeMap.values()).map(data => {
      let total = 0;
      for (const key in data) {
        if (key !== 'customer' && typeof data[key] === 'number') {
          total += data[key] as number;
        }
      }
      return { ...data, totalTickets: total };
    });

    return dataArray.sort((a, b) => (b.totalTickets as number) - (a.totalTickets as number));
  }, [tickets, selectedCustomer]);

  const uniqueTypes = useMemo(() => {
    const types = new Set<string>();
    processedData.forEach(data => {
      for (const key in data) {
        if (key !== 'customer' && key !== 'totalTickets' && typeof data[key] === 'number') {
          types.add(key);
        }
      }
    });
    // Ensure a consistent order for stacking
    return ['bug', 'csTask', 'duplicate', 'notRelevant', 'query', 'techTask', 'Unknown Type'].filter(t => types.has(t));
  }, [processedData]);

  const legendPayload = uniqueTypes.map(type => ({
    value: type,
    color: TYPE_COLORS[type] || TYPE_COLORS['Unknown Type'],
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={processedData}
        layout="horizontal" // Horizontal layout
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-200 dark:stroke-gray-700" />
        <XAxis
          type="number"
          axisLine={false}
          tickLine={false}
          fontSize={12}
          tick={{ fill: 'hsl(215.4 16.3% 46.9%)' }}
        />
        <YAxis
          dataKey="customer"
          type="category"
          axisLine={false}
          tickLine={false}
          fontSize={11}
          width={120} // Increased width for customer names
          tick={{ fill: 'hsl(215.4 16.3% 46.9%)' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend content={<CustomBarChartLegend payload={legendPayload} />} />
        {uniqueTypes.map((type, index) => (
          <Bar
            key={type}
            dataKey={type}
            stackId="a"
            fill={TYPE_COLORS[type] || TYPE_COLORS['Unknown Type']}
            name={type}
            radius={[0, 4, 4, 0]} // Rounded corners for horizontal bars
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TicketTypeByCustomerChart;