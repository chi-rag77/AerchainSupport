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
import { Loader2, RefreshCw, BarChart3, ShieldCheck, Brain, Sparkles } from "lucide-react";
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

  // Use refetch instead of automatic query
  const { data, isLoading, isFetching, error, refetch } = useInsightsV2();

  const handleRefresh = () => {
    toast.loading("Synthesizing Intelligence...", { id: "refresh-insights" });
    refetch().then(() => {
      toast.success("Intelligence updated!", { id: "refresh-insights" });
    });
  };

  return (
    <TooltipProvider>
      <div className="flex-1 flex flex-col p-8 space-y-12 bg-[#F6F8FB] dark:bg-gray-950 min-h-screen overflow-y-auto">
        
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
            {data && (
              <Button 
                onClick={handleRefresh} 
                disabled={isFetching}
                className="rounded-full bg-white dark:bg-gray-900 text-foreground border border-border hover:bg-gray-50 shadow-sm h-12 px-6 font-bold"
              >
                <RefreshCw className={cn("mr-2 h-4 w-4", isFetching && "animate-spin")} />
                Refresh Engine
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
            <p className="text-lg font-bold text-muted-foreground animate-pulse">Synthesizing Insights 2.0...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-32 text-center text-red-500">
            <p className="font-bold">Failed to load insights.</p>
            <p className="text-sm">{error.message}</p>
          </div>
        ) : data ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
            <ExecutiveAISummary data={data.summary} />
            
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <RootCauseClustering clusters={data.clusters} />
              <PredictiveForecasting points={data.forecast.points} recommendation={data.forecast.recommendation} />
            </section>

            <Separator className="bg-gray-200 dark:bg-gray-800" />
            <AutomationOpportunity data={data.automation} />
            <Separator className="bg-gray-200 dark:bg-gray-800" />
            <SentimentRiskMonitor risks={data.accountRisks} />
            <Separator className="bg-gray-200 dark:bg-gray-800" />
            <AgentIntelligence insights={data.agentIntelligence} />
          </motion.div>
        ) : null}
      </div>
    </TooltipProvider>
  );
};

export default Analytics;