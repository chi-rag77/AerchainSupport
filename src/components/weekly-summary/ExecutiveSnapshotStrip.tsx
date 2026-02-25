"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight, ShieldCheck, Zap, AlertCircle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface ExecutiveSnapshotStripProps {
  data: any;
}

const ExecutiveSnapshotStrip = ({ data }: ExecutiveSnapshotStripProps) => {
  const metrics = [
    { label: "Tickets Opened", ...data.snapshot.ticketsOpened, suffix: "" },
    { label: "SLA Breach", ...data.snapshot.slaBreach, suffix: "%" },
    { label: "Escalation Rate", ...data.snapshot.escalationRate, suffix: "%" },
    { label: "Avg Response", ...data.snapshot.avgResponseTime, suffix: "" },
    { label: "Sentiment", ...data.snapshot.sentimentScore, suffix: "/100" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
      {/* Signature Metric: Stability Index */}
      <Card className="lg:col-span-1 relative overflow-hidden border-none bg-indigo-600 text-white shadow-lg rounded-[24px] p-5 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Stability Index</span>
          <ShieldCheck className="h-4 w-4 text-indigo-300" />
        </div>
        <div className="space-y-1">
          <div className="text-4xl font-black tracking-tighter">{data.stabilityIndex.score}%</div>
          <Badge className={cn(
            "border-none font-black text-[9px] uppercase tracking-widest px-2 py-0.5",
            data.stabilityIndex.status === 'Stable' ? "bg-green-400 text-green-900" : "bg-amber-400 text-amber-900"
          )}>
            {data.stabilityIndex.status}
          </Badge>
        </div>
      </Card>

      {/* Snapshot Metrics */}
      {metrics.map((m, i) => (
        <Card key={i} className="border-none bg-white dark:bg-gray-800 shadow-sm rounded-[24px] p-5 flex flex-col justify-between group hover:shadow-md transition-all">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{m.label}</span>
          <div className="space-y-1">
            <div className="text-2xl font-black tracking-tighter text-foreground">
              {m.value}{m.suffix}
            </div>
            <div className={cn(
              "flex items-center text-[10px] font-bold",
              m.trend > 0 ? "text-red-500" : "text-green-500"
            )}>
              {m.trend > 0 ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
              {Math.abs(m.trend)}%
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ExecutiveSnapshotStrip;