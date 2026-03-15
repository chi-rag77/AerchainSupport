"use client";

import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, LabelList
} from 'recharts';

interface RecurrenceTrendChartProps {
  data: { month: string; count: number }[];
  title: string;
}

const RecurrenceTrendChart = ({ data, title }: RecurrenceTrendChartProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Recurrence Trend: {title}</h4>
      </div>
      
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366F1" stopOpacity={1} />
                <stop offset="100%" stopColor="#6366F1" stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              fontSize={10}
              fontWeight="bold"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis hide />
            <Tooltip 
              cursor={{ fill: 'transparent' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white dark:bg-gray-900 p-2 rounded-lg shadow-xl border border-border text-[10px] font-black">
                      {payload[0].value} Tickets
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar 
              dataKey="count" 
              fill="url(#barGradient)" 
              radius={[6, 6, 0, 0]}
              barSize={32}
            >
              <LabelList 
                dataKey="count" 
                position="top" 
                style={{ fontSize: '10px', fontWeight: '900', fill: 'hsl(var(--foreground))' }} 
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RecurrenceTrendChart;