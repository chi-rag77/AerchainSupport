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
        <h4 className="text-[10px] font-black uppercase tracking-widest text-white/70">
          Recurrence Trend {title ? `: ${title}` : ''}
        </h4>
      </div>
      
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 25, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fff" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#fff" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              fontSize={10}
              fontWeight="900"
              tick={{ fill: 'rgba(255,255,255,0.8)' }}
              dy={10}
            />
            <YAxis hide />
            <Tooltip 
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-2 rounded-lg shadow-2xl border-none text-[10px] font-black text-indigo-900">
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
              stroke="rgba(255,255,255,0.2)"
              strokeWidth={1}
            >
              <LabelList 
                dataKey="count" 
                position="top" 
                style={{ fontSize: '11px', fontWeight: '900', fill: '#fff' }} 
                offset={10}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RecurrenceTrendChart;