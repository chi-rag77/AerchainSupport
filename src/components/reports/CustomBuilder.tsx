"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { 
  Layers, Database, BarChart3, LineChart, 
  PieChart, Table as TableIcon, Zap, Plus,
  Trash2, Sparkles, Play, Save, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const CustomBuilder = ({ onClose }: { onClose: () => void }) => {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({
    title: "",
    dataSource: "tickets",
    type: "bar",
    metrics: ["count"],
    dimensions: ["cf_company"],
    filters: []
  });

  return (
    <div className="flex flex-col h-full bg-[#F9FAFB] dark:bg-gray-950 animate-in fade-in slide-in-from-right-8 duration-500">
      {/* Header */}
      <div className="h-20 border-b border-border bg-white dark:bg-gray-900 flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
            <Plus className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight">Custom Report Builder</h3>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Build intelligence without SQL</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Configuration Panel */}
        <aside className="w-96 border-r border-border bg-white dark:bg-gray-900 p-8 space-y-10 overflow-y-auto">
          
          {/* 1. Data Source */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">1. Select Data Source</label>
            <div className="grid grid-cols-1 gap-2">
              {['Tickets', 'Customers', 'Implementations'].map(source => (
                <button
                  key={source}
                  onClick={() => setConfig({...config, dataSource: source.toLowerCase()})}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left",
                    config.dataSource === source.toLowerCase() 
                      ? "border-indigo-600 bg-indigo-50/50 text-indigo-600" 
                      : "border-transparent bg-gray-50 dark:bg-gray-800 hover:border-border"
                  )}
                >
                  <Database className="h-4 w-4" />
                  <span className="text-sm font-bold">{source}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Visualization */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">2. Visualization Type</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'bar', icon: BarChart3 },
                { id: 'line', icon: LineChart },
                { id: 'pie', icon: PieChart },
                { id: 'table', icon: TableIcon },
                { id: 'kpi', icon: Zap },
              ].map(type => (
                <button
                  key={type.id}
                  onClick={() => setConfig({...config, type: type.id})}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2",
                    config.type === type.id 
                      ? "border-indigo-600 bg-indigo-50/50 text-indigo-600" 
                      : "border-transparent bg-gray-50 dark:bg-gray-800 hover:border-border"
                  )}
                >
                  <type.icon className="h-5 w-5" />
                  <span className="text-[9px] font-black uppercase tracking-widest">{type.id}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Metrics & Dimensions */}
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Metrics (Y-Axis)</Label>
              <Select value={config.metrics[0]}>
                <SelectTrigger className="h-11 rounded-xl bg-gray-50 dark:bg-gray-800 border-none">
                  <SelectValue placeholder="Select Metric" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-2xl">
                  <SelectItem value="count">Ticket Count</SelectItem>
                  <SelectItem value="avg_tat">Avg Resolution Time</SelectItem>
                  <SelectItem value="sla_percent">SLA Compliance %</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Dimensions (X-Axis)</Label>
              <Select value={config.dimensions[0]}>
                <SelectTrigger className="h-11 rounded-xl bg-gray-50 dark:bg-gray-800 border-none">
                  <SelectValue placeholder="Select Dimension" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-2xl">
                  <SelectItem value="cf_company">Customer</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="cf_module">Module</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="pt-6 border-t border-border">
            <Button className="w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-indigo-500/20">
              <Play className="h-4 w-4" />
              Run Report
            </Button>
          </div>
        </aside>

        {/* Right: Preview Canvas */}
        <main className="flex-1 p-12 flex flex-col space-y-8 overflow-y-auto">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Input 
                placeholder="Untitled Report" 
                className="text-3xl font-black tracking-tighter border-none bg-transparent p-0 h-auto focus-visible:ring-0 placeholder:opacity-20"
              />
              <p className="text-sm font-medium text-muted-foreground">Previewing live data from {config.dataSource}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="rounded-xl font-bold gap-2 h-11 px-6">
                <Save className="h-4 w-4" /> Save Report
              </Button>
              <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2 h-11 px-6">
                <Sparkles className="h-4 w-4" /> AI Optimize
              </Button>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 rounded-[40px] border-4 border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center text-center p-12 space-y-6">
            <div className="p-6 rounded-[32px] bg-white dark:bg-gray-900 shadow-2xl border border-indigo-100 dark:border-indigo-900">
              <BarChart3 className="h-16 w-16 text-indigo-600 opacity-20" />
            </div>
            <div className="space-y-2">
              <h4 className="text-xl font-black tracking-tight">Report Preview</h4>
              <p className="text-sm font-medium text-muted-foreground max-w-xs mx-auto">
                Configure your metrics and dimensions on the left to see the visualization here.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CustomBuilder;