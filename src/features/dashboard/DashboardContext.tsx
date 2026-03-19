"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { subDays, startOfMonth, endOfMonth, subMonths, startOfDay, endOfDay } from 'date-fns';
import { DateRange } from 'react-day-picker';

export type ViewMode = 'overview' | 'risk' | 'performance';
export type TimeTravelPeriod = 'today' | 'yesterday' | 'lastweek' | 'custom';

export interface DashboardFilters {
  company?: string;
  status?: string;
  priority?: string;
  isFocusMode?: boolean;
  timePeriod?: TimeTravelPeriod;
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
  toggleFocusMode: () => void;
  setTimePeriod: (period: TimeTravelPeriod) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [datePreset, setDatePreset] = useState('last30days');
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [filters, setFilters] = useState<DashboardFilters>({
    isFocusMode: false,
    timePeriod: 'custom'
  });

  const getInitialRange = (preset: string): DateRange => {
    const now = new Date();
    switch (preset) {
      case 'today': return { from: startOfDay(now), to: endOfDay(now) };
      case 'yesterday': return { from: startOfDay(subDays(now, 1)), to: endOfDay(subDays(now, 1)) };
      case 'lastweek': return { from: subDays(now, 7), to: now };
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
    setFilters(prev => ({ ...prev, timePeriod: 'custom' }));
  };

  const handleSetDatePreset = (preset: string) => {
    setDatePreset(preset);
    if (preset !== 'custom') {
      setDateRangeState(getInitialRange(preset));
    }
  };

  const toggleFocusMode = () => {
    setFilters(prev => ({ ...prev, isFocusMode: !prev.isFocusMode }));
  };

  const setTimePeriod = (period: TimeTravelPeriod) => {
    setFilters(prev => ({ ...prev, timePeriod: period }));
    if (period !== 'custom') {
      setDatePreset(period);
      setDateRangeState(getInitialRange(period));
    }
  };

  const resetFilters = () => setFilters({ isFocusMode: false, timePeriod: 'custom' });

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
      resetFilters,
      toggleFocusMode,
      setTimePeriod
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