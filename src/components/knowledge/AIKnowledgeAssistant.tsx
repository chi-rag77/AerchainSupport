"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Send, User, Bot, 
  FileText, ExternalLink, Loader2, 
  ShieldAlert, ArrowRight, Sparkles,
  Building2, Globe, RefreshCw
} from 'lucide-react';
import { invokeEdgeFunction } from '@/lib/apiClient';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  confidence?: number;
  sources?: { title: string; section: string }[];
  isCustomerPrompt?: boolean;
}

const AIKnowledgeAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm the Support Brain. I can help you with product workflows or specific customer implementations. What's on your mind?",
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [customerContext, setCustomerContext] = useState<string | null>(null);
  const [awaitingCustomer, setAwaitingCustomer] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch unique customers for the context picker
  const { data: uniqueCustomers = [] } = useQuery<string[]>({
    queryKey: ["uniqueCustomersForContext"],
    queryFn: async () => {
      const { data, error } = await supabase.from('freshdesk_tickets').select('cf_company').limit(1000);
      if (error) throw error;
      return Array.from(new Set((data || []).map(t => t.cf_company).filter(Boolean))) as string[];
    }
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (overrideInput?: string) => {
    const text = overrideInput || input;
    if (!text.trim() || isLoading) return;

    // 1. Add User Message
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    // 2. Check if we need customer context
    if (!customerContext && !awaitingCustomer) {
      setIsLoading(true);
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "To provide a precise response, should I look into a specific customer's implementation or search global product documentation?",
          isCustomerPrompt: true
        }]);
        setAwaitingCustomer(true);
        setIsLoading(false);
      }, 600);
      return;
    }

    // 3. Call AI
    setIsLoading(true);
    try {
      const result = await invokeEdgeFunction<any>('knowledge-ai-assistant', {
        body: { 
          query: text, 
          customerName: customerContext === 'Global' ? 'All' : customerContext 
        }
      });

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.answer,
        confidence: result.confidence,
        sources: result.sources
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Error: ${err.message || "I encountered an error searching the knowledge base."}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const selectCustomer = (name: string) => {
    setCustomerContext(name);
    setAwaitingCustomer(false);
    // Find the last user message to re-process with context
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMsg) {
      handleSend(lastUserMsg.content);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F9FAFB] dark:bg-gray-950">
      {/* Header */}
      <div className="h-16 border-b border-border bg-white dark:bg-gray-900 flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <span className="font-black tracking-tight">Support Brain AI</span>
        </div>

        <div className="flex items-center gap-4">
          {customerContext && (
            <Badge variant="outline" className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-200/50 font-bold py-1 px-3 gap-2">
              {customerContext === 'Global' ? <Globe className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
              Context: {customerContext}
              <button onClick={() => setCustomerContext(null)} className="hover:text-rose-500 transition-colors">
                <RefreshCw className="h-3 w-3" />
              </button>
            </Badge>
          )}
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">RAG Engine Online</span>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <ScrollArea className="flex-1" viewportRef={scrollRef}>
        <div className="max-w-3xl mx-auto py-12 px-6 space-y-10">
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-6",
                m.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border",
                m.role === 'assistant' ? "bg-indigo-600 text-white border-indigo-500" : "bg-white dark:bg-gray-800 text-foreground border-border"
              )}>
                {m.role === 'assistant' ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
              </div>

              <div className={cn("space-y-4 flex-1", m.role === 'user' && "text-right")}>
                <div className={cn(
                  "inline-block p-5 rounded-[24px] text-sm font-medium leading-relaxed shadow-sm border",
                  m.role === 'assistant' 
                    ? "bg-white dark:bg-gray-900 border-border rounded-tl-none text-left" 
                    : "bg-indigo-600 text-white border-indigo-500 rounded-tr-none text-left"
                )}>
                  {m.content}
                </div>

                {m.isCustomerPrompt && (
                  <div className="flex flex-wrap gap-2 justify-start">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => selectCustomer('Global')}
                      className="rounded-full font-bold gap-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                    >
                      <Globe className="h-3.5 w-3.5" /> Global Product Docs
                    </Button>
                    {uniqueCustomers.slice(0, 5).map(c => (
                      <Button 
                        key={c} 
                        variant="outline" 
                        size="sm" 
                        onClick={() => selectCustomer(c)}
                        className="rounded-full font-bold gap-2"
                      >
                        <Building2 className="h-3.5 w-3.5" /> {c}
                      </Button>
                    ))}
                  </div>
                )}

                {m.role === 'assistant' && m.sources && m.sources.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-start">
                    {m.sources.map((s, i) => (
                      <Badge key={i} variant="outline" className="bg-gray-50 dark:bg-gray-900 border-border/50 text-[10px] font-bold py-1 px-2 gap-1.5">
                        <FileText className="h-3 w-3" />
                        {s.title}
                        <ExternalLink className="h-2.5 w-2.5" />
                      </Badge>
                    ))}
                  </div>
                )}

                {m.role === 'assistant' && m.confidence && m.confidence < 70 && (
                  <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/50 space-y-3 text-left">
                    <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
                      <ShieldAlert className="h-4 w-4" />
                      <span className="text-xs font-black uppercase tracking-widest">Low Confidence ({m.confidence}%)</span>
                    </div>
                    <p className="text-xs font-medium text-rose-600 dark:text-rose-300">
                      I'm not entirely sure about this. Would you like to escalate this to an implementation expert?
                    </p>
                    <Button size="sm" className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl gap-2">
                      Ask Implementation Expert
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex gap-6">
              <div className="h-10 w-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Bot className="h-5 w-5" />
              </div>
              <div className="p-5 rounded-[24px] bg-white dark:bg-gray-900 border border-border rounded-tl-none flex items-center gap-3">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                <span className="text-sm font-bold text-muted-foreground animate-pulse">Synthesizing response...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-8 shrink-0">
        <div className="max-w-3xl mx-auto relative group">
          <Input 
            placeholder={awaitingCustomer ? "Please select a customer context above..." : "Ask about product workflows or customer configs..."} 
            value={input}
            disabled={awaitingCustomer || isLoading}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="h-16 pl-6 pr-16 rounded-[24px] bg-white dark:bg-gray-900 border-none shadow-2xl focus-visible:ring-2 focus-visible:ring-indigo-500/50 font-medium text-base"
          />
          <Button 
            size="icon" 
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading || awaitingCustomer}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        <p className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-4 opacity-50">
          Support Brain AI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
};

export default AIKnowledgeAssistant;