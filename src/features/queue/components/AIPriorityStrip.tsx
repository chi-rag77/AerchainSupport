"use client";

import React from 'react';
import { Brain, ShieldAlert, AlertTriangle, Info, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface QueueAlert {
  type: 'sla_risk' | 'escalation' | 'spike' | 'backlog' | 'anomaly' | 'agent_overload';
  title: string;
  value: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface AIPriorityStripProps {
  onApplyFilter: (alert: any) => void;
}

const AIPriorityStrip = ({ onApplyFilter }: AIPriorityStripProps) => {
  const { data: alerts = [], isLoading } = useQuery<QueueAlert[]>({
    queryKey: ['queueAlerts'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('generate-queue-alerts', { method: 'POST' });
      if (error) throw error;
      return data;
    },
    refetchInterval: 60000 * 5,
  });

  if (isLoading) {
    return (
      <div className="h-11 w-full bg-[#0B1220] rounded-xl flex items-center justify-center gap-3 text-white/40 mb-6">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span className="text-[9px] font-black uppercase tracking-[0.2em]">Scanning Queue...</span>
      </div>
    );
  }

  // Select exactly 3 signals: Critical, Warning, Info
  const critical = alerts.find(a => a.priority === 'critical') || alerts[0];
  const warning = alerts.find(a => a.priority === 'high' || a.priority === 'medium') || alerts[1];
  const info = alerts.find(a => a.priority === 'low') || alerts[2];

  const displayAlerts = [
    { ...critical, color: "text-rose-400 bg-rose-500/10 border-rose-500/20", icon: ShieldAlert, label: "Critical" },
    { ...warning, color: "text-amber-400 bg-amber-500/10 border-amber-500/20", icon: AlertTriangle, label: "Warning" },
    { ...info, color: "text-blue-400 bg-blue-500/10 border-blue-500/20", icon: Info, label: "Info" }
  ].filter(a => a.title);

  return (
    <div className="h-11 w-full bg-[#0B1220] rounded-xl flex items-center px-4 gap-6 mb-6 border border-white/5 shadow-2xl">
      <div className="flex items-center gap-2 pr-4 border-r border-white/10 shrink-0">
        <Brain className="h-3.5 w-3.5 text-indigo-400" />
        <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Live Signals</span>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
        {displayAlerts.map((alert, idx) => (
          <button
            key={idx}
            onClick={() => onApplyFilter(alert)}
            className={cn(
              "flex items-center gap-2 px-3 py-1 rounded-lg border transition-all hover:brightness-125 active:scale-95 whitespace-nowrap",
              alert.color
            )}
          >
            <alert.icon className="h-3 w-3" />
            <span className="text-[10px] font-bold">{alert.title}</span>
            <span className="text-[10px] font-black opacity-60 ml-1">{alert.value}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AIPriorityStrip;