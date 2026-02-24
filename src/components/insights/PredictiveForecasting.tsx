"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ForecastPoint } from '@/features/insights/types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format, parseISO } from 'date-fns';
import { Brain, TrendingUp, Sparkles, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const PredictiveForecasting = ({ points, recommendation }: { points: ForecastPoint[], recommendation: string }) => {
  return (
    <Card className="rounded-[32px] border-none bg-white dark:bg-gray-800 shadow-glass overflow-hidden">
      <CardHeader className="p-8 pb-0 flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="text-xl font-black flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-500" />
            Predictive Ticket Forecasting
          </CardTitle>
          <p className="text-sm font-medium text-muted-foreground">Next 7-day volume projection (Prophet Model)</p>
        </div>
        <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/30">
          <Brain className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        </div>
      </CardHeader>

      <CardContent className="p-8 space-y-8">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points}>
              <defs>
                <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-100 dark:stroke-gray-700" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(str) => format(parseISO(str), 'MMM dd')}
                axisLine={false}
                tickLine={false}
                fontSize={10}
                fontFamily="inherit"
                fontWeight="bold"
              />
              <YAxis axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              />
              <Area 
                type="monotone" 
                dataKey="predicted" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorPred)" 
              />
              <Area 
                type="monotone" 
                dataKey="actual" 
                stroke="#10b981" 
                strokeWidth={3}
                fill="transparent"
              />
              <ReferenceLine x={points[7]?.date} stroke="#6366f1" strokeDasharray="3 3" label={{ position: 'top', value: 'Today', fontSize: 10, fontWeight: 'bold' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="p-6 rounded-[24px] bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-xl bg-white dark:bg-gray-800 shadow-sm">
              <Users className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-black uppercase tracking-widest text-indigo-600">Staffing Recommendation</h4>
              <p className="text-sm font-bold leading-relaxed text-indigo-900 dark:text-indigo-200">
                {recommendation}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PredictiveForecasting;