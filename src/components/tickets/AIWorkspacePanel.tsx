"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Sparkles, Send, X, Zap, ShieldAlert, Target, MessageSquare, Info, Bot } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

interface AIWorkspacePanelProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: any;
}

const AIWorkspacePanel = ({ isOpen, onClose, ticket }: AIWorkspacePanelProps) => {
  const [query, setQuery] = useState("");

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="absolute right-0 top-0 h-full w-80 bg-white dark:bg-gray-900 border-l border-border shadow-2xl z-50 flex flex-col"
    >
      <div className="p-6 border-b border-border flex items-center justify-between bg-indigo-600 text-white">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/20 backdrop-blur-md">
            <Brain className="h-5 w-5" />
          </div>
          <span className="font-black tracking-tight">AI Workspace</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10 rounded-full">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-6 space-y-8">
        {/* Quick Actions */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Intelligence Tools</h4>
          <div className="grid grid-cols-1 gap-2.5">
            <Button variant="outline" className="justify-start gap-3 h-11 rounded-xl font-bold text-xs border-indigo-100 text-indigo-600 hover:bg-indigo-50 transition-all">
              <Target className="h-4 w-4" /> Root Cause Analysis
            </Button>
            <Button variant="outline" className="justify-start gap-3 h-11 rounded-xl font-bold text-xs border-indigo-100 text-indigo-600 hover:bg-indigo-50 transition-all">
              <MessageSquare className="h-4 w-4" /> Draft Resolution
            </Button>
            <Button variant="outline" className="justify-start gap-3 h-11 rounded-xl font-bold text-xs border-indigo-100 text-indigo-600 hover:bg-indigo-50 transition-all">
              <ShieldAlert className="h-4 w-4" /> Risk Assessment
            </Button>
          </div>
        </div>

        {/* Contextual Insight */}
        <div className="p-5 rounded-[24px] bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-600" />
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Live Context</span>
          </div>
          <p className="text-xs font-medium leading-relaxed text-indigo-900 dark:text-indigo-200">
            This customer has reported similar issues <span className="font-black">3 times</span> in the last 30 days. This might be a regression in the <span className="font-black">RFQ module</span>.
          </p>
          <div className="flex items-center gap-2 text-[9px] font-bold text-indigo-400 uppercase">
            <Info className="h-3 w-3" /> Pattern detected via RAG
          </div>
        </div>

        {/* AI Chat Preview */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Recent Analysis</h4>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-border space-y-3">
            <div className="flex items-center gap-2">
              <Bot className="h-3.5 w-3.5 text-indigo-600" />
              <span className="text-[10px] font-black uppercase tracking-widest">Support Brain</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed italic">
              "The customer's tone is escalating. I recommend a technical lead review the last API response."
            </p>
          </div>
        </div>
      </ScrollArea>

      <div className="p-6 border-t border-border bg-gray-50/50 dark:bg-gray-900/50">
        <div className="relative group">
          <Input 
            placeholder="Ask AI about this ticket..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-12 pr-12 rounded-xl border-none shadow-inner bg-white dark:bg-gray-800 font-medium text-sm"
          />
          <Button size="icon" className="absolute right-1 top-1 h-10 w-10 rounded-lg bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all active:scale-95">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default AIWorkspacePanel;