"use client";

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Ticket } from '@/types';

interface TicketTypeByCustomerChartProps {
  tickets: Ticket[];
  selectedCustomer?: string; // New prop for filtering by specific customer
}

// Define the type for the data structure used in the chart
interface CustomerChartData {
  name: string;
  totalTickets: number; // Added for sorting
  [key: string]: number | string; // Allows 'name' to be a string, and other dynamic keys (ticket types) to be numbers
}

const TicketTypeByCustomerChart = ({ tickets, selectedCustomer }: TicketTypeByCustomerChartProps) => {
  const processedData = useMemo(() => {
    if (!tickets || tickets.length === 0) return [];

    const customerTypeMap = new Map<string, CustomerChartData>();

    // Filter tickets by selected customer first
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
      companyData.totalTickets++; // Increment total tickets for sorting
    });

    // If a specific customer is selected, only show that customer
    if (selectedCustomer && selectedCustomer !== "All") {
      const data = customerTypeMap.get(selectedCustomer);
      return data ? [data] : [];
    }

    // Otherwise, show all customers sorted by total ticket volume
    return Array.from(customerTypeMap.values()).sort((a, b) => b.totalTickets - a.totalTickets);
  }, [tickets, selectedCustomer]);

  const uniqueTypes = useMemo(() => {
    const types = new Set<string>();
    tickets.forEach(ticket => {
      if (ticket.type) types.add(ticket.type);
    });
    return Array.from(types).sort();
  }, [tickets]);

  // Unified color palette - slightly softer and more varied
  const colors = ['#60A5FA', '#34D399', '#FBBF24', '#F87171', '#A78BFA', '#2DD4BF', '#FACC15', '#FB923C', '#A3A3A3', '#C084FC'];

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
        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} className="text-xs text-gray-600 dark:text-gray-400" /> {/* Increased height for labels */}
        <YAxis className="text-xs text-gray-600 dark:text-gray-400" />
        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0.5rem' }} />
        <Legend verticalAlign="top" height={36} /> {/* Adjusted legend position */}
        {uniqueTypes.map((type, index) => (
          <Bar key={type} dataKey={type} stackId="a" fill={colors[index % colors.length]} name={type} radius={[4, 4, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TicketTypeByCustomerChart;