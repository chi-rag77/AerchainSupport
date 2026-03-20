"use client";

import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const DATA = [
  { customer: 'Danone', completed: 85, pending: 15 },
  { customer: 'Unilever', completed: 60, pending: 40 },
  { customer: 'Nestle', completed: 95, pending: 5 },
  { customer: 'PepsiCo', completed: 40, pending: 60 },
  { customer: 'Coca-Cola', completed: 75, pending: 25 },
];

const ImplementationStatusReport = () => {
  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={DATA} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
          <XAxis 
            dataKey="customer" 
            axisLine={false} 
            tickLine={false} 
            fontSize={11} 
            fontWeight="bold" 
            tick={{ fill: 'hsl(var(--muted-foreground))' }} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            fontSize={10} 
            fontWeight="bold" 
            tick={{ fill: 'hsl(var(--muted-foreground))' }} 
            unit="%"
          />
          <Tooltip 
            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
          />
          <Legend verticalAlign="top" align="right" />
          <Bar dataKey="completed" name="Completed" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} barSize={40} />
          <Bar dataKey="pending" name="Pending" stackId="a" fill="#E5E7EB" radius={[8, 8, 0, 0]} barSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ImplementationStatusReport;