"use client";

import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';

const DATA = [
  { customer: 'Danone', breaches: 12, color: '#EF4444' },
  { customer: 'Unilever', breaches: 8, color: '#F59E0B' },
  { customer: 'Nestle', breaches: 15, color: '#EF4444' },
  { customer: 'PepsiCo', breaches: 5, color: '#F59E0B' },
  { customer: 'Coca-Cola', breaches: 3, color: '#10B981' },
];

const SlaBreachReport = () => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-3 gap-6">
        <div className="p-6 rounded-[24px] bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/50 space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-rose-600">Total Breaches</p>
          <p className="text-3xl font-black tracking-tighter text-rose-700 dark:text-rose-400">43</p>
        </div>
        <div className="p-6 rounded-[24px] bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">At Risk (Next 4h)</p>
          <p className="text-3xl font-black tracking-tighter text-amber-700 dark:text-amber-400">18</p>
        </div>
        <div className="p-6 rounded-[24px] bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Compliance Rate</p>
          <p className="text-3xl font-black tracking-tighter text-indigo-700 dark:text-indigo-400">82%</p>
        </div>
      </div>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={DATA} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} strokeOpacity={0.1} />
            <XAxis type="number" axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" />
            <YAxis 
              dataKey="customer" 
              type="category" 
              axisLine={false} 
              tickLine={false} 
              fontSize={11} 
              fontWeight="bold" 
              width={80}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(0,0,0,0.05)' }}
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
            />
            <Bar dataKey="breaches" radius={[0, 8, 8, 0]} barSize={32}>
              {DATA.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SlaBreachReport;