"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  RefreshCw, History as HistoryIcon, Zap, ShieldCheck, 
  Brain, Sparkles, ArrowRight, Settings2,
  Database, Clock, Play
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const SyncControlCenter = () => {
  const [mode, setMode] = useState<'auto' | 'manual' | 'smart'>('smart');

  const modes = [
    { id: 'auto', label: 'Auto', icon: Clock, desc: 'Fixed 15m intervals' },
    { id: 'manual', label: 'Manual', icon: Settings2, desc: 'User triggered only' },
    { id: 'smart', label: 'Smart Adaptive', icon: Brain, desc: 'AI-controlled frequency' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 px-2">
        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
          <Zap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h3 className="text-xl font-black tracking-tight">Sync Control Center</h3>
      </div>

      <Card className="border-none shadow-glass rounded-[32px] bg-white dark:bg-gray-900 overflow-hidden">
        <CardContent className="p-8 space-y-10">
          
          {/* Mode Selector */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Operational Mode</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {modes.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id as any)}
                  className={cn(
                    "p-5 rounded-2xl border-2 transition-all text-left group relative overflow-hidden",
                    mode === m.id 
                      ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20" 
                      : "border-transparent bg-gray-50 dark:bg-gray-800 hover:border-border"
                  )}
                >
                  {mode === m.id && (
                    <motion.div layoutId="mode-glow" className="absolute -right-4 -top-4 w-12 h-12 bg-indigo-500/20 rounded-full blur-xl" />
                  )}
                  <div className="flex items-center gap-3 mb-2">
                    <m.icon className={cn("h-5 w-5", mode === m.id ? "text-indigo-600" : "text-muted-foreground")} />
                    <span className={cn("text-sm font-black uppercase tracking-widest", mode === m.id ? "text-indigo-600" : "text-foreground")}>
                      {m.label}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-muted-foreground">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* AI Insight Layer */}
          <div className="p-6 rounded-[24px] bg-indigo-600 text-white shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
              <Sparkles className="h-12 w-12" />
            </div>
            <div className="relative z-10 flex items-start gap-4">
              <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div className="space-y-1">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-200">AI Operational Insight</h4>
                <p className="text-sm font-bold leading-relaxed">
                  "System is currently up to date. No manual sync required. Next adaptive sync scheduled for 10:45 AM based on current ticket velocity."
                </p>
              </div>
            </div>
          </div>

          {/* Action Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[10px] gap-3 shadow-xl shadow-indigo-500/20">
              <RefreshCw className="h-4 w-4" /> Force Global Sync
            </Button>
            <Button variant="outline" className="h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-3 border-border hover:bg-gray-50">
              <Database className="h-4 w-4" /> Backfill Data
            </Button>
            <Button variant="outline" className="h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-3 border-border hover:bg-gray-50">
              <HistoryIcon className="h-4 w-4" /> Retry Failed Jobs
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SyncControlCenter;