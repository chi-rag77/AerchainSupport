"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface SmartIssueHeatmapProps {
  timeline: any[];
  moduleStats: any[];
  onInvestigate: (module: string, month: string, count: number) => void;
}

const SmartIssueHeatmap = ({ timeline, moduleStats, onInvestigate }: SmartIssueHeatmapProps) => {
  const getIntensityClass = (count: number, totalForModule: number) => {
    if (count === 0) return "bg-gray-50 dark:bg-gray-900 opacity-20";
    const ratio = count / totalForModule;
    if (ratio > 0.4) return "bg-red-500 text-white";
    if (ratio > 0.2) return "bg-amber-500 text-white";
    return "bg-green-500 text-white";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Module Impact Heatmap</h4>
      </div>
      
      <div className="overflow-x-auto rounded-[24px] border border-border bg-white dark:bg-gray-800 shadow-glass">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-6 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-r w-40">Module</th>
              {timeline.map(m => (
                <th key={m.month} className="p-6 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b">
                  {m.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {moduleStats.map(ms => (
              <tr key={ms.name} className="group">
                <td className="p-6 border-r border-b bg-gray-50/30 dark:bg-gray-900/30">
                  <div className="space-y-1">
                    <p className="text-sm font-black">{ms.name}</p>
                    <div className={cn(
                      "flex items-center gap-1 text-[10px] font-bold uppercase",
                      ms.trend > 0 ? "text-red-600" : "text-green-600"
                    )}>
                      {ms.trend > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {ms.trend > 0 ? 'Worsening' : 'Improving'}
                    </div>
                  </div>
                </td>
                {timeline.map((m, idx) => {
                  const count = m.modules[ms.name] || 0;
                  const prevCount = timeline[idx - 1]?.modules[ms.name] || 0;
                  const diff = count - prevCount;
                  
                  return (
                    <td key={`${ms.name}-${m.month}`} className="p-2 border-b">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div 
                            onClick={() => count > 0 && onInvestigate(ms.name, m.label, count)}
                            className={cn(
                              "h-16 w-full rounded-2xl flex flex-col items-center justify-center transition-all hover:scale-[1.02] cursor-pointer shadow-sm",
                              getIntensityClass(count, ms.total)
                            )}
                          >
                            <span className="text-lg font-black">{count}</span>
                            {idx > 0 && count > 0 && (
                              <div className="flex items-center gap-0.5 text-[9px] font-bold opacity-80">
                                {diff > 0 ? <ArrowUpRight className="h-2.5 w-2.5" /> : diff < 0 ? <ArrowDownRight className="h-2.5 w-2.5" /> : <Minus className="h-2.5 w-2.5" />}
                                {diff !== 0 && `${Math.abs(Math.round((diff / (prevCount || 1)) * 100))}%`}
                              </div>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="p-3 rounded-xl shadow-2xl border-none">
                          <p className="font-bold">{count} {ms.name} tickets</p>
                          <p className="text-[10px] opacity-70">Click to investigate top issues</p>
                        </TooltipContent>
                      </Tooltip>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SmartIssueHeatmap;