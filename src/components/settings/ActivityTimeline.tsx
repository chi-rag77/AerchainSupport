"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, CheckCircle2, AlertCircle, RefreshCw, 
  Zap, Brain, User, Filter, ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const EVENTS = [
  { time: '10:32 AM', type: 'sync', label: 'Sync Completed', detail: '257 tickets ingested', status: 'success' },
  { time: '10:31 AM', type: 'retry', label: 'API Retry (Freshdesk)', detail: 'Connection timeout resolved', status: 'warning' },
  { time: '10:15 AM', type: 'auto', label: 'Auto Sync Triggered', detail: 'Scheduled incremental run', status: 'info' },
  { time: '09:45 AM', type: 'ai', label: 'AI Optimization', detail: 'Adjusted sync frequency to 10m', status: 'ai' },
  { time: '09:12 AM', type: 'manual', label: 'Manual Sync', detail: 'Triggered by Admin', status: 'info' },
];

const ActivityTimeline = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
            <History className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-xl font-black tracking-tight">Activity Timeline</h3>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 hover:bg-gray-100">
          <Filter className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>

      <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent dark:before:via-gray-800">
        {EVENTS.map((event, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="relative flex items-start gap-6 group"
          >
            <div className={cn(
              "flex items-center justify-center w-10 h-10 rounded-full shadow-sm shrink-0 z-10 transition-transform group-hover:scale-110",
              event.status === 'success' ? "bg-green-50 text-green-600" :
              event.status === 'warning' ? "bg-amber-50 text-amber-600" :
              event.status === 'ai' ? "bg-indigo-600 text-white" :
              "bg-blue-50 text-blue-600"
            )}>
              {event.type === 'sync' && <CheckCircle2 className="h-4 w-4" />}
              {event.type === 'retry' && <AlertCircle className="h-4 w-4" />}
              {event.type === 'auto' && <RefreshCw className="h-4 w-4" />}
              {event.type === 'ai' && <Brain className="h-4 w-4" />}
              {event.type === 'manual' && <User className="h-4 w-4" />}
            </div>
            
            <div className="flex-1 pt-1">
              <div className="flex items-center justify-between mb-1">
                <h5 className="text-sm font-black text-foreground">{event.label}</h5>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{event.time}</span>
              </div>
              <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                {event.detail}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <Button variant="ghost" className="w-full h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest text-indigo-600 hover:bg-indigo-50 gap-2">
        View Full Audit Log <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ActivityTimeline;