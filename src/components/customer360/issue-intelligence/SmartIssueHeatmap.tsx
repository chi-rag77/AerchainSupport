"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, TrendingUp, TrendingDown } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SmartIssueHeatmapProps {
  timeline: any[];
  moduleStats: any[];
  onInvestigate: (module: string, month: string, count: number) => void;
}

const SmartIssueHeatmap = ({ timeline, moduleStats, onInvestigate }: SmartIssueHeatmapProps) => {
  
  // Modern SaaS Severity Scale (RAG)
  const getIntensityStyle = (count: number, maxInModule: number) => {
    if (count === 0) return "bg-gray-50 dark:bg-gray-900/50 text-muted-foreground/20";
    
    const ratio = count / maxInModule;
    
    // Critical (Red)
    if (ratio > 0.75) return "bg-[#FEE2E2] text-[#B91C1C] border-[#FECACA]/30 shadow-sm"; 
    // High (Orange)
    if (ratio > 0.5) return "bg-[#FFE4CC] text-[#C2410C] border-[#FED7AA]/30";           
    // Medium (Amber)
    if (ratio > 0.25) return "bg-[#FFF4E5] text-[#B45309] border-[#FDE68A]/30";       
    // Low (Green)
    return "bg-[#EAF7EE] text-[#15803D] border-[#DCFCE7]/30";                       
  };

  const legendItems = [
    { label: "Low", color: "bg-[#15803D]", bg: "bg-[#EAF7EE]" },
    { label: "Medium", color: "bg-[#B45309]", bg: "bg-[#FFF4E5]" },
    { label: "High", color: "bg-[#C2410C]", bg: "bg-[#FFE4CC]" },
    { label: "Critical", color: "bg-[#B91C1C]", bg: "bg-[#FEE2E2]" },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-1">
        <div className="space-y-1">
          <h3 className="text-xl font-black tracking-tight text-foreground">Module Impact Heatmap</h3>
          <p className="text-sm font-medium text-muted-foreground">Customer issue intensity by module (last 6 months)</p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mr-2">Impact Level</span>
          <div className="flex items-center gap-2">
            {legendItems.map((item) => (
              <div 
                key={item.label} 
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border/50 shadow-sm text-[10px] font-bold transition-all",
                  item.bg
                )}
              >
                <div className={cn("h-1.5 w-1.5 rounded-full", item.color)} />
                <span className="text-foreground/80">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Compact Grid Table with Scroll Area */}
      <div className="rounded-[20px] border border-border bg-white dark:bg-gray-800 shadow-glass overflow-hidden">
        <ScrollArea className="h-[520px] w-full">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-20 bg-gray-50 dark:bg-gray-900 shadow-sm">
              <tr>
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
                const sparklineData = ms.history.map((val: number) => ({ value: val }));

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
                        <div className="h-6 w-16 opacity-40 group-hover:opacity-100 transition-opacity">
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
                                  "h-9 w-full rounded-lg flex items-center justify-center text-xs font-black transition-all hover:scale-[1.05] cursor-pointer border border-transparent",
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
        </ScrollArea>
      </div>
    </div>
  );
};

export default SmartIssueHeatmap;