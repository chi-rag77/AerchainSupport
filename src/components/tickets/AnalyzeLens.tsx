"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Ticket } from '@/features/tickets/types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from '@/lib/utils';
import { 
  Brain, Send, Target, FileText, 
  MessageSquare, Search, Zap, Loader2, Bot,
  Layout, Eye, EyeOff, Sparkles, ShieldAlert,
  ChevronRight, ListFilter
} from 'lucide-react';
import AnalyzeMessage from './AnalyzeMessage';
import { useTicketChat } from '@/features/ticket-ai/hooks/useTicketChat';
import { motion, AnimatePresence } from 'framer-motion';

interface AnalyzeLensProps {
  ticket: Ticket;
}

const SUGGESTION_GROUPS = [
  {
    label: "Understand",
    items: [
      { label: "Summarize Issue", icon: FileText, query: "Summarize this ticket and its current state." },
      { label: "Find Root Cause", icon: Target, query: "What is the likely root cause of this issue?" },
    ]
  },
  {
    label: "Analyze",
    items: [
      { label: "Check Sentiment", icon: MessageSquare, query: "Analyze the customer's sentiment and tone." },
      { label: "Impact Analysis", icon: ShieldAlert, query: "What is the operational impact of this issue?" },
    ]
  },
  {
    label: "Act",
    items: [
      { label: "Suggest Resolution", icon: Zap, query: "What are the next steps to resolve this?" },
      { label: "Similar Cases", icon: Search, query: "Are there any similar past cases?" },
    ]
  }
];

const AnalyzeLens = ({ ticket }: AnalyzeLensProps) => {
  const [input, setInput] = useState("");
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { messages, isLoading, sendMessage } = useTicketChat(ticket.id);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = (query: string) => {
    if (!query.trim()) return;
    sendMessage(query);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full space-y-6 relative">
      {/* 1. Categorized Suggestion Chips & Focus Toggle */}
      <div className="flex items-center justify-between gap-4 px-1">
        <AnimatePresence>
          {!isFocusMode && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 overflow-x-auto no-scrollbar"
            >
              <div className="flex gap-6 min-w-max pb-1">
                {SUGGESTION_GROUPS.map((group) => (
                  <div key={group.label} className="flex flex-col gap-2">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">
                      {group.label}
                    </span>
                    <div className="flex gap-2">
                      {group.items.map((item) => (
                        <button
                          key={item.label}
                          onClick={() => handleSend(item.query)}
                          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-800 border border-border hover:border-indigo-300 hover:bg-indigo-50/50 transition-all text-[11px] font-bold text-muted-foreground hover:text-indigo-600 shadow-sm whitespace-nowrap"
                        >
                          <item.icon className="h-3.5 w-3.5" />
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsFocusMode(!isFocusMode)}
          className={cn(
            "rounded-xl h-9 px-3 gap-2 font-bold text-[10px] uppercase tracking-widest shrink-0",
            isFocusMode ? "bg-indigo-600 text-white hover:bg-indigo-700" : "text-muted-foreground hover:bg-accent"
          )}
        >
          {isFocusMode ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          {isFocusMode ? "Exit Focus" : "Focus Mode"}
        </Button>
      </div>

      {/* 2. Chat Thread */}
      <ScrollArea className="flex-1 pr-4 -mr-4">
        <div className="space-y-10 py-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-2xl animate-pulse" />
                <div className="relative p-6 rounded-[32px] bg-white dark:bg-gray-800 border border-indigo-100 dark:border-indigo-900 shadow-xl">
                  <Brain className="h-12 w-12 text-indigo-600" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black tracking-tight text-foreground">AI Intelligence Workspace</h3>
                <p className="text-sm font-medium text-muted-foreground max-w-xs mx-auto leading-relaxed">
                  Ask anything about this ticket to generate deep insights, root causes, and resolution paths.
                </p>
              </div>
            </div>
          ) : (
            messages.map((m) => (
              <AnalyzeMessage 
                key={m.id} 
                message={m} 
                onFollowUp={handleSend}
              />
            ))
          )}
          {isLoading && (
            <div className="flex gap-4">
              <div className="h-10 w-10 rounded-2xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div className="flex items-center gap-3 p-5 rounded-[24px] bg-white dark:bg-gray-800 border border-border shadow-sm">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                <span className="text-xs font-black text-muted-foreground animate-pulse uppercase tracking-[0.2em]">Synthesizing Intelligence...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* 3. Premium Redesigned Input Bar */}
      <div className="relative group pt-4">
        {/* Animated "Running Light" Border Container */}
        <div className={cn(
          "absolute -inset-[1.5px] top-[17.5px] rounded-[22px] overflow-hidden pointer-events-none transition-opacity duration-500",
          isFocused ? "opacity-100" : "opacity-20 group-hover:opacity-50"
        )}>
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute inset-[-200%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_120deg,#7C6CF6_140deg,#5BA8FF_180deg,#F2A6FF_220deg,transparent_240deg,transparent_360deg)]"
          />
        </div>

        {/* Diffused Outer Glow */}
        <div className={cn(
          "absolute -inset-2 top-[16.5px] rounded-[24px] blur-xl transition-opacity duration-700 pointer-events-none",
          isFocused ? "opacity-30 bg-indigo-500/20" : "opacity-0"
        )} />
        
        {/* Main Input Container */}
        <div className={cn(
          "relative flex items-center gap-3 p-2 bg-[#FDFDFF] dark:bg-gray-900 rounded-[20px] border border-border/50 shadow-sm transition-all duration-300",
          isFocused ? "shadow-lg ring-1 ring-indigo-500/10" : "hover:border-border"
        )}>
          {/* Left: AI Icon Container */}
          <div className="p-3 rounded-full bg-gradient-to-br from-[#7C6CF6] to-[#5BA8FF] text-white shadow-md shrink-0">
            <Brain className="h-5 w-5" />
          </div>

          {/* Center: Input Field */}
          <Input 
            placeholder="Ask about root cause, impact, or next steps..." 
            value={input}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
            className="flex-1 border-none bg-transparent focus-visible:ring-0 text-base font-medium placeholder:text-slate-400 h-12"
          />

          {/* Right: Send Button */}
          <Button 
            size="icon" 
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isLoading}
            className={cn(
              "h-10 w-10 rounded-2xl transition-all active:scale-95 disabled:opacity-30 shrink-0",
              input.trim() 
                ? "bg-gradient-to-br from-[#7C6CF6] to-[#5BA8FF] text-white shadow-lg shadow-indigo-500/20" 
                : "bg-slate-100 dark:bg-gray-800 text-slate-400"
            )}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AnalyzeLens;