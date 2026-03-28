"use client";

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ShieldCheck, Users, Brain, 
  ChevronRight, Globe, Zap, Bell
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ControlHubHeaderProps {
  orgName: string;
  onOpenUsers: () => void;
}

const ControlHubHeader = ({ orgName, onOpenUsers }: ControlHubHeaderProps) => {
  return (
    <header className="h-24 border-b border-border bg-white dark:bg-gray-900 sticky top-0 z-40 px-8 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-8">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-tighter text-foreground">{orgName}</h1>
            <Badge className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border-none font-black text-[9px] uppercase tracking-widest px-2 py-0.5">
              Production
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">System Live</span>
            </div>
            <div className="h-3 w-px bg-border" />
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">94% Health Score</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center p-1 bg-gray-50 dark:bg-gray-800 rounded-xl border border-border">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onOpenUsers}
            className="h-9 px-4 rounded-lg font-black text-[10px] uppercase tracking-widest gap-2 hover:bg-white dark:hover:bg-gray-700 shadow-sm transition-all"
          >
            <Users className="h-4 w-4 text-indigo-600" />
            Users & Access
          </Button>
        </div>

        <div className="relative">
          <Button variant="outline" size="icon" className="rounded-xl h-11 w-11 border-none bg-gray-50 dark:bg-gray-800 shadow-sm">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-rose-500 rounded-full border-2 border-white dark:border-gray-900" />
          </Button>
        </div>

        <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-widest h-11 px-6 gap-2 shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95">
          <Brain className="h-4 w-4" />
          AI Assistant
        </Button>
      </div>
    </header>
  );
};

export default ControlHubHeader;