"use client";

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Ticket } from '@/types';

interface TicketTypeByCustomerChartProps {
  tickets: Ticket[];
}

// Define the type for the data structure used in the chart
interface CustomerChartData {
  name: string;
  [key: string]: number | string; // Allows 'name' to be a string, and other dynamic keys (ticket types) to be numbers
}

const TicketTypeByCustomerChart = ({ tickets }: TicketTypeByCustomerChartProps) => {
  const processedData = useMemo(() => {
    if (!tickets || tickets.length === 0) return [];

    const customerTypeMap = new Map<string, CustomerChartData>();

    tickets.forEach(ticket => {
      const company = ticket.cf_company || 'Unknown Company';
      const type = ticket.type || 'Unknown Type';

      if (!customerTypeMap.has(company)) {
        customerTypeMap.set(company, { name: company });
      }
      const companyData = customerTypeMap.get(company)!;
      // Use type assertion here as we know 'type' keys will hold numbers
      companyData[type] = ((companyData[type] as number) || 0) + 1;
    });

    return Array.from(customerTypeMap.values());
  }, [tickets]);

  const uniqueTypes = useMemo(() => {
    const types = new Set<string>();
    tickets.forEach(ticket => {
      if (ticket.type) types.add(ticket.type);
    });
    return Array.from(types).sort();
  }, [tickets]);

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#a4de6c', '#d0ed57', '#83a6ed', '#8dd1e1']; // More colors for types

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={processedData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
        <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} interval={0} className="text-xs text-gray-600 dark:text-gray-400" /> {/* Rotated labels */}
        <YAxis className="text-xs text-gray-600 dark:text-gray-400" />
        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0.5rem' }} />
        <Legend verticalAlign="top" height={36} /> {/* Adjusted legend position */}
        {uniqueTypes.map((type, index) => (
          <Bar key={type} dataKey={type} stackId="a" fill={colors[index % colors.length]} name={type} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TicketTypeByCustomerChart;