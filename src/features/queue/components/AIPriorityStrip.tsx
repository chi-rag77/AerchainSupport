"use client";

import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { 
  ArrowRight, TrendingUp, AlertTriangle, Zap, 
  ShieldAlert, Clock, Brain, Loader2, Info,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface QueueAlert {
  type: 'sla_risk' | 'escalation' | 'spike' | 'backlog' | 'anomaly' | 'agent_overload';
  title: string;
  description: string;
  value: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  confidence: 'low' | 'medium' | 'high';
  action: string;
  cta_label: string;
  filter_query: string;
}

const AIPriorityStrip = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const { data: alerts = [], isLoading, error } = useQuery<QueueAlert[]>({
    queryKey: ['queueAlerts'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('generate-queue-alerts', { method: 'POST' });
      if (error) throw error;
      return data;
    },
    refetchInterval: 60000 * 5, // Refresh every 5 minutes
  });

  useEffect(() => {
    if (alerts.length <= 1 || isHovered) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % alerts.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [alerts.length, isHovered]);

  if (isLoading) {
    return (
      <div className="h-20 w-full bg-[#0B1220] rounded-[24px] flex items-center justify-center gap-3 text-white/40">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Synthesizing Live Intelligence...</span>
      </div>
    );
  }

  if (error || alerts.length === 0) return null;

  const currentAlert = alerts[currentIndex];

  const getIcon = (type: string) => {
    switch (type) {
      case 'sla_risk': return <Clock className="h-4 w-4 text-[#F59E0B]" />;
      case 'escalation': return <ShieldAlert className="h-4 w-4 text-[#EF4444]" />;
      case 'spike': return <TrendingUp className="h-4 w-4 text-[#10B981]" />;
      default: return <Zap className="h-4 w-4 text-indigo-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return "bg-rose-500";
      case 'high': return "bg-orange-500";
      case 'medium': return "bg-amber-500";
      default: return "bg-indigo-500";
    }
  };

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Card className="relative overflow-hidden border-none bg-[#0B1220] text-white shadow-2xl rounded-[24px] p-1">
          {/* Background Effects */}
          <motion.div 
            animate={{ 
              background: [
                "radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)",
                "radial-gradient(circle at 80% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)",
                "radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)"
              ]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 pointer-events-none"
          />

          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-6 px-6 py-4">
            
            {/* AI Label */}
            <div className="flex items-center gap-4 pr-6 border-r border-white/10">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 blur-md opacity-40 animate-pulse" />
                <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] shadow-lg">
                  <Brain className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">Live Intelligence</span>
                <span className="text-[8px] font-bold text-white/40 uppercase tracking-tighter">AI Synthesized • {alerts.length} Signals</span>
              </div>
            </div>

            {/* Alert Content with Animation */}
            <div className="flex-1 relative h-10 flex items-center overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="flex items-center gap-6 w-full"
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-3 cursor-help group">
                        <div className="relative">
                          <div className={cn("absolute inset-0 blur-sm rounded-full opacity-20", getPriorityColor(currentAlert.priority))} />
                          {getIcon(currentAlert.type)}
                        </div>
                        <div className="flex flex-col">
                          <p className="text-sm font-bold text-white leading-tight">
                            {currentAlert.title}
                          </p>
                          <p className="text-[10px] text-white/50 font-medium">
                            {currentAlert.description}
                          </p>
                        </div>
                        <div className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ml-2",
                          currentAlert.priority === 'critical' ? "bg-rose-500/20 text-rose-400" : "bg-white/10 text-white/70"
                        )}>
                          {currentAlert.value}
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#1A1F2E] border-white/10 text-white p-4 rounded-xl shadow-2xl max-w-xs">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">AI Recommendation</span>
                          <Badge variant="outline" className="text-[8px] border-white/20 text-white/60">{currentAlert.confidence} Confidence</Badge>
                        </div>
                        <p className="text-xs font-bold leading-relaxed">{currentAlert.action}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Controls & CTA */}
            <div className="flex items-center gap-4">
              {alerts.length > 1 && (
                <div className="flex items-center gap-1 mr-2">
                  <Button 
                    variant="ghost" size="icon" 
                    onClick={() => setCurrentIndex((prev) => (prev - 1 + alerts.length) % alerts.length)}
                    className="h-8 w-8 rounded-full hover:bg-white/10 text-white/40 hover:text-white"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-[10px] font-black text-white/20 w-8 text-center">
                    {currentIndex + 1}/{alerts.length}
                  </span>
                  <Button 
                    variant="ghost" size="icon" 
                    onClick={() => setCurrentIndex((prev) => (prev + 1) % alerts.length)}
                    className="h-8 w-8 rounded-full hover:bg-white/10 text-white/40 hover:text-white"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <Button className="bg-white text-[#0B1220] hover:bg-indigo-50 font-black text-[10px] uppercase tracking-widest h-11 px-8 rounded-xl gap-2 shadow-xl transition-all hover:scale-105 active:scale-95">
                {currentAlert.cta_label} <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </TooltipProvider>
  );
};

export default AIPriorityStrip;