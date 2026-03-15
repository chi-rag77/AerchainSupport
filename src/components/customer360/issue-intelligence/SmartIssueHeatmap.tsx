"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowUpRight, ArrowDownRight, Minus, Info, TrendingUp, TrendingDown } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface SmartIssueHeatmapProps {
  timeline: any[];
  moduleStats: any[];
  onInvestigate: (module: string, month: string, count: number) => void;
}

const SmartIssueHeatmap = ({ timeline, moduleStats, onInvestigate }: SmartIssueHeatmapProps) => {
  // Modern SaaS Indigo Scale
  const getIntensityStyle = (count: number, maxInModule: number) => {
    if (count === 0) return "bg-gray-50 dark:bg-gray-900/50 text-muted-foreground/30";
    
    const ratio = count / maxInModule;
    if (ratio > 0.8) return "bg-[#4F46E5] text-white shadow-sm"; // Critical
    if (ratio > 0.5) return "bg-[#818CF8] text-white";           // High
    if (ratio > 0.2) return "bg-[#C7D2FE] text-[#4F46E5]";       // Medium
    return "bg-[#EEF2FF] text-[#4F46E5]";                       // Low
  };

  return (
    <div className="space-y-6">
      {/* Header & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-1">
        <div className="space-y-1">
          <h3 className="text-xl font-black tracking-tight text-foreground">Module Impact Heatmap</h3>
          <p className="text-sm font-medium text-muted-foreground">Customer issue intensity by module (last 6 months)</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-2 px-4 rounded-full border border-border shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mr-2">Impact Level</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-[#EEF2FF] border border-indigo-100" />
              <span className="text-[10px] font-bold">Low</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-[#C7D2FE]" />
              <span className="text-[10px] font-bold">Med</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-[#818CF8]" />
              <span className="text-[10px] font-bold">High</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-[#4F46E5]" />
              <span className="text-[10px] font-bold">Crit</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Compact Grid Table */}
      <div className="overflow-x-auto rounded-[20px] border border-border bg-white dark:bg-gray-800 shadow-glass">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-gray-900/50">
              <th className="p-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-r w-48">Module</th>
              <th className="p-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-r w-32">Trend</th>
              {timeline.map(m => (
                <th key={m.month} className="p-4 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b">
                  {m.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {moduleStats.map(ms => {
              const maxInModule = Math.max(...ms.history, 1);
              const isImproving = ms.trend <= 0;
              const sparklineData = ms.history.map((val: number, i: number) => ({ value: val }));

              return (
                <tr key={ms.name} className="group hover:bg-gray-50/30 dark:hover:bg-gray-900/30 transition-colors">
                  {/* Module Name */}
                  <td className="p-4 border-r bg-gray-50/20 dark:bg-gray-900/20">
                    <span className="text-sm font-bold text-foreground">{ms.name}</span>
                  </td>

                  {/* Trend & Sparkline */}
                  <td className="p-4 border-r">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex items-center font-black text-[10px] uppercase tracking-tighter shrink-0",
                        isImproving ? "text-green-600" : "text-red-600"
                      )}>
                        {isImproving ? <TrendingDown className="h-3 w-3 mr-0.5" /> : <TrendingUp className="h-3 w-3 mr-0.5" />}
                        {Math.abs(ms.trend)}%
                      </div>
                      <div className="h-6 w-16 opacity-60 group-hover:opacity-100 transition-opacity">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={sparklineData}>
                            <Area 
                              type="monotone" 
                              dataKey="value" 
                              stroke={isImproving ? "#16A34A" : "#DC2626"} 
                              fill={isImproving ? "#DCFCE7" : "#FEE2E2"} 
                              strokeWidth={1.5}
                              isAnimationActive={false}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </td>

                  {/* Heatmap Cells */}
                  {timeline.map((m, idx) => {
                    const count = m.modules[ms.name] || 0;
                    const prevCount = timeline[idx - 1]?.modules[ms.name] || 0;
                    const diff = count - prevCount;
                    const percentChange = prevCount > 0 ? Math.round((diff / prevCount) * 100) : 0;
                    
                    return (
                      <td key={`${ms.name}-${m.month}`} className="p-1.5">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div 
                              onClick={() => count > 0 && onInvestigate(ms.name, m.label, count)}
                              className={cn(
                                "h-10 w-full rounded-lg flex items-center justify-center text-xs font-black transition-all hover:scale-[1.05] cursor-pointer",
                                getIntensityStyle(count, maxInModule)
                              )}
                            >
                              {count > 0 ? count : ''}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="p-4 rounded-2xl shadow-2xl border-none bg-white dark:bg-gray-900">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-8">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{ms.name}</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{m.label}</span>
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-baseline justify-between">
                                  <span className="text-lg font-black">{count} tickets</span>
                                  {idx > 0 && (
                                    <span className={cn("text-[10px] font-bold", diff > 0 ? "text-red-500" : "text-green-500")}>
                                      {diff > 0 ? '+' : ''}{percentChange}% vs prev
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                                  <Info className="h-3 w-3" />
                                  Avg Resolution: {ms.avgResolution}h
                                </div>
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SmartIssueHeatmap;