"use client";

import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const DATA = [
  { day: 'Mon', received: 45, closed: 38 },
  { day: 'Tue', received: 52, closed: 48 },
  { day: 'Wed', received: 68, closed: 42 },
  { day: 'Thu', received: 48, closed: 55 },
  { day: 'Fri', received: 38, closed: 45 },
  { day: 'Sat', received: 15, closed: 20 },
  { day: 'Sun', received: 12, closed: 15 },
];

const TicketsReceivedVsClosed = () => {
  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorClosed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
          <XAxis 
            dataKey="day" 
            axisLine={false} 
            tickLine={false} 
            fontSize={10} 
            fontWeight="bold" 
            tick={{ fill: 'hsl(var(--muted-foreground))' }} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            fontSize={10} 
            fontWeight="bold" 
            tick={{ fill: 'hsl(var(--muted-foreground))' }} 
          />
          <Tooltip 
            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
            itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
          />
          <Legend 
            verticalAlign="top" 
            align="right"
            content={({ payload }: any) => (
              <div className="flex justify-end gap-6 mb-8">
                {payload.map((entry: any, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      {entry.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          />
          <Area 
            type="monotone" 
            dataKey="received" 
            name="Tickets Received"
            stroke="#6366F1" 
            strokeWidth={3} 
            fillOpacity={1} 
            fill="url(#colorReceived)" 
            dot={{ r: 4, strokeWidth: 0, fill: '#6366F1' }}
          />
          <Area 
            type="monotone" 
            dataKey="closed" 
            name="Tickets Closed"
            stroke="#10B981" 
            strokeWidth={3} 
            fillOpacity={1} 
            fill="url(#colorClosed)" 
            dot={{ r: 4, strokeWidth: 0, fill: '#10B981' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TicketsReceivedVsClosed;