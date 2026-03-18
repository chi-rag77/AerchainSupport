"use client";

import React from 'react';
import { Ticket } from '@/features/tickets/types';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, Sparkles, Search, Target, Zap, 
  ShieldAlert, MessageSquare, FileText, 
  ArrowRight, Bot, Info, Send, List
} from 'lucide-react';
import { motion } from 'framer-motion';

interface AnalyzeLensProps {
  ticket: Ticket;
  analysis: any;
  isLoading: boolean;
}

const AnalyzeLens = ({ ticket, analysis, isLoading }: AnalyzeLensProps) => {
  return (
    <div className="space-y-10">
      {/* 1. AI Query Bar */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[28px] blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
        <div className="relative flex items-center gap-3 p-2 bg-white dark:bg-gray-900 rounded-[24px] border border-border shadow-xl">
          <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-lg">
            <Brain className="h-6 w-6" />
          </div>
          <Input 
            placeholder="Ask anything about this ticket (e.g., 'Why is this delayed?')..." 
            className="flex-1 border-none bg-transparent focus-visible:ring-0 text-lg font-medium placeholder:text-muted-foreground/50"
          />
          <Button size="icon" className="h-12 w-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg transition-all active:scale-95">
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-2xl animate-pulse" />
            <Bot className="h-12 w-12 text-indigo-600 animate-bounce relative z-10" />
          </div>
          <p className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Synthesizing Intelligence...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* 2. Primary Analysis Panels (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Summary Card */}
              <Card className="border-none shadow-glass rounded-[28px] bg-white dark:bg-gray-800 p-8 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Executive Summary</h4>
                </div>
                <p className="text-sm font-bold leading-relaxed text-foreground/90">
                  {analysis?.summary || "The customer is experiencing a recurring timeout in the RFQ module, specifically during the supplier selection phase. This appears to be a regression from the last deployment."}
                </p>
              </Card>

              {/* Root Cause Card */}
              <Card className="border-none shadow-glass rounded-[28px] bg-white dark:bg-gray-800 p-8 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                    <Target className="h-5 w-5" />
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Likely Root Cause</h4>
                </div>
                <p className="text-sm font-bold leading-relaxed text-foreground/90">
                  {analysis?.root_cause || "Database lock contention on the 'supplier_quotes' table during high-concurrency RFQ creation events."}
                </p>
              </Card>
            </div>

            {/* Suggested Actions */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">Suggested Resolution Path</h4>
              <div className="grid grid-cols-1 gap-4">
                {[
                  "Verify database locks for the last 4 hours.",
                  "Check if the 'supplier_quotes' index was modified.",
                  "Draft a technical update for the customer explaining the investigation."
                ].map((action, i) => (
                  <div key={i} className="flex items-center justify-between p-5 rounded-[24px] bg-indigo-50/30 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-900/50 group hover:bg-indigo-50 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="h-8 w-8 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-xs font-black text-indigo-600 shadow-sm">
                        {i + 1}
                      </div>
                      <span className="text-sm font-bold text-indigo-900 dark:text-indigo-200">{action}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Contextual Intelligence (4 cols) */}
          <div className="lg:col-span-4 space-y-8">
            {/* Conversation Intelligence */}
            <Card className="border-none shadow-glass rounded-[28px] bg-white dark:bg-gray-800 p-8 space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-indigo-600" /> Conversation Intel
              </h4>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                  <p className="text-xs font-bold">Customer tone shifted to <span className="text-rose-600">Frustrated</span> in the last message.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <p className="text-xs font-bold">Key moment: Customer mentioned "production blocker" at 14:20.</p>
                </div>
              </div>
            </Card>

            {/* Knowledge Suggestions */}
            <Card className="border-none shadow-glass rounded-[28px] bg-indigo-600 text-white p-8 space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-200 flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> Knowledge Base
              </h4>
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 group cursor-pointer hover:bg-white/20 transition-all">
                  <p className="text-xs font-bold mb-1">RFQ Timeout Troubleshooting</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-widest text-indigo-200">SOP-442</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 group cursor-pointer hover:bg-white/20 transition-all">
                  <p className="text-xs font-bold mb-1">Database Lock Resolution</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-widest text-indigo-200">TECH-109</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </div>
            </Card>
          </div>

        </div>
      )}
    </div>
  );
};

export default AnalyzeLens;