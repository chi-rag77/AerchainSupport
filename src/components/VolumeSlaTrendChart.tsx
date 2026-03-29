"use client";

import React, { useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, Defs, LinearGradient, Stop 
} from 'recharts';
import { format, parseISO, startOfDay, eachDayOfInterval, isWithinInterval } from 'date-fns';
import { Ticket } from '@/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface VolumeSlaTrendChartProps {
  tickets: Ticket[];
  startDate: Date;
  endDate: Date;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const ticketsCreated = payload.find((p: any) => p.dataKey === 'created')?.value || 0;
    const slaCompliance = payload.find((p: any) => p.dataKey === 'slaCompliance')?.value || 0;

    return (
      <div className="bg-white/90 dark:bg-gray-950/90 p-4 rounded-[20px] shadow-2xl border border-border/50 backdrop-blur-md min-w-[220px] animate-in fade-in zoom-in-95 duration-200">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-3">
          {format(parseISO(label), 'MMM dd, yyyy')}
        </p>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#F59E0B] shadow-sm" />
              <span className="text-xs font-bold text-foreground/80">Tickets Created</span>
            </div>
            <span className="text-sm font-black text-foreground">{ticketsCreated}</span>
          </div>

          <div className="flex items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#6366F1] shadow-sm" />
              <span className="text-xs font-bold text-foreground/80">SLA Compliance</span>
            </div>
            <Badge 
              variant="secondary" 
              className={cn(
                "font-black text-[10px] border-none",
                slaCompliance >= 90 ? "bg-emerald-50 text-emerald-700" : 
                slaCompliance >= 75 ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"
              )}
            >
              {slaCompliance.toFixed(1)}%
            </Badge>
          </div>
        </div>
        
        <Separator className="my-3 opacity-50" />
        
        <p className="text-[9px] font-medium text-muted-foreground italic">
          {slaCompliance < 80 ? "⚠️ Performance below target threshold" : "✅ Operations within healthy range"}
        </p>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex justify-center gap-8 mt-4">
      {payload.map((entry: any, index: number) => (
        <div key={`item-${index}`} className="flex items-center gap-2 group cursor-default">
          <div 
            className="w-2.5 h-2.5 rounded-full shadow-sm transition-transform group-hover:scale-125" 
            style={{ backgroundColor: entry.color }} 
          />
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
            {entry.value === 'created' ? 'Tickets Created' : 'SLA Compliance %'}
          </span>
        </div>
      ))}
    </div>
  );
};

const VolumeSlaTrendChart = ({ tickets, startDate, endDate }: VolumeSlaTrendChartProps) => {
  const processedData = useMemo(() => {
    if (!tickets || tickets.length === 0 || !startDate || !endDate) return [];

    const intervalDays = eachDayOfInterval({ start: startDate, end: endDate });
    const dataMap = new Map<string, { date: string; created: number; slaMetCount: number; slaTotalCount: number; slaCompliance: number }>();

    intervalDays.forEach(day => {
      const formattedDate = format(day, 'yyyy-MM-dd');
      dataMap.set(formattedDate, { date: formattedDate, created: 0, slaMetCount: 0, slaTotalCount: 0, slaCompliance: 0 });
    });

    tickets.forEach(ticket => {
      const createdAt = startOfDay(parseISO(ticket.created_at));
      const formattedCreatedAt = format(createdAt, 'yyyy-MM-dd');

      if (isWithinInterval(createdAt, { start: startDate, end: endDate }) && dataMap.has(formattedCreatedAt)) {
        const entry = dataMap.get(formattedCreatedAt)!;
        entry.created++;

        if (ticket.due_by && (ticket.status.toLowerCase() === 'resolved' || ticket.status.toLowerCase() === 'closed')) {
          const resolvedAt = parseISO(ticket.updated_at);
          const dueBy = parseISO(ticket.due_by);
          
          entry.slaTotalCount++;
          if (resolvedAt <= dueBy) {
            entry.slaMetCount++;
          }
        }
      }
    });

    Array.from(dataMap.values()).forEach(entry => {
      if (entry.slaTotalCount > 0) {
        entry.slaCompliance = (entry.slaMetCount / entry.slaTotalCount) * 100;
      } else {
        entry.slaCompliance = 100; 
      }
    });

    return Array.from(dataMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [tickets, startDate, endDate]);

  return (
    <div className="w-full h-full flex flex-col">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={processedData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorSla" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={false} 
            stroke="currentColor" 
            className="text-gray-100 dark:text-gray-800" 
          />
          
          <XAxis
            dataKey="date"
            tickFormatter={(tick) => format(parseISO(tick), 'MMM dd')}
            axisLine={false}
            tickLine={false}
            fontSize={10}
            fontWeight="bold"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          
          <YAxis
            yAxisId="left"
            axisLine={false}
            tickLine={false}
            fontSize={10}
            fontWeight="bold"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            domain={[0, 'auto']}
            width={40}
          />
          
          <YAxis
            yAxisId="right"
            orientation="right"
            axisLine={false}
            tickLine={false}
            fontSize={10}
            fontWeight="bold"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            domain={[0, 100]}
            tickFormatter={(val) => `${val}%`}
            width={40}
          />
          
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1, strokeDasharray: '4 4' }}
          />
          
          <Legend content={<CustomLegend />} />
          
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="created"
            name="created"
            stroke="#F59E0B"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorCreated)"
            dot={{ r: 4, fill: '#F59E0B', strokeWidth: 0 }}
            activeDot={{ r: 6, strokeWidth: 0, fill: '#F59E0B' }}
          />
          
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="slaCompliance"
            name="sla"
            stroke="#6366F1"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorSla)"
            dot={{ r: 4, fill: '#6366F1', strokeWidth: 0 }}
            activeDot={{ r: 6, strokeWidth: 0, fill: '#6366F1' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VolumeSlaTrendChart;