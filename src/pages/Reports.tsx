"use client";

import React, { useState, useMemo } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { 
  BarChart3, Loader2, Search, Plus, Filter, 
  LayoutDashboard, ShieldAlert, TrendingUp, 
  Users, Zap, Brain, Sparkles, ChevronRight,
  CalendarDays, Download, Share2, Star, Layers
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Report, ReportCategory } from "@/features/reports/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import ReportCard from "@/components/reports/ReportCard";
import CustomBuilder from "@/components/reports/CustomBuilder";
import { Separator } from "@/components/ui/separator";

const CATEGORIES: { id: ReportCategory; icon: any }[] = [
  { id: 'Customer Health', icon: ShieldAlert },
  { id: 'Support Performance', icon: TrendingUp },
  { id: 'Ticket Insights', icon: Zap },
  { id: 'Implementation', icon: Layers },
  { id: 'Executive', icon: Brain },
];

const Reports = () => {
  const [activeCategory, setActiveCategory] = useState<ReportCategory | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState("");
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);

  // Mocking pre-built reports based on PRD
  const reports: Report[] = [
    { id: '1', title: 'Health Score Distribution', description: 'Overview of customer health across the entire portfolio.', category: 'Customer Health', type: 'pie', dataSource: 'tickets', lastRun: '2m ago' },
    { id: '2', title: 'At-Risk Customers', description: 'Identify accounts with declining engagement or high SLA breaches.', category: 'Customer Health', type: 'table', dataSource: 'tickets', lastRun: '5m ago' },
    { id: '3', title: 'Tickets Received vs Closed', description: 'Weekly throughput analysis of support operations.', category: 'Support Performance', type: 'line', dataSource: 'tickets', lastRun: '10m ago' },
    { id: '4', title: 'SLA Breach Report', description: 'Detailed breakdown of missed commitments by customer.', category: 'Support Performance', type: 'bar', dataSource: 'tickets', lastRun: '1h ago' },
    { id: '5', title: 'Top Recurring Issues', description: 'AI-clustered patterns of repeating product problems.', category: 'Ticket Insights', type: 'treemap', dataSource: 'tickets', lastRun: '30m ago' },
    { id: '6', title: 'Implementation Status', description: 'Real-time tracking of active customer go-lives.', category: 'Implementation', type: 'bar', dataSource: 'implementations', lastRun: '4h ago' },
    { id: '7', title: 'Churn Risk Indicators', description: 'Executive view of leading indicators for account churn.', category: 'Executive', type: 'kpi', dataSource: 'tickets', lastRun: '12m ago' },
  ];

  const filteredReports = reports.filter(r => 
    (activeCategory === 'All' || r.category === activeCategory) &&
    (r.title.toLowerCase().includes(searchTerm.toLowerCase()) || r.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isBuilderOpen) {
    return <CustomBuilder onClose={() => setIsBuilderOpen(false)} />;
  }

  return (
    <TooltipProvider>
      <div className="flex-1 flex flex-col p-8 space-y-10 bg-[#F6F8FB] dark:bg-gray-950 min-h-screen overflow-y-auto">
        
        {/* 1. Premium Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-black tracking-tighter text-foreground">Reporting & Analytics</h1>
            </div>
            <p className="text-lg text-muted-foreground font-medium">Enterprise intelligence and operational visibility.</p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-xl h-12 px-6 font-bold gap-2 border-none bg-white dark:bg-gray-900 shadow-sm">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              Last 30 Days
            </Button>
            <Button 
              onClick={() => setIsBuilderOpen(true)}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-widest h-12 px-8 gap-3 shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Create Custom Report
            </Button>
          </div>
        </div>

        {/* 2. AI Insight Strip */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-[28px] bg-gradient-to-r from-indigo-600 to-blue-700 text-white shadow-xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <Brain className="h-24 w-24" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-md">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div className="space-y-1">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">AI Operational Anomaly Detected</h4>
                <p className="text-lg font-bold leading-tight max-w-2xl">
                  "Resolution time for <span className="text-amber-300">Invoice Module</span> has increased by 42% this week. This correlates with a spike in 'Sync Timeout' queries."
                </p>
              </div>
            </div>
            <Button className="rounded-xl bg-white text-indigo-600 hover:bg-indigo-50 font-black text-[10px] uppercase tracking-widest h-11 px-8 shrink-0">
              Investigate Anomaly
            </Button>
          </div>
        </motion.div>

        {/* 3. Category Navigation & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center p-1 bg-gray-200/50 dark:bg-gray-800/50 rounded-full border border-white/20 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveCategory('All')}
              className={cn(
                "relative flex items-center gap-2 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                activeCategory === 'All' ? "text-white" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {activeCategory === 'All' && <motion.div layoutId="report-cat" className="absolute inset-0 bg-indigo-600 rounded-full shadow-md" />}
              <span className="relative z-10">All Reports</span>
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "relative flex items-center gap-2 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap",
                  activeCategory === cat.id ? "text-white" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {activeCategory === cat.id && <motion.div layoutId="report-cat" className="absolute inset-0 bg-indigo-600 rounded-full shadow-md" />}
                <cat.icon className="relative z-10 h-3.5 w-3.5" />
                <span className="relative z-10">{cat.id}</span>
              </button>
            ))}
          </div>

          <div className="relative group w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-indigo-600 transition-colors" />
            <Input 
              placeholder="Search reports..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-12 bg-white dark:bg-gray-900 border-none rounded-2xl shadow-sm focus-visible:ring-2 focus-visible:ring-indigo-500/50 font-medium"
            />
          </div>
        </div>

        {/* 4. Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredReports.map((report) => (
              <ReportCard 
                key={report.id} 
                report={report} 
                onClick={() => toast.info(`Opening ${report.title}...`)} 
              />
            ))}
          </AnimatePresence>
        </div>

        {filteredReports.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-muted-foreground bg-white dark:bg-gray-900 rounded-[32px] border border-dashed">
            <Search className="h-12 w-12 mb-4 opacity-20" />
            <p className="text-lg font-bold">No reports found matching your criteria</p>
            <Button variant="link" onClick={() => { setActiveCategory('All'); setSearchTerm(""); }} className="text-indigo-600 font-bold">Clear all filters</Button>
          </div>
        )}

        {/* 5. Decision Intelligence Footer */}
        <Separator className="opacity-50" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="border-none shadow-sm bg-white dark:bg-gray-900 rounded-[24px] p-6 space-y-4">
            <div className="flex items-center gap-2 text-indigo-600">
              <Star className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Saved Reports</span>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-bold text-muted-foreground italic">You haven't saved any custom reports yet.</p>
            </div>
          </Card>
          
          <Card className="border-none shadow-sm bg-white dark:bg-gray-900 rounded-[24px] p-6 space-y-4">
            <div className="flex items-center gap-2 text-amber-600">
              <CalendarDays className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Scheduled Delivery</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                <span className="text-xs font-bold">Weekly Exec Summary</span>
                <Badge className="bg-green-500 text-[8px]">Mon 9AM</Badge>
              </div>
            </div>
          </Card>

          <Card className="border-none shadow-sm bg-white dark:bg-gray-900 rounded-[24px] p-6 space-y-4">
            <div className="flex items-center gap-2 text-blue-600">
              <Share2 className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Recent Exports</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                <span className="text-xs font-bold">SLA_Breach_Q3.pdf</span>
                <Download className="h-3 w-3 text-muted-foreground" />
              </div>
            </div>
          </Card>
        </div>

      </div>
    </TooltipProvider>
  );
};

export default Reports;