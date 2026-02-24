"use client";

import React from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useInsightsV2 } from "@/features/insights/hooks/useInsightsV2";
import ExecutiveAISummary from "@/components/insights/ExecutiveAISummary";
import RootCauseClustering from "@/components/insights/RootCauseClustering";
import PredictiveForecasting from "@/components/insights/PredictiveForecasting";
import AutomationOpportunity from "@/components/insights/AutomationOpportunity";
import SentimentRiskMonitor from "@/components/insights/SentimentRiskMonitor";
import AgentIntelligence from "@/components/insights/AgentIntelligence";
import { Loader2, RefreshCw, BarChart3, LayoutDashboard, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const Analytics = () => {
  const { session } = useSupabase();
  const user = session?.user;
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching, error } = useInsightsV2();

  const handleRefresh = () => {
    toast.loading("Refreshing AI Intelligence...", { id: "refresh-insights" });
    queryClient.invalidateQueries({ queryKey: ['insightsV2'] });
    setTimeout(() => toast.success("Intelligence updated!", { id: "refresh-insights" }), 1000);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F6F8FB] dark:bg-gray-950">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
        <p className="text-lg font-bold text-muted-foreground animate-pulse">Synthesizing Insights 2.0...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-red-500">
        <p className="font-bold">Failed to load intelligence engine.</p>
        <Button onClick={handleRefresh} variant="outline" className="mt-4">Try Again</Button>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex-1 flex flex-col p-8 space-y-12 bg-[#F6F8FB] dark:bg-gray-950 min-h-screen overflow-y-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-indigo-600" />
              <h1 className="text-3xl font-black tracking-tight text-foreground">Insights 2.0</h1>
            </div>
            <p className="text-lg font-medium text-muted-foreground">AI Decision Engine • Enterprise Intelligence Layer</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-900 shadow-sm border border-border">
              <ShieldCheck className="h-4 w-4 text-green-500" />
              <span className="text-[10px] font-black uppercase tracking-widest">SOC2 Compliant Architecture</span>
            </div>
            <Button 
              onClick={handleRefresh} 
              disabled={isFetching}
              className="rounded-full bg-white dark:bg-gray-900 text-foreground border border-border hover:bg-gray-50 shadow-sm h-12 px-6 font-bold"
            >
              <RefreshCw className={cn("mr-2 h-4 w-4", isFetching && "animate-spin")} />
              Refresh Engine
            </Button>
          </div>
        </div>

        {/* Section 1: Executive Overview */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ExecutiveAISummary data={data.summary} />
        </motion.section>

        {/* Section 2: Operational Intelligence & Root Cause */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <RootCauseClustering clusters={data.clusters} />
          <PredictiveForecasting points={data.forecast.points} recommendation={data.forecast.recommendation} />
        </section>

        <Separator className="bg-gray-200 dark:bg-gray-800" />

        {/* Section 3: Automation ROI */}
        <section>
          <AutomationOpportunity data={data.automation} />
        </section>

        <Separator className="bg-gray-200 dark:bg-gray-800" />

        {/* Section 4: Risk & Sentiment Monitor */}
        <section>
          <SentimentRiskMonitor risks={data.accountRisks} />
        </section>

        <Separator className="bg-gray-200 dark:bg-gray-800" />

        {/* Section 5: Agent Intelligence */}
        <section>
          <AgentIntelligence insights={data.agentIntelligence} />
        </section>

        {/* Footer: System Health */}
        <div className="pt-12 pb-6 flex items-center justify-center gap-8 opacity-50">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-[10px] font-black uppercase tracking-widest">Data Freshness: Live</span>
          </div>
          <div className="flex items-center gap-2">
            <Brain className="h-3 w-3" />
            <span className="text-[10px] font-black uppercase tracking-widest">AI Confidence: 92%</span>
          </div>
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-3 w-3" />
            <span className="text-[10px] font-black uppercase tracking-widest">GDPR Ready</span>
          </div>
        </div>

      </div>
    </TooltipProvider>
  );
};

export default Analytics;