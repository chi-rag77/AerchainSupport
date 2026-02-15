"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { DateRange } from 'react-day-picker';

export type ViewMode = 'overview' | 'risk' | 'performance';

export interface DashboardFilters {
  company?: string;
  status?: string;
  priority?: string;
}

interface DashboardContextType {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  datePreset: string;
  setDatePreset: (preset: string) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  filters: DashboardFilters;
  setFilters: (filters: DashboardFilters) => void;
  resetFilters: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [datePreset, setDatePreset] = useState('last30days');
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [filters, setFilters] = useState<DashboardFilters>({});

  const getInitialRange = (preset: string): DateRange => {
    const now = new Date();
    switch (preset) {
      case 'last7days': return { from: subDays(now, 7), to: now };
      case 'thismonth': return { from: startOfMonth(now), to: now };
      case 'lastmonth': {
        const lastMonth = subMonths(now, 1);
        return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
      }
      case 'last30days':
      default: return { from: subDays(now, 30), to: now };
    }
  };

  const [dateRange, setDateRangeState] = useState<DateRange>(getInitialRange('last30days'));

  const setDateRange = (range: DateRange) => {
    setDateRangeState(range);
    setDatePreset('custom');
  };

  const handleSetDatePreset = (preset: string) => {
    setDatePreset(preset);
    if (preset !== 'custom') {
      setDateRangeState(getInitialRange(preset));
    }
  };

  const resetFilters = () => setFilters({});

  return (
    <DashboardContext.Provider value={{
      dateRange,
      setDateRange,
      datePreset,
      setDatePreset: handleSetDatePreset,
      viewMode,
      setViewMode,
      filters,
      setFilters,
      resetFilters
    }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) throw new Error('useDashboard must be used within a DashboardProvider');
  return context;
};