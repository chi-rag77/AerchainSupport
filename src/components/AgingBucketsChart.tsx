"use client";

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Cell } from 'recharts';
import { Ticket } from '@/types';
import { differenceInHours, parseISO } from 'date-fns';

interface AgingBucketsChartProps {
  tickets: Ticket[];
  onBarClick?: (tickets: Ticket[], title: string) => void; // New prop for click handler
}

const BUCKET_COLORS = {
  '0-24h': "hsl(120 60% 70%)", // Green (Low Risk)
  '1-3 days': "hsl(48 100% 70%)", // Yellow (Medium Risk)
  '3-7 days': "hsl(28 100% 60%)", // Orange (High Risk - slightly darker)
  '>7 days': "hsl(10 80% 50%)",  // Red (Critical Risk - darker red)
};

const BUCKET_TICKETS: { [key: string]: (ticket: Ticket, now: Date) => boolean } = {
  '0-24h': (ticket, now) => differenceInHours(now, parseISO(ticket.created_at)) <= 24,
  '1-3 days': (ticket, now) => {
    const ageHours = differenceInHours(now, parseISO(ticket.created_at));
    return ageHours > 24 && ageHours <= 72;
  },
  '3-7 days': (ticket, now) => {
    const ageHours = differenceInHours(now, parseISO(ticket.created_at));
    return ageHours > 72 && ageHours <= 168;
  },
  '>7 days': (ticket, now) => differenceInHours(now, parseISO(ticket.created_at)) > 168,
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const entry = payload[0];
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-sm">
        <p className="font-medium text-foreground mb-1">Age Bucket: {label}</p>
        <p style={{ color: entry.color }} className="flex items-center">
          Tickets: {entry.value}
        </p>
      </div>
    );
  }
  return null;
};

const AgingBucketsChart = ({ tickets, onBarClick }: AgingBucketsChartProps) => {
  const now = useMemo(() => new Date(), []);

  const processedData = useMemo(() => {
    if (!tickets || tickets.length === 0) return [];

    const bucketCounts: { [key: string]: { count: number; tickets: Ticket[] } } = {
      '0-24h': { count: 0, tickets: [] },
      '1-3 days': { count: 0, tickets: [] },
      '3-7 days': { count: 0, tickets: [] },
      '>7 days': { count: 0, tickets: [] },
    };

    const openTickets = tickets.filter(t =>
      t.status.toLowerCase() !== 'resolved' && t.status.toLowerCase() !== 'closed'
    );

    openTickets.forEach(ticket => {
      for (const bucket in BUCKET_TICKETS) {
        if (BUCKET_TICKETS[bucket as keyof typeof BUCKET_TICKETS](ticket, now)) {
          bucketCounts[bucket].count++;
          bucketCounts[bucket].tickets.push(ticket);
          break;
        }
      }
    });

    return Object.entries(bucketCounts).map(([bucket, data]) => ({
      name: bucket,
      count: data.count,
      color: BUCKET_COLORS[bucket as keyof typeof BUCKET_COLORS],
      tickets: data.tickets,
    }));
  }, [tickets, now]);

  const handleBarClick = (data: any) => {
    if (onBarClick && data.tickets.length > 0) {
      onBarClick(data.tickets, `Open Tickets: ${data.name} Aging`);
    }
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-200 dark:stroke-gray-700" />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          fontSize={12}
          tick={{ fill: 'hsl(215.4 16.3% 46.9%)' }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          fontSize={12}
          tick={{ fill: 'hsl(215.4 16.3% 46.9%)' }}
          domain={[0, 'auto']}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]} onClick={handleBarClick} className="cursor-pointer">
          {processedData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.color} 
              className={entry.name === '>7 days' ? 'stroke-red-700 dark:stroke-red-300 stroke-2' : ''} // Emphasize critical bucket
            />
          ))}
          <LabelList dataKey="count" position="top" className="text-xs fill-foreground" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default AgingBucketsChart;