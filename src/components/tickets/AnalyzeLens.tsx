"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Ticket } from '@/features/tickets/types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Send, Sparkles, Target, FileText, 
  MessageSquare, ShieldAlert, ArrowRight, 
  RefreshCw, Bot, User, Search, Zap, Info,
  Loader2
} from 'lucide-react';
import AnalyzeMessage from './AnalyzeMessage';

interface AnalyzeLensProps {
  ticket: Ticket;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'hybrid';
  cards?: any[];
  followUps?: string[];
  isLoading?: boolean;
}

const SUGGESTED_PROMPTS = [
  { label: "Summarize Issue", icon: FileText, query: "Summarize this ticket and its current state." },
  { label: "Find Root Cause", icon: Target, query: "What is the likely root cause of this issue?" },
  { label: "Check Sentiment", icon: MessageSquare, query: "Analyze the customer's sentiment and tone." },
  { label: "Suggest Resolution", icon: Zap, query: "What are the next steps to resolve this?" },
  { label: "Similar Issues", icon: Search, query: "Are there any similar past cases?" },
];

const AnalyzeLens = ({ ticket }: AnalyzeLensProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (query: string) => {
    if (!query.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI Response Logic
    setTimeout(() => {
      const aiMsg: Message = generateMockResponse(query, ticket);
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200);
  };

  // Mock response generator based on query keywords
  const generateMockResponse = (query: string, ticket: Ticket): Message => {
    const q = query.toLowerCase();
    let content = "I've analyzed the ticket context. ";
    let cards = [];
    let followUps = ["What should I reply?", "Is this critical?"];

    if (q.includes('summarize')) {
      content = "Here is the executive summary of the current situation:";
      cards.push({
        type: 'summary',
        title: 'Executive Summary',
        content: `The customer is reporting that PR#${ticket.id.substring(0,6)} was cancelled unexpectedly. No pending actions are visible in the portal.`,
        icon: FileText
      });
    } else if (q.includes('root cause')) {
      content = "Based on system logs and conversation patterns, I've identified a likely cause:";
      cards.push({
        type: 'root_cause',
        title: 'Likely Root Cause',
        content: "Database lock contention detected during the RFQ cancellation workflow, causing a timeout in the UI state update.",
        icon: Target
      });
      followUps = ["Show technical logs", "Suggest a fix"];
    } else if (q.includes('sentiment')) {
      content = "The conversation intelligence indicates a shift in tone:";
      cards.push({
        type: 'sentiment',
        title: 'Conversation Insight',
        content: "Customer tone shifted to Frustrated in the last message. They mentioned this is a 'production blocker'.",
        icon: MessageSquare,
        status: 'critical'
      });
      followUps = ["Draft empathetic reply", "Escalate to manager"];
    } else {
      content = "I'm looking into that. Based on the ticket data, this relates to the " + (ticket.cf_module || "core") + " module.";
    }

    return {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content,
      cards,
      followUps
    };
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
          {isTyping && (
            <div className="flex gap-4">
              <div className="h-8 w-8 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="flex items-center gap-2 p-4 rounded-2xl bg-white dark:bg-gray-800 border border-border">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                <span className="text-xs font-bold text-muted-foreground animate-pulse uppercase tracking-widest">Synthesizing...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* 3. Upgraded Input Bar */}
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
            disabled={!input.trim() || isTyping}
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