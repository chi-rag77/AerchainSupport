"use client";

import React from 'react';
import { Card } from "@/components/ui/card";
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface IssueHeatmapProps {
  timeline: any[];
  modules: string[];
}

const IssueHeatmap = ({ timeline, modules }: IssueHeatmapProps) => {
  const getIntensityClass = (count: number) => {
    if (count === 0) return "bg-gray-50 dark:bg-gray-900 opacity-20";
    if (count < 3) return "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600";
    if (count < 6) return "bg-indigo-300 dark:bg-indigo-700 text-white";
    return "bg-indigo-600 text-white";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Issue Distribution Heatmap</h4>
      </div>
      
      <div className="overflow-x-auto rounded-2xl border border-border bg-white dark:bg-gray-800 shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-r w-32">Module</th>
              {timeline.map(m => (
                <th key={m.month} className="p-4 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b">
                  {m.label.split(' ')[0]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {modules.map(module => (
              <tr key={module}>
                <td className="p-4 text-xs font-bold border-r border-b bg-gray-50/30 dark:bg-gray-900/30">{module}</td>
                {timeline.map(m => {
                  const count = m.modules[module] || 0;
                  return (
                    <td key={`${module}-${m.month}`} className="p-1 border-b">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className={cn(
                            "h-10 w-full rounded-lg flex items-center justify-center text-xs font-black transition-all hover:scale-105 cursor-default",
                            getIntensityClass(count)
                          )}>
                            {count > 0 ? count : ''}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-bold">{count} {module} tickets in {m.label}</p>
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

export default IssueHeatmap;