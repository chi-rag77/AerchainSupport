"use client";

import React, { useState } from 'react';
import { Report } from '@/features/reports/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card";
import { 
  X, Download, Share2, Sparkles, Brain, 
  ArrowLeft, CalendarDays, Filter, Loader2,
  Info, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Visualizations
import HealthScoreDistribution from './visualizations/HealthScoreDistribution';
import AtRiskCustomers from './visualizations/AtRiskCustomers';
import TicketsReceivedVsClosed from './visualizations/TicketsReceivedVsClosed';
import SlaBreachReport from './visualizations/SlaBreachReport';
import TopRecurringIssuesReport from './visualizations/TopRecurringIssuesReport';
import ImplementationStatusReport from './visualizations/ImplementationStatusReport';
import ChurnRiskIndicators from './visualizations/ChurnRiskIndicators';

interface ReportViewerProps {
  report: Report;
  onClose: () => void;
}

const ReportViewer = ({ report, onClose }: ReportViewerProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  const handleRunAI = () => {
    setIsAnalyzing(true);
    // Simulate AI analysis
    setTimeout(() => {
      setAiInsight("Based on the current data, we're seeing a 12% improvement in resolution velocity compared to last month. However, the 'Invoice' module remains a bottleneck for 3 key enterprise accounts.");
      setIsAnalyzing(false);
    }, 1500);
  };

  const renderVisualization = () => {
    switch (report.id) {
      case '1': return <HealthScoreDistribution />;
      case '2': return <AtRiskCustomers />;
      case '3': return <TicketsReceivedVsClosed />;
      case '4': return <SlaBreachReport />;
      case '5': return <TopRecurringIssuesReport />;
      case '6': return <ImplementationStatusReport />;
      case '7': return <ChurnRiskIndicators />;
      default: return (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground italic">
          Visualization for this report is under construction.
        </div>
      );
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex flex-col bg-[#F9FAFB] dark:bg-gray-950"
    >
      {/* Header */}
      <header className="h-20 border-b border-border bg-white dark:bg-gray-900 flex items-center justify-between px-8 shrink-0 shadow-sm">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Separator orientation="vertical" className="h-8" />
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black tracking-tight">{report.title}</h2>
              <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-indigo-100 text-indigo-600">
                {report.category}
              </Badge>
            </div>
            <p className="text-xs font-medium text-muted-foreground">{report.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl font-bold gap-2 h-10 px-4 border-none bg-gray-50 dark:bg-gray-800">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            Last 30 Days
          </Button>
          <Button variant="outline" className="rounded-xl font-bold gap-2 h-10 px-4 border-none bg-gray-50 dark:bg-gray-800">
            <Filter className="h-4 w-4 text-muted-foreground" />
            Filters
          </Button>
          <Separator orientation="vertical" className="h-6 mx-1" />
          <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 border-none bg-gray-50 dark:bg-gray-800">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 border-none bg-gray-50 dark:bg-gray-800">
            <Share2 className="h-4 w-4" />
          </Button>
          <Button 
            onClick={handleRunAI}
            disabled={isAnalyzing}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-widest h-10 px-6 gap-2 shadow-lg shadow-indigo-500/20"
          >
            {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
            Explain Report
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* AI Insight Strip */}
          <AnimatePresence>
            {aiInsight && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-6 rounded-[24px] bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 flex items-start gap-4 relative overflow-hidden group"
              >
                <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800 shadow-sm text-indigo-600">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="space-y-1 flex-1">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-600">AI Executive Insight</h4>
                  <p className="text-sm font-bold leading-relaxed text-indigo-900 dark:text-indigo-200">
                    {aiInsight}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setAiInsight(null)} className="rounded-full h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Visualization Area */}
          <Card className="border-none shadow-glass rounded-[32px] bg-white dark:bg-gray-900 overflow-hidden">
            <CardContent className="p-10">
              {renderVisualization()}
            </CardContent>
          </Card>

          {/* Data Table / Details Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Underlying Data Points</h3>
              <Button variant="link" className="text-indigo-600 font-bold text-xs">Export to CSV</Button>
            </div>
            <div className="rounded-[24px] border border-border bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
              <div className="p-12 text-center text-muted-foreground italic text-sm">
                Detailed data table will be rendered here based on the report context.
              </div>
            </div>
          </div>
        </div>
      </main>
    </motion.div>
  );
};

export default ReportViewer;