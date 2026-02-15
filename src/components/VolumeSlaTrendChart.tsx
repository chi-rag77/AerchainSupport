"use client";

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceArea, Dot } from 'recharts';
import { format, parseISO } from 'date-fns';
import { TrendPoint } from '@/features/dashboard-trend/types';
import { Loader2 } from 'lucide-react';

interface VolumeSlaTrendChartProps {
  trendData: TrendPoint[];
  isLoading: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 text-sm">
        <p className="font-bold text-muted-foreground mb-2">{format(parseISO(label), 'MMM dd, yyyy')}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 py-1">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="font-medium">{entry.name === 'ticketsCreated' ? 'Tickets' : 'SLA'}</span>
            </div>
            <span className="font-bold">{entry.name === 'slaCompliance' ? `${entry.value.toFixed(1)}%` : entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const VolumeSlaTrendChart = ({ trendData, isLoading }: VolumeSlaTrendChartProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Calculate average volume for spike detection
  const avgVol = trendData.reduce((a, b) => a + b.ticketsCreated, 0) / trendData.length;

  const CustomizedDot = (props: any) => {
    const { cx, cy, value, payload } = props;
    if (payload.ticketsCreated > avgVol * 1.5) {
      return (
        <svg x={cx - 6} y={cy - 6} width={12} height={12} fill="red" viewBox="0 0 1024 1024">
          <circle cx="512" cy="512" r="512" fill="#EF4444" />
          <circle cx="512" cy="512" r="300" fill="white" />
        </svg>
      );
    }
    return <Dot {...props} />;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <defs>
          <linearGradient id="slaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#EF4444" stopOpacity={0.1}/>
            <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
          </linearGradient>
        </defs>
        
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
        
        <XAxis
          dataKey="date"
          tickFormatter={(tick) => format(parseISO(tick), 'MMM dd')}
          axisLine={false}
          tickLine={false}
          fontSize={12}
          tick={{ fill: '#64748B' }}
          dy={10}
        />
        
        <YAxis
          yAxisId="left"
          axisLine={false}
          tickLine={false}
          fontSize={12}
          tick={{ fill: '#64748B' }}
          domain={[0, 'auto']}
        />
        
        <YAxis
          yAxisId="right"
          orientation="right"
          axisLine={false}
          tickLine={false}
          fontSize={12}
          tick={{ fill: '#64748B' }}
          domain={[0, 100]}
        />

        <Tooltip content={<CustomTooltip />} />
        
        {/* Highlight Critical SLA Zone (< 80%) */}
        <ReferenceArea yAxisId="right" y1={0} y2={80} fill="url(#slaGradient)" />

        <Line
          yAxisId="left"
          type="monotone"
          dataKey="ticketsCreated"
          stroke="#3B82F6"
          strokeWidth={3}
          dot={<CustomizedDot />}
          activeDot={{ r: 8, strokeWidth: 0 }}
          name="ticketsCreated"
          animationDuration={1500}
        />
        
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="slaCompliance"
          stroke="#10B981"
          strokeWidth={3}
          dot={{ r: 4, fill: "#10B981", strokeWidth: 2, stroke: "#fff" }}
          activeDot={{ r: 8, strokeWidth: 0 }}
          name="slaCompliance"
          animationDuration={1500}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default VolumeSlaTrendChart;