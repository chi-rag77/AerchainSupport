"use client";

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface IssueContributionChartsProps {
  moduleStats: any[];
  severityCounts: any;
}

const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#94A3B8'];
const SEVERITY_COLORS: Record<string, string> = {
  Critical: '#EF4444',
  High: '#F97316',
  Medium: '#F59E0B',
  Low: '#10B981'
};

const IssueContributionCharts = ({ moduleStats, severityCounts }: IssueContributionChartsProps) => {
  const pieData = moduleStats.slice(0, 5).map(m => ({ name: m.name, value: m.total }));
  const barData = Object.entries(severityCounts).map(([name, value]) => ({ name, value }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="border-none shadow-glass rounded-[28px] bg-white dark:bg-gray-800">
        <CardHeader className="p-8 pb-0">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Issue Contribution by Module</CardTitle>
        </CardHeader>
        <CardContent className="p-8 h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="middle" align="right" layout="vertical" />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-none shadow-glass rounded-[28px] bg-white dark:bg-gray-800">
        <CardHeader className="p-8 pb-0">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Issue Severity Distribution</CardTitle>
        </CardHeader>
        <CardContent className="p-8 h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} fontSize={12} fontWeight="bold" />
              <Tooltip cursor={{ fill: 'transparent' }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.name] || '#94A3B8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default IssueContributionCharts;