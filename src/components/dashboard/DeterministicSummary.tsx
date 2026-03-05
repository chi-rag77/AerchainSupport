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

const COLORS = [
  '#4f46e5', // Indigo 600
  '#7c3aed', // Violet 600
  '#db2777', // Pink 600
  '#e11d48', // Rose 600
  '#d97706', // Amber 600
  '#059669', // Emerald 600
  '#2563eb', // Blue 600
  '#0891b2', // Cyan 600
];

const CustomTreemapContent = (props: any) => {
  const { x, y, width, height, index, name, percent } = props;

  // Only show text if the box is large enough
  const showText = width > 60 && height > 40;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: COLORS[index % COLORS.length],
          stroke: '#fff',
          strokeWidth: 2,
          strokeOpacity: 0.3,
        }}
        className="hover:opacity-90 transition-opacity cursor-pointer"
      />
      {showText && (
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#fff"
          className="text-xs font-black uppercase tracking-tight pointer-events-none"
          style={{ 
            textShadow: '0px 1px 2px rgba(0,0,0,0.5)',
            filter: 'drop-shadow(0px 1px 1px rgba(0,0,0,0.3))'
          }}
        >
          {name} ({percent}%)
        </text>
      )}
    </g>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-900 p-3 rounded-xl shadow-xl border border-border">
        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">{data.name}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-black">{data.count}</span>
          <span className="text-xs font-bold text-indigo-600">{data.percent}% of total</span>
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
          
          <div className="h-[300px] w-full rounded-[24px] overflow-hidden border border-border bg-gray-50/30 dark:bg-gray-900/30">
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