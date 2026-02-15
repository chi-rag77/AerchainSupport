"use client";

import React from 'react';
import { useDashboard, ViewMode } from '@/features/dashboard/DashboardContext';
import { cn } from '@/lib/utils';
import { LayoutDashboard, ShieldAlert, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const ViewModeSelector = () => {
  const { viewMode, setViewMode } = useDashboard();

  const modes: { id: ViewMode; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'risk', label: 'Risk Mode', icon: ShieldAlert },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
  ];

  return (
    <div className="flex items-center p-1 bg-gray-200/50 dark:bg-gray-800/50 rounded-full w-fit border border-white/20">
      {modes.map((mode) => {
        const isActive = viewMode === mode.id;
        const Icon = mode.icon;
        
        return (
          <button
            key={mode.id}
            onClick={() => setViewMode(mode.id)}
            className={cn(
              "relative flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all duration-300",
              isActive ? "text-indigo-600 dark:text-white" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="active-pill"
                className="absolute inset-0 bg-white dark:bg-indigo-600 rounded-full shadow-sm"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <Icon className="relative z-10 h-4 w-4" />
            <span className="relative z-10">{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ViewModeSelector;