"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Ticket } from '@/features/tickets/types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from '@/lib/utils';
import { 
  Brain, Send, Target, FileText, 
  MessageSquare, Search, Zap, Loader2, Bot
} from 'lucide-react';
import AnalyzeMessage from './AnalyzeMessage';
import { useTicketChat } from '@/features/ticket-ai/hooks/useTicketChat';

interface AnalyzeLensProps {
  ticket: Ticket;
}

const SUGGESTED_PROMPTS = [
  { label: "Summarize Issue", icon: FileText, query: "Summarize this ticket and its current state." },
  { label: "Find Root Cause", icon: Target, query: "What is the likely root cause of this issue?" },
  { label: "Check Sentiment", icon: MessageSquare, query: "Analyze the customer's sentiment and tone." },
  { label: "Suggest Resolution", icon: Zap, query: "What are the next steps to resolve this?" },
  { label: "Similar Issues", icon: Search, query: "Are there any similar past cases?" },
];

const AnalyzeLens = ({ ticket }: AnalyzeLensProps) => {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { messages, isLoading, sendMessage } = useTicketChat(ticket.id);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = (query: string) => {
    sendMessage(query);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* 1. Suggested Prompt Chips */}
      <div className="flex flex-wrap gap-2 px-1">
        {SUGGESTED_PROMPTS.map((prompt) => (
          <button
            key={prompt.label}
            onClick={() => handleSend(prompt.query)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-800 border border-border hover:border-indigo-300 hover:bg-indigo-50/50 transition-all text-xs font-bold text-muted-foreground hover:text-indigo-600 shadow-sm"
          >
            <prompt.icon className="h-3.5 w-3.5" />
            {prompt.label}
          </button>
        ))}
      </div>

      {/* 2. Chat Thread */}
      <ScrollArea className="flex-1 pr-4 -mr-4">
        <div className="space-y-8 py-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-40">
              <div className="p-4 rounded-3xl bg-indigo-100 dark:bg-indigo-900/30">
                <Brain className="h-12 w-12 text-indigo-600" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black">AI Intelligence Workspace</h3>
                <p className="text-sm font-medium max-w-xs">Ask anything about this ticket to generate deep insights and resolution paths.</p>
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
              <div className="h-8 w-8 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="flex items-center gap-2 p-4 rounded-2xl bg-white dark:bg-gray-800 border border-border">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                <span className="text-xs font-bold text-muted-foreground animate-pulse uppercase tracking-widest">Analyzing Ticket...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* 3. Input Bar */}
      <div className="relative group pt-4">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[28px] blur opacity-10 group-focus-within:opacity-30 transition duration-1000"></div>
        <div className="relative flex items-center gap-3 p-2 bg-white dark:bg-gray-900 rounded-[24px] border border-border shadow-xl">
          <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-lg">
            <Brain className="h-6 w-6" />
          </div>
          <Input 
            placeholder="Ask anything about this ticket..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
            className="flex-1 border-none bg-transparent focus-visible:ring-0 text-base font-medium placeholder:text-muted-foreground/40"
          />
          <Button 
            size="icon" 
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isLoading}
            className="h-12 w-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg transition-all active:scale-95"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AnalyzeLens;