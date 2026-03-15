"use client";

import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, ReferenceLine, Dot
} from 'recharts';
import { format, parseISO } from 'date-fns';

interface ImpactTimelineChartProps {
  data: any[];
  onMonthSelect: (month: any) => void;
  selectedMonth: string | null;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isPositive = data.impactScore > 0;
    const isNegative = data.impactScore < 0;

    return (
      <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-2xl border border-border/50 backdrop-blur-md">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">{data.label}</p>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-8">
            <span className="text-sm font-bold">Impact Score</span>
            <span className={`text-lg font-black ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-amber-600'}`}>
              {data.impactScore > 0 ? '+' : ''}{data.impactScore}
            </span>
          </div>
          <div className="flex items-center justify-between gap-8">
            <span className="text-xs text-muted-foreground">Total Tickets</span>
            <span className="text-xs font-bold">{data.tickets}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const ImpactTimelineChart = ({ data, onMonthSelect, selectedMonth }: ImpactTimelineChartProps) => {
  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="impactGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
          <XAxis 
            dataKey="label" 
            axisLine={false}
            tickLine={false}
            fontSize={10}
            fontFamily="Inter"
            fontWeight="bold"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            fontSize={10}
            fontFamily="Inter"
            fontWeight="bold"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={2} />
          <Area
            type="monotone"
            dataKey="impactScore"
            stroke="#6366F1"
            strokeWidth={4}
            fillOpacity={1}
            fill="url(#impactGradient)"
            activeDot={{ 
              r: 8, 
              strokeWidth: 0, 
              fill: '#6366F1',
              onClick: (e: any, payload: any) => onMonthSelect(payload.payload)
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ImpactTimelineChart;