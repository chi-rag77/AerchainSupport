"use client";

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { Ticket } from '@/types';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface TicketTypeByCustomerChartProps {
  tickets: Ticket[];
  selectedCustomer?: string;
  topNCustomers?: number | 'all';
}

// Modern, aesthetic color palette
const TYPE_COLORS: { [key: string]: string } = {
  bug: "#F43F5E",         // Rose 500
  csTask: "#3B82F6",      // Blue 500
  duplicate: "#10B981",   // Emerald 500
  notRelevant: "#94A3B8", // Slate 400
  query: "#F59E0B",       // Amber 500
  techTask: "#8B5CF6",    // Violet 500
  'Unknown Type': "#E2E8F0", // Slate 200
};

const TYPE_LABELS: { [key: string]: string } = {
  bug: "Bug",
  csTask: "CS Task",
  duplicate: "Duplicate",
  notRelevant: "Not Relevant",
  query: "Query",
  techTask: "Tech Task",
  'Unknown Type': "Other",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const totalForCustomer = payload.reduce((sum: number, entry: any) => sum + (entry.value || 0), 0);
    const sortedPayload = [...payload].sort((a, b) => b.value - a.value);

    return (
      <div className="bg-white/90 dark:bg-gray-950/90 p-4 rounded-[20px] shadow-2xl border border-border/50 backdrop-blur-md min-w-[240px] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-black tracking-tight text-foreground uppercase">{label}</p>
          <Badge variant="secondary" className="bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-none font-bold text-[10px]">
            {totalForCustomer} Total
          </Badge>
        </div>
        
        <Separator className="mb-3 opacity-50" />
        
        <div className="space-y-2.5">
          {sortedPayload.map((entry: any, index: number) => {
            const percentage = ((entry.value / totalForCustomer) * 100).toFixed(1);
            return (
              <div key={index} className="flex items-center justify-between gap-8 group">
                <div className="flex items-center gap-2.5">
                  <div 
                    className="w-2 h-2 rounded-full shrink-0 shadow-sm" 
                    style={{ backgroundColor: entry.color }} 
                  />
                  <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                    {TYPE_LABELS[entry.name] || entry.name}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-black text-foreground">{entry.value}</span>
                  <span className="text-[10px] font-bold text-muted-foreground/60">{percentage}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

const TicketTypeByCustomerChart = ({ tickets, selectedCustomer, topNCustomers = 'all' }: TicketTypeByCustomerChartProps) => {
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

    const dataArray = Array.from(customerTypeMap.values()).map(data => {
      let total = 0;
      for (const key in data) {
        if (key !== 'customer' && typeof data[key] === 'number') {
          total += data[key] as number;
        }
      }
      return { ...data, totalTickets: total };
    });

    let filteredAndSortedData = dataArray.sort((a, b) => (b.totalTickets as number) - (a.totalTickets as number));
    if (topNCustomers !== 'all' && typeof topNCustomers === 'number') {
      filteredAndSortedData = filteredAndSortedData.slice(0, topNCustomers);
    }

    return filteredAndSortedData;
  }, [tickets, selectedCustomer, topNCustomers]);

  const uniqueTypes = useMemo(() => {
    const typesSet = new Set<string>();
    processedData.forEach(dataRow => {
      for (const key in dataRow) {
        if (key !== 'customer' && key !== 'totalTickets' && typeof dataRow[key] === 'number' && dataRow[key] > 0) {
          typesSet.add(key);
        }
      }
    });
    const orderedTypes = ['bug', 'csTask', 'duplicate', 'notRelevant', 'query', 'techTask', 'Unknown Type'];
    return orderedTypes.filter(type => typesSet.has(type));
  }, [processedData]);

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={processedData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          barGap={8}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            horizontal={false} 
            stroke="currentColor" 
            className="text-gray-100 dark:text-gray-800" 
          />
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            fontSize={10}
            fontWeight="bold"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis
            dataKey="customer"
            type="category"
            axisLine={false}
            tickLine={false}
            fontSize={10}
            fontWeight="black"
            width={100}
            tick={{ fill: 'hsl(var(--foreground))' }}
            interval={0}
            tickFormatter={(value) => value.length > 12 ? `${value.substring(0, 10)}...` : value}
          />
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ fill: 'rgba(99, 102, 241, 0.04)', radius: 12 }}
          />
          {uniqueTypes.map((type, index) => (
            <Bar
              key={type}
              dataKey={type}
              stackId="a"
              fill={TYPE_COLORS[type] || TYPE_COLORS['Unknown Type']}
              name={type}
              radius={index === uniqueTypes.length - 1 ? [0, 6, 6, 0] : [0, 0, 0, 0]}
              barSize={24}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TicketTypeByCustomerChart;