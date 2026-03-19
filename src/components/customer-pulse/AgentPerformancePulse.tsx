"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { 
  User, Users, Zap, Clock, ShieldAlert, 
  CheckCircle2, AlertCircle, TrendingUp, 
  Sparkles, ArrowRight, BarChart3
} from 'lucide-react';
import { AgentPerformance, TeamMember } from '@/features/customer-pulse/types';
import { Progress } from '@/components/ui/progress';

interface AgentPerformancePulseProps {
  primary: AgentPerformance;
  team: TeamMember[];
  insights: string[];
  recommendations: string[];
}

const AgentPerformancePulse = ({ primary, team, insights, recommendations }: AgentPerformancePulseProps) => {
  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'Strong': return "text-green-600 bg-green-50 border-green-100";
      case 'Attention': return "text-amber-600 bg-amber-50 border-amber-100";
      case 'Risk': return "text-rose-600 bg-rose-50 border-rose-100";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 px-2">
        <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
          <User className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-xl font-black tracking-tight">Agent Performance Pulse</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: Primary Agent Hero (60%) */}
        <Card className="lg:col-span-7 border-none shadow-glass rounded-[32px] bg-white dark:bg-gray-900 overflow-hidden flex flex-col">
          <CardHeader className="p-8 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-2xl font-black text-indigo-600 shadow-inner">
                  {primary.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-2xl font-black tracking-tight">{primary.name}</CardTitle>
                    <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-none font-bold text-[10px] uppercase tracking-widest">Primary Agent</Badge>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Driving outcomes for this account</p>
                </div>
              </div>
              <Badge className={cn("px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px] border-2", getSignalColor(primary.signal))}>
                Signal: {primary.signal}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-8 pt-6 space-y-8 flex-1">
            {/* Metrics Row */}
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Efficiency</span>
                <p className="text-3xl font-black tracking-tighter text-indigo-600">{primary.efficiency}%</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Avg Speed</span>
                <p className="text-3xl font-black tracking-tighter">{primary.avg_time}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">SLA Met</span>
                <p className="text-3xl font-black tracking-tighter text-green-600">{primary.sla}%</p>
              </div>
            </div>

            {/* Strength & Concern */}
            <div className="grid grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/50 space-y-2">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Strength</span>
                </div>
                <p className="text-sm font-bold text-green-900 dark:text-green-200">{primary.strength}</p>
              </div>
              <div className="p-5 rounded-2xl bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/50 space-y-2">
                <div className="flex items-center gap-2 text-rose-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Concern</span>
                </div>
                <p className="text-sm font-bold text-rose-900 dark:text-rose-200">{primary.concern}</p>
              </div>
            </div>

            {/* AI Narrative */}
            <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                <span className="text-[10px] font-black uppercase tracking-widest">Performance Intelligence</span>
              </div>
              <div className="space-y-2">
                {insights.map((insight, i) => (
                  <p key={i} className="text-sm font-medium leading-relaxed text-foreground/80">• {insight}</p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RIGHT: Team Distribution & Recommendations (40%) */}
        <div className="lg:col-span-5 space-y-8">
          {/* Team Distribution */}
          <Card className="border-none shadow-glass rounded-[32px] bg-white dark:bg-gray-800 p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" /> Team Load Distribution
              </h4>
              <Badge variant="secondary" className="font-bold text-[10px]">{team.length} Agents</Badge>
            </div>
            
            <div className="space-y-5">
              {team.map((member) => (
                <div key={member.name} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-bold text-foreground">{member.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-indigo-600">{member.tickets} tickets</span>
                      <span className="text-[10px] font-bold text-muted-foreground">({member.percent}%)</span>
                    </div>
                  </div>
                  <Progress value={member.percent} className="h-1.5" indicatorClassName="bg-indigo-600" />
                </div>
              ))}
            </div>
          </Card>

          {/* Actionable Recommendations */}
          <Card className="border-none shadow-glass rounded-[32px] bg-indigo-600 text-white p-8 space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-indigo-200 flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" /> Manager Recommendations
            </h4>
            
            <div className="space-y-4">
              {recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-3 group cursor-pointer">
                  <div className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/20 transition-colors">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-bold leading-snug pt-1.5">{rec}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default AgentPerformancePulse;