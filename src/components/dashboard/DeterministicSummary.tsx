"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket } from '@/features/tickets/types';
import { Brain, Sparkles, ListFilter, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface DeterministicSummaryProps {
  tickets: Ticket[];
  dateRange: { from?: Date; to?: Date };
  onTriggerAI: () => void;
  isGeneratingAI: boolean;
}

const COLOR_MAP: Record<string, string> = {
  'Query': '#6366F1',
  'CS Task': '#8B5CF6',
  'Not Relevant': '#F43F5E',
  'Uncategorized': '#EF4444',
  'Duplicate': '#F59E0B',
  'Bug': '#10B981',
  'Tech Task': '#3B82F6',
  'Requirement': '#14B8A6',
};

const DEFAULT_COLOR = '#94a3b8';

const CustomTreemapContent = (props: any) => {
  const { x, y, width, height, index, name, percent, root } = props;
  
  const color = COLOR_MAP[name] || COLOR_MAP[Object.keys(COLOR_MAP)[index % Object.keys(COLOR_MAP).length]] || DEFAULT_COLOR;

  // Padding for text
  const padding = 8;
  const isLargeEnoughForPercent = height > 60 && width > 80;
  const isLargeEnoughForText = height > 30 && width > 50;

  return (
    <g>
      <defs>
        <linearGradient id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={1} />
          <stop offset="100%" stopColor={color} stopOpacity={0.85} />
        </linearGradient>
      </defs>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={6}
        ry={6}
        style={{
          fill: `url(#gradient-${index})`,
          stroke: '#fff',
          strokeWidth: 1,
          strokeOpacity: 0.1,
        }}
        className="hover:brightness-110 transition-all cursor-pointer"
      />
      {isLargeEnoughForText && (
        <text
          x={x + width / 2}
          y={isLargeEnoughForPercent ? y + height / 2 - 8 : y + height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#fff"
          className="text-[12px] font-semibold uppercase tracking-wider pointer-events-none"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {name}
        </text>
      )}
      {isLargeEnoughForPercent && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 12}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#fff"
          fillOpacity={0.9}
          className="text-[14px] font-medium pointer-events-none"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {percent}%
        </text>
      )}
    </g>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-2xl border border-border/50 backdrop-blur-md">
        <div className="flex items-center gap-2 mb-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: COLOR_MAP[data.name] || DEFAULT_COLOR }} 
          />
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
            {data.name}
          </p>
        </div>
        <div className="space-y-1">
          <div className="flex items-baseline justify-between gap-8">
            <span className="text-sm font-medium text-muted-foreground">Tickets</span>
            <span className="text-lg font-black text-foreground">{data.count}</span>
          </div>
          <div className="flex items-baseline justify-between gap-8">
            <span className="text-sm font-medium text-muted-foreground">Proportion</span>
            <span className="text-sm font-bold text-indigo-600">{data.percent}%</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const DeterministicSummary = ({ tickets, dateRange, onTriggerAI, isGeneratingAI }: DeterministicSummaryProps) => {
  const stats = useMemo(() => {
    const total = tickets.length;
    const resolved = tickets.filter(t => ['resolved', 'closed'].includes(t.status.toLowerCase())).length;
    
    const typeMap: Record<string, number> = {};
    tickets.forEach(t => {
      const type = t.type || 'Uncategorized';
      typeMap[type] = (typeMap[type] || 0) + 1;
    });

    const typeBreakdown = Object.entries(typeMap)
      .map(([name, count]) => ({
        name,
        count,
        size: count,
        percent: total > 0 ? Math.round((count / total) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);

    return { total, resolved, typeBreakdown };
  }, [tickets]);

  const dateLabel = dateRange.from && dateRange.to 
    ? `${format(dateRange.from, 'MMM dd')} - ${format(dateRange.to, 'MMM dd, yyyy')}`
    : "Selected Period";

  return (
    <Card className="relative overflow-hidden rounded-[28px] border-none bg-white dark:bg-gray-800 shadow-glass">
      <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="text-xl font-black flex items-center gap-2">
            <ListFilter className="h-5 w-5 text-indigo-500" />
            Operational Gist
          </CardTitle>
          <p className="text-sm font-medium text-muted-foreground">Deterministic summary for {dateLabel}</p>
        </div>
        
        <Button 
          onClick={onTriggerAI} 
          disabled={isGeneratingAI}
          variant="outline"
          className="rounded-full border-indigo-100 bg-indigo-50/50 text-indigo-600 hover:bg-indigo-100 font-bold gap-2 h-10 px-5"
        >
          {isGeneratingAI ? <Sparkles className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
          Deep AI Analysis
        </Button>
      </CardHeader>

      <CardContent className="p-8 pt-0 space-y-8">
        <div className="p-6 rounded-[20px] bg-gray-50 dark:bg-gray-900/50 border border-border">
          <p className="text-lg font-medium leading-relaxed text-foreground">
            During this period, a total of <span className="font-black text-indigo-600">{stats.total} tickets</span> were received. 
            Out of these, <span className="font-black text-green-600">{stats.resolved} tickets</span> have been successfully resolved, 
            while <span className="font-black text-amber-600">{stats.total - stats.resolved}</span> remain in an active or pending state.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <LayoutGrid className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Ticket Distribution Treemap</h4>
          </div>
          
          <div className="h-[350px] w-full rounded-[24px] overflow-hidden border border-border bg-gray-50/30 dark:bg-gray-900/30 p-1">
            {stats.typeBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <Treemap
                  data={stats.typeBreakdown}
                  dataKey="size"
                  aspectRatio={4 / 3}
                  stroke="#fff"
                  content={<CustomTreemapContent />}
                >
                  <Tooltip content={<CustomTooltip />} />
                </Treemap>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground italic">
                No ticket data found for this period.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeterministicSummary;