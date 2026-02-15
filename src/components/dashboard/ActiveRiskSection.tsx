"use client";

import React, { useState } from 'react';
import { useActiveRisk } from '@/features/active-risk/hooks/useActiveRisk';
import RiskCard from './RiskCard';
import RiskDrilldownTable from './RiskDrilldownTable';
import { Brain, ShieldAlert, Clock, Users, TrendingUp, Loader2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ActiveRiskSectionProps {
  onViewTicket: (ticket: any) => void;
}

const ActiveRiskSection = ({ onViewTicket }: ActiveRiskSectionProps) => {
  const { data, isLoading, error } = useActiveRisk();
  const [selectedCategory, setSelectedCategory] = useState<string | null>('escalationRisk');

  if (isLoading) {
    return (
      <div className="h-48 flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-[24px] border border-dashed border-gray-200">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-sm font-medium text-muted-foreground">Analyzing operational risks...</p>
      </div>
    );
  }

  if (error || !data) return null;

  const activeTickets = selectedCategory ? data.metrics[selectedCategory as keyof typeof data.metrics].tickets : [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-100 dark:bg-red-900/30 rounded-2xl">
            <ShieldAlert className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-foreground">Active Risk Dashboard</h2>
            <p className="text-sm font-medium text-muted-foreground">Operational Command Center • Real-time Monitoring</p>
          </div>
        </div>
        <Badge className={cn(
          "px-4 py-1.5 rounded-full font-bold uppercase tracking-widest text-[10px]",
          data.summary.posture === 'Critical' ? "bg-red-500 text-white" : 
          data.summary.posture === 'Deteriorating' ? "bg-amber-500 text-white" : "bg-green-500 text-white"
        )}>
          Posture: {data.summary.posture}
        </Badge>
      </div>

      {/* AI Risk Narrative Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 rounded-[20px] bg-gradient-to-r from-indigo-600 to-blue-700 text-white shadow-lg relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Brain className="h-24 w-24" />
        </div>
        <div className="relative z-10 flex items-start gap-4">
          <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div className="space-y-1">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">AI Risk Intelligence Summary</h4>
            <p className="text-lg font-bold leading-tight max-w-3xl">
              {data.summary.message}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Risk Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <RiskCard 
          title="High Escalation Risk"
          data={data.metrics.escalationRisk}
          icon={AlertTriangle}
          isSelected={selectedCategory === 'escalationRisk'}
          onClick={() => setSelectedCategory('escalationRisk')}
        />
        <RiskCard 
          title="SLA Breach Predicted"
          data={data.metrics.slaRisk}
          icon={Clock}
          isSelected={selectedCategory === 'slaRisk'}
          onClick={() => setSelectedCategory('slaRisk')}
        />
        <RiskCard 
          title="Agent Overload"
          data={data.metrics.agentOverload}
          icon={Users}
          isSelected={selectedCategory === 'agentOverload'}
          onClick={() => setSelectedCategory('agentOverload')}
        />
        <RiskCard 
          title="Volume Spike Alert"
          data={data.metrics.volumeSpike}
          icon={TrendingUp}
          isSelected={selectedCategory === 'volumeSpike'}
          onClick={() => setSelectedCategory('volumeSpike')}
        />
      </div>

      {/* Drilldown View */}
      <AnimatePresence mode="wait">
        {selectedCategory && (
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-2">
                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                  Drilldown: {selectedCategory.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
              </div>
              <RiskDrilldownTable 
                tickets={activeTickets} 
                onViewTicket={onViewTicket}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ActiveRiskSection;