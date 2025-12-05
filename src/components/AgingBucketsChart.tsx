"use client";

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Cell } from 'recharts';
import { Ticket } from '@/types';
import { differenceInHours, parseISO } from 'date-fns';

interface AgingBucketsChartProps {
  tickets: Ticket[];
}

const BUCKET_COLORS = [
  "hsl(120 60% 70%)", // Green (0-24h)
  "hsl(48 100% 70%)", // Yellow (1-3 days)
  "hsl(28 100% 70%)", // Orange (3-7 days)
  "hsl(10 80% 70%)",  // Red (>7 days)
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const entry = payload[0];
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-sm">
        <p className="font-medium text-foreground mb-1">Age Bucket: {label}</p>
        <p style={{ color: entry.color }} className="flex items-center">
          <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
          Tickets: {entry.value}
        </p>
      </div>
    );
  }
  return null;
};

const AgingBucketsChart = ({ tickets }: AgingBucketsChartProps) => {
  const processedData = useMemo(() => {
    if (!tickets || tickets.length === 0) return [];

    const now = new Date();
    const bucketCounts: { [key: string]: number } = {
      '0-24h': 0,
      '1-3 days': 0,
      '3-7 days': 0,
      '>7 days': 0,
    };

    tickets.forEach(ticket => {
      const statusLower = ticket.status.toLowerCase();
      if (statusLower === 'resolved' || statusLower === 'closed') {
        return; // Only consider open/active tickets
      }

      const createdAt = parseISO(ticket.created_at);
      const ageHours = differenceInHours(now, createdAt);

      if (ageHours <= 24) {
        bucketCounts['0-24h']++;
      } else if (ageHours <= 72) { // 3 days * 24 hours
        bucketCounts['1-3 days']++;
      } else if (ageHours <= 168) { // 7 days * 24 hours
        bucketCounts['3-7 days']++;
      } else {
        bucketCounts['>7 days']++;
      }
    });

    return Object.entries(bucketCounts).map(([bucket, count], index) => ({
      name: bucket,
      count,
      color: BUCKET_COLORS[index % BUCKET_COLORS.length],
    }));
  }, [tickets]);

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
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {processedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
          <LabelList dataKey="count" position="top" className="text-xs fill-foreground" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default AgingBucketsChart;