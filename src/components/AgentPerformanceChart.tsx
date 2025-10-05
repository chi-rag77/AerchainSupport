"use client";

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LabelList, Cell } from 'recharts';
import { Ticket } from '@/types';
import { cn } from '@/lib/utils';

interface AgentPerformanceChartProps {
  tickets: Ticket[];
}

const BAR_COLORS_CREATED = "hsl(28 100% 70%)"; // Orange
const BAR_COLORS_RESOLVED = "hsl(120 60% 70%)"; // Green

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-sm">
        <p className="font-medium text-foreground mb-1">Agent: {label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="flex items-center">
            <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
            {entry.name === 'created' ? 'Assigned' : 'Resolved'}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const CustomAgentLegend = ({ payload }: any) => {
  return (
    <ul className="flex justify-center space-x-6 text-sm mt-4 text-gray-600 dark:text-gray-400">
      {payload.map((entry: any, index: number) => (
        <li key={`item-${index}`} className="flex items-center space-x-2">
          <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
          <span>{entry.value === 'created' ? 'Assigned' : 'Resolved'}</span>
        </li>
      ))}
    </ul>
  );
};

const AgentPerformanceChart = ({ tickets }: AgentPerformanceChartProps) => {
  const processedData = useMemo(() => {
    if (!tickets || tickets.length === 0) return [];

    const agentDataMap = new Map<string, { name: string; created: number; resolved: number; }>();

    tickets.forEach(ticket => {
      const assignee = ticket.assignee || 'Unassigned';
      if (!agentDataMap.has(assignee)) {
        agentDataMap.set(assignee, { name: assignee, created: 0, resolved: 0 });
      }
      const agentEntry = agentDataMap.get(assignee)!;
      agentEntry.created++; // Count as assigned

      const statusLower = ticket.status.toLowerCase();
      if (statusLower === 'resolved' || statusLower === 'closed') {
        agentEntry.resolved++;
      }
    });

    return Array.from(agentDataMap.values()).sort((a, b) => (b.created + b.resolved) - (a.created + a.resolved)); // Sort by total activity
  }, [tickets]);

  return (
    <div className="relative w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            fontSize={12}
            tick={{ fill: 'hsl(215.4 16.3% 46.9%)' }}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={60}
            tickFormatter={(value) => value.length > 10 ? `${value.substring(0, 8)}...` : value}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            fontSize={12}
            tick={{ fill: 'hsl(215.4 16.3% 46.9%)' }}
            domain={[0, 'auto']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomAgentLegend />} />
          <Bar dataKey="created" fill={BAR_COLORS_CREATED} name="Assigned" radius={[4, 4, 0, 0]}>
            <LabelList dataKey="created" position="top" className="text-xs fill-foreground" />
          </Bar>
          <Bar dataKey="resolved" fill={BAR_COLORS_RESOLVED} name="Resolved" radius={[4, 4, 0, 0]}>
            <LabelList dataKey="resolved" position="top" className="text-xs fill-foreground" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AgentPerformanceChart;