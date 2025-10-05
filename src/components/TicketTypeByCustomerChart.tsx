"use client";

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Ticket } from '@/types';

interface TicketTypeByCustomerChartProps {
  tickets: Ticket[];
  selectedCustomer?: string;
}

// Softer, unified color palette inspired by the image
const COLORS = [
  'hsl(28 100% 70%)',   // Soft Orange/Peach
  'hsl(240 60% 70%)',  // Soft Blue/Purple
  'hsl(180 60% 70%)',  // Soft Teal
  'hsl(10 80% 70%)',   // Soft Red/Coral
  'hsl(48 100% 70%)',  // Soft Yellow
  'hsl(210 10% 70%)',  // Soft Gray
];

// Define the type for the data structure used in the chart
interface CustomerChartData {
  name: string;
  totalTickets: number;
  [key: string]: number | string;
}

const TicketTypeByCustomerChart = ({ tickets, selectedCustomer }: TicketTypeByCustomerChartProps) => {
  const processedData = useMemo(() => {
    if (!tickets || tickets.length === 0) return [];

    const customerTypeMap = new Map<string, CustomerChartData>();

    const relevantTickets = selectedCustomer && selectedCustomer !== "All"
      ? tickets.filter(ticket => (ticket.cf_company || 'Unknown Company') === selectedCustomer)
      : tickets;

    relevantTickets.forEach(ticket => {
      const company = ticket.cf_company || 'Unknown Company';
      const type = ticket.type || 'Unknown Type';

      if (!customerTypeMap.has(company)) {
        customerTypeMap.set(company, { name: company, totalTickets: 0 });
      }
      const companyData = customerTypeMap.get(company)!;
      companyData[type] = ((companyData[type] as number) || 0) + 1;
      companyData.totalTickets++;
    });

    if (selectedCustomer && selectedCustomer !== "All") {
      const data = customerTypeMap.get(selectedCustomer);
      return data ? [data] : [];
    }

    return Array.from(customerTypeMap.values()).sort((a, b) => b.totalTickets - a.totalTickets);
  }, [tickets, selectedCustomer]);

  const uniqueTypes = useMemo(() => {
    const types = new Set<string>();
    tickets.forEach(ticket => {
      if (ticket.type) types.add(ticket.type);
    });
    return Array.from(types).sort();
  }, [tickets]);

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
        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-200 dark:stroke-gray-700" /> {/* Removed vertical grid lines */}
        <XAxis
          dataKey="name"
          angle={-45}
          textAnchor="end"
          height={80}
          interval={0}
          className="text-xs text-gray-600 dark:text-gray-400"
          axisLine={false} // Hide x-axis line
          tickLine={false} // Hide x-axis tick lines
        />
        <YAxis
          className="text-xs text-gray-600 dark:text-gray-400"
          axisLine={false} // Hide y-axis line
          tickLine={false} // Hide y-axis tick lines
        />
        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0.5rem' }} />
        <Legend verticalAlign="top" height={36} />
        {uniqueTypes.map((type, index) => (
          <Bar key={type} dataKey={type} stackId="a" fill={COLORS[index % COLORS.length]} name={type} radius={[4, 4, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TicketTypeByCustomerChart;