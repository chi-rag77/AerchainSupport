"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  ShieldCheck, Zap, Activity, AlertTriangle, 
  TrendingUp, Clock, Brain, Sparkles, ArrowUpRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const MOCK_CHART_DATA = Array.from({ length: 20 }, (_, i) => ({ value: Math.floor(Math.random() * 40) + 60 }));

const SystemHealthDashboard = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      
      {/* 1. Integration Health Score */}
      <Card className="border-none shadow-glass rounded-[28px] bg-white dark:bg-gray-900 overflow-hidden group hover:shadow-md transition-all">
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div className="p-2.5 rounded-xl bg-green-50 text-green-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter border-green-100 text-green-600">Stable</Badge>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Integration Health</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-4xl font-black tracking-tighter text-foreground">92%</h3>
              <span className="text-[10px] font-bold text-green-600 flex items-center gap-0.5">
                <TrendingUp className="h-3 w-3" /> +2%
              </span>
            </div>
          </div>
          <div className="pt-2 border-t border-gray-50 dark:border-gray-800">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">API Latency: 142ms</p>
          </div>
        </CardContent>
      </Card>

      {/* 2. Sync Intelligence */}
      <Card className="border-none shadow-glass rounded-[28px] bg-indigo-600 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <Brain className="h-16 w-16" />
        </div>
        <CardContent className="p-6 space-y-4 relative z-10">
          <div className="flex justify-between items-start">
            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md">
              <Activity className="h-5 w-5" />
            </div>
            <Badge className="bg-white/20 text-white border-none font-black text-[9px] uppercase">Live</Badge>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Sync Intelligence</p>
            <h3 className="text-xl font-bold leading-tight">Ingestion Stable</h3>
            <p className="text-[10px] font-medium text-indigo-100 opacity-80">Next sync in 13 minutes</p>
          </div>
          <div className="pt-2 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <p className="text-[10px] font-bold uppercase tracking-tighter">No anomalies detected</p>
          </div>
        </CardContent>
      </Card>

      {/* 3. Data Throughput */}
      <Card className="border-none shadow-glass rounded-[28px] bg-white dark:bg-gray-900 overflow-hidden group hover:shadow-md transition-all">
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <Zap className="h-5 w-5" />
            </div>
            <div className="h-8 w-24 opacity-40 group-hover:opacity-100 transition-opacity">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_CHART_DATA}>
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#dbeafe" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Data Throughput</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-4xl font-black tracking-tighter text-foreground">2,575</h3>
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Tickets Today</span>
            </div>
          </div>
          <div className="pt-2 border-t border-gray-50 dark:border-gray-800">
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" /> 12% volume increase
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 4. Active Issues */}
      <Card className="border-none shadow-glass rounded-[28px] bg-white dark:bg-gray-900 overflow-hidden group hover:shadow-md transition-all">
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter border-amber-100 text-amber-600">Attention</Badge>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active Issues</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-4xl font-black tracking-tighter text-amber-600">2</h3>
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Delayed Syncs</span>
            </div>
          </div>
          <div className="pt-2 border-t border-gray-50 dark:border-gray-800">
            <p className="text-[10px] font-bold text-rose-600 uppercase tracking-tighter flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> 1 API retry spike detected
            </p>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default SystemHealthDashboard;