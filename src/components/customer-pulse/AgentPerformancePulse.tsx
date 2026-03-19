"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { AgentPulse } from '@/features/customer-pulse/types';
import { cn } from '@/lib/utils';
import { Zap, CheckCircle2, AlertCircle, User } from 'lucide-react';

interface AgentPerformancePulseProps {
  agents: AgentPulse[];
}

const AgentPerformancePulse = ({ agents }: AgentPerformancePulseProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 px-1">
        <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
          <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Agent Performance</h3>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {agents.map((agent) => (
          <Card key={agent.name} className="border-none shadow-glass rounded-[28px] bg-white dark:bg-gray-800 overflow-hidden">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-indigo-500/20">
                  {agent.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-base font-black tracking-tight">{agent.name}</h4>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Primary Account Owner</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-0.5">
                  <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Efficiency</span>
                  <p className="text-xl font-black text-indigo-600">{agent.efficiency}%</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Resolved</span>
                  <p className="text-xl font-black">{agent.resolved}</p>
                </div>
              </div>

              <div className="space-y-2.5 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-3 w-3 shrink-0" />
                  <span className="text-[9px] font-black uppercase tracking-widest">{agent.strength}</span>
                </div>
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  <span className="text-[9px] font-black uppercase tracking-widest">{agent.concern}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AgentPerformancePulse;