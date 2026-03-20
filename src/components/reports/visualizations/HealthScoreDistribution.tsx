"use client";

import React from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  Tooltip, Legend, Label
} from 'recharts';
import { motion } from 'framer-motion';

const DATA = [
  { name: 'Healthy', value: 45, color: '#10B981' },
  { name: 'Stable', value: 30, color: '#6366F1' },
  { name: 'Watchlist', value: 15, color: '#F59E0B' },
  { name: 'At Risk', value: 10, color: '#EF4444' },
];

const HealthScoreDistribution = () => {
  return (
    <div className="h-[400px] w-full flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={DATA}
            cx="50%"
            cy="50%"
            innerRadius={100}
            outerRadius={140}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {DATA.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
            <Label
              content={({ viewBox: { cx, cy } }: any) => (
                <g>
                  <text x={cx} y={cy - 10} textAnchor="middle" dominantBaseline="middle" className="fill-foreground font-black text-4xl tracking-tighter">
                    84%
                  </text>
                  <text x={cx} y={cy + 20} textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground font-bold text-[10px] uppercase tracking-widest">
                    Avg Health
                  </text>
                </g>
              )}
            />
          </Pie>
          <Tooltip 
            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
            itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            content={({ payload }: any) => (
              <div className="flex justify-center gap-8 mt-8">
                {payload.map((entry: any, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      {entry.value}: {DATA[index].value}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HealthScoreDistribution;