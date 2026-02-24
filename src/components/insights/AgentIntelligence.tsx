"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AgentInsight } from '@/features/insights/types';
import { User, Brain, ShieldAlert, Sparkles, ArrowRight, Gauge } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

const AgentIntelligence = ({ insights }: { insights: AgentInsight[] }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
          <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h3 className="text-xl font-black tracking-tight">Agent Performance Intelligence</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insights.map((agent, i) => (
          <Card key={i} className="rounded-[28px] border-none bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
            <CardContent className="p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-black text-indigo-600">
                    {agent.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-lg font-bold">{agent.name}</h4>
                    <Badge className={cn(
                      "text-[10px] font-black uppercase tracking-widest border-none",
                      agent.burnoutRisk === 'high' ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                    )}>
                      Burnout Risk: {agent.burnoutRisk}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Skill Match</span>
                  <div className="text-2xl font-black text-indigo-600">{agent.skillMatch}%</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Complexity Load</span>
                  <span className="text-xs font-bold">{agent.complexityLoad}%</span>
                </div>
                <Progress value={agent.complexityLoad} className="h-1.5" indicatorClassName={agent.complexityLoad > 80 ? "bg-red-500" : "bg-indigo-500"} />
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                  <p className="text-xs font-bold leading-relaxed text-indigo-900 dark:text-indigo-200">
                    {agent.recommendation}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AgentIntelligence;