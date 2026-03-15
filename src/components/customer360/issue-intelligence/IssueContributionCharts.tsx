"use client";

import React, { useMemo } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Tooltip, 
  Label
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, Zap, ChevronRight } from 'lucide-react';

interface IssueContributionChartsProps {
  moduleStats: any[];
  severityCounts: any;
}

const MODULE_COLORS = ['#6366F1', '#8B5CF6', '#F59E0B', '#FB923C', '#10B981', '#94A3B8'];

const SEVERITY_CONFIG: Record<string, { colors: [string, string], icon: any, label: string }> = {
  Critical: { colors: ['#EF4444', '#F87171'], icon: AlertCircle, label: 'Critical' },
  High: { colors: ['#F97316', '#FB923C'], icon: Zap, label: 'High' },
  Medium: { colors: ['#F59E0B', '#FCD34D'], icon: AlertCircle, label: 'Medium' },
  Low: { colors: ['#10B981', '#34D399'], icon: CheckCircle2, label: 'Low' }
};

const IssueContributionCharts = ({ moduleStats, severityCounts }: IssueContributionChartsProps) => {
  
  // --- Data Processing ---
  const totalTickets = useMemo(() => moduleStats.reduce((acc, m) => acc + m.total, 0), [moduleStats]);
  
  const pieData = useMemo(() => moduleStats.slice(0, 5).map((m, i) => ({
    name: m.name,
    value: m.total,
    percent: Math.round((m.total / totalTickets) * 100),
    color: MODULE_COLORS[i % MODULE_COLORS.length]
  })), [moduleStats, totalTickets]);

  const topModule = pieData[0];

  const severityData = useMemo(() => {
    const totalSev = Object.values(severityCounts).reduce((acc: any, v: any) => acc + v, 0) as number;
    return ['Critical', 'High', 'Medium', 'Low'].map(sev => ({
      name: sev,
      value: severityCounts[sev] || 0,
      percent: totalSev > 0 ? Math.round(((severityCounts[sev] || 0) / totalSev) * 100) : 0,
      ...SEVERITY_CONFIG[sev]
    }));
  }, [severityCounts]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* 1. Issue Contribution by Module */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-none shadow-glass rounded-[24px] bg-white dark:bg-gray-800 overflow-hidden flex flex-col h-full">
          <CardHeader className="p-6 pb-0">
            <div className="space-y-1">
              <CardTitle className="text-lg font-black tracking-tight">Issue Contribution by Module</CardTitle>
              <p className="text-xs font-medium text-muted-foreground">Which product areas generate the most support requests</p>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6 flex-grow">
            <div className="flex flex-col sm:flex-row items-center gap-8">
              {/* Donut Chart */}
              <div className="h-[200px] w-[200px] shrink-0 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                      <Label
                        content={({ viewBox: { cx, cy } }: any) => (
                          <g>
                            <text x={cx} y={cy - 5} textAnchor="middle" dominantBaseline="middle" className="fill-foreground font-black text-2xl tracking-tighter">
                              {topModule?.percent}%
                            </text>
                            <text x={cx} y={cy + 15} textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground font-bold text-[10px] uppercase tracking-widest">
                              {topModule?.name}
                            </text>
                          </g>
                        )}
                      />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Ranked List */}
              <div className="flex-1 w-full space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Top Contributing Modules</h4>
                {pieData.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between group cursor-default">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm font-bold text-foreground/80 group-hover:text-indigo-600 transition-colors">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-muted-foreground">{item.value} tickets</span>
                      <Badge variant="outline" className="text-[10px] font-black border-none bg-gray-50 dark:bg-gray-900">{item.percent}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Section */}
            <div className="pt-6 border-t border-gray-100 dark:border-gray-700/50">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-indigo-50/30 dark:bg-indigo-950/10 border border-indigo-100/50">
                <Info className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Summary</h5>
                  <p className="text-xs font-medium leading-relaxed text-foreground/80">
                    The <span className="font-bold text-indigo-600">{topModule?.name} module</span> accounts for <span className="font-bold">{topModule?.percent}%</span> of all support tickets, 
                    making it the primary driver of customer issues. Most requests relate to core workflow stability.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 2. Issue Severity Distribution */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-none shadow-glass rounded-[24px] bg-white dark:bg-gray-800 overflow-hidden flex flex-col h-full">
          <CardHeader className="p-6 pb-0">
            <div className="space-y-1">
              <CardTitle className="text-lg font-black tracking-tight">Issue Severity Distribution</CardTitle>
              <p className="text-xs font-medium text-muted-foreground">Breakdown of ticket criticality levels</p>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6 flex-grow">
            <div className="space-y-5">
              {severityData.map((sev, i) => (
                <div key={sev.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <sev.icon className={cn("h-3.5 w-3.5", sev.name === 'Critical' ? 'text-red-500' : sev.name === 'High' ? 'text-orange-500' : sev.name === 'Medium' ? 'text-amber-500' : 'text-green-500')} />
                      <span className="text-xs font-bold uppercase tracking-widest text-foreground/70">{sev.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black">{sev.value}</span>
                      <span className="text-[10px] font-bold text-muted-foreground">({sev.percent}%)</span>
                    </div>
                  </div>
                  <div className="h-2.5 w-full bg-gray-100 dark:bg-gray-900 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${sev.percent}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: i * 0.1 }}
                      className="h-full rounded-full"
                      style={{ 
                        background: `linear-gradient(90deg, ${sev.colors[0]}, ${sev.colors[1]})` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Section */}
            <div className="pt-6 border-t border-gray-100 dark:border-gray-700/50">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50/30 dark:bg-amber-950/10 border border-amber-100/50">
                <Zap className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-amber-600">Summary</h5>
                  <p className="text-xs font-medium leading-relaxed text-foreground/80">
                    Most support tickets fall under <span className="font-bold text-amber-600">Medium severity</span>, 
                    indicating operational queries rather than critical failures. 
                    <span className="font-bold"> Critical incidents</span> remain low and stable at {severityCounts.Critical || 0} tickets.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

    </div>
  );
};

export default IssueContributionCharts;