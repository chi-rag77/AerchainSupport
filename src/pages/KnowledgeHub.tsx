"use client";

import React, { useState } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { 
  Brain, BookOpen, Dna, MessageSquare, Sparkles, 
  Search, LayoutGrid, List, Settings, Zap, ShieldCheck,
  TrendingUp, Clock, Users, ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card"; // Added missing import

import KnowledgeLibrary from "@/components/knowledge/KnowledgeLibrary";
import AIKnowledgeAssistant from "@/components/knowledge/AIKnowledgeAssistant";
import ImplementationDNACard from "@/components/knowledge/ImplementationDNACard";
import DashboardMetricCardV2 from "@/components/DashboardMetricCardV2";

const KnowledgeHub = () => {
  const { session } = useSupabase();
  const user = session?.user;
  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  const [activeTab, setActiveTab] = useState('assistant');

  // Mock DNA Data
  const mockDna = {
    erp: 'SAP S/4HANA',
    approval_levels: 3,
    integrations_count: 4,
    high_risk_modules: ['PR Approval', 'Supplier Onboarding', 'Invoice Sync'],
    custom_validations: true
  };

  return (
    <TooltipProvider>
      <div className="flex-1 flex flex-col p-8 space-y-10 bg-[#F6F8FB] dark:bg-gray-950 min-h-screen overflow-y-auto">
        
        {/* Header Section */}
        <div className="relative w-full p-8 rounded-[32px] bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 shadow-glass overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
                  Knowledge Intelligence Hub <Brain className="h-8 w-8 text-indigo-600" />
                </h1>
                <p className="text-lg text-muted-foreground font-medium">Centralized product & implementation intelligence for support teams.</p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Badge variant="outline" className="bg-indigo-50/50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-200/50 py-1 px-3 gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                  RAG Engine Active
                </Badge>
                <Badge variant="secondary" className="bg-white/50 dark:bg-gray-700/50 py-1 px-3 gap-1.5 font-bold">
                  <BookOpen className="h-3.5 w-3.5" />
                  482 Documents Indexed
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 h-12 px-8 font-bold gap-2">
                <Sparkles className="h-4 w-4" />
                Ask Support Brain
              </Button>
            </div>
          </div>
        </div>

        {/* Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardMetricCardV2 
            title="AI Knowledge Usage"
            value="84%"
            icon={TrendingUp}
            archetype="volume"
            subtext="Agent queries resolved by AI"
            onClick={() => {}}
          />
          <DashboardMetricCardV2 
            title="Investigation Time"
            value="-42%"
            icon={Clock}
            archetype="health"
            subtext="Reduction in discovery phase"
            onClick={() => {}}
          />
          <DashboardMetricCardV2 
            title="Expert Escalations"
            value="12"
            icon={Users}
            archetype="attention"
            subtext="Active implementation threads"
            onClick={() => {}}
          />
          <DashboardMetricCardV2 
            title="Knowledge Health"
            value="92%"
            icon={ShieldCheck}
            archetype="volume"
            subtext="Documentation coverage score"
            onClick={() => {}}
          />
        </div>

        {/* Main Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Library (4 cols) */}
          <div className="lg:col-span-4 h-[800px]">
            <KnowledgeLibrary />
          </div>

          {/* Right: Assistant & DNA (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <AIKnowledgeAssistant />
              <div className="space-y-8">
                <ImplementationDNACard customerName="Acme Corp" dna={mockDna} />
                
                {/* Knowledge Contribution Card */}
                <Card className="border-none shadow-glass rounded-[32px] bg-indigo-50/50 dark:bg-indigo-950/10 p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                      <Zap className="h-5 w-5 text-amber-500" />
                    </div>
                    <h4 className="text-lg font-black tracking-tight">Knowledge Contribution</h4>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                    Found a new workaround or solution? Contribute to the Support Brain to help your team.
                  </p>
                  <Button variant="outline" className="w-full h-12 rounded-2xl border-indigo-200 text-indigo-600 font-bold gap-2 hover:bg-indigo-50">
                    Create Knowledge Article
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Card>
              </div>
            </div>
          </div>

        </div>

      </div>
    </TooltipProvider>
  );
};

export default KnowledgeHub;