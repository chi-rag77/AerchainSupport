"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, RefreshCw, Brain, CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface SystemHealthProps {
  aiConfidence: number;
  dataFreshness: string;
  syncIntegrity: string;
}

const SystemHealthPanel = ({ data }: { data: SystemHealthProps }) => {
  return (
    <Card className="border-none bg-gray-100/50 dark:bg-gray-900/50 rounded-[20px] overflow-hidden">
      <CardContent className="p-4 flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">System Live</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">AI Confidence</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black">{data.aiConfidence}%</span>
                <div className="w-16 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500" style={{ width: `${data.aiConfidence}%` }} />
                </div>
              </div>
            </div>

            <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />

            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Data Freshness</span>
              <div className="flex items-center gap-1.5 text-sm font-black">
                <RefreshCw className="h-3 w-3 text-indigo-500" />
                {data.dataFreshness}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-white/20">
          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
          <span className="text-[10px] font-black uppercase tracking-widest">Sync Integrity: {data.syncIntegrity}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemHealthPanel;