"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Sparkles, X, Send, Trash2, Loader2, 
  Command, SlidersHorizontal, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";
import { useDashboard } from "@/features/dashboard/DashboardContext";
import { getAssistantResponse } from "@/features/assistant/services/assistant.service";
import { ChatMessage as Message, SMART_SUGGESTIONS } from "@/features/assistant/types";
import ChatMessage from "./ChatMessage";
import { toast } from "sonner";

const DashboardAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const location = useLocation();
  const { filters, setFilters } = useDashboard();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleAction = (action: any) => {
    if (action.type === 'filter') {
      setFilters({ ...filters, ...action.payload });
      toast.success(`Applied filter: ${action.label}`);
    }
  };

  const handleSend = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const context = {
        current_page: location.pathname,
        filters: filters,
        user_role: "manager"
      };

      const response = await getAssistantResponse(content, context);
      
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.answer,
        timestamp: new Date().toISOString(),
        type: response.type,
        title: response.title,
        bullets: response.bullets,
        actions: response.actions,
        mode: 'ai',
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      toast.error("AI Assistant encountered an error.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 h-14 w-14 bg-indigo-600 text-white rounded-2xl shadow-2xl flex items-center justify-center z-40 group"
      >
        <div className="absolute inset-0 bg-indigo-400 rounded-2xl blur-lg opacity-0 group-hover:opacity-40 transition-opacity" />
        <Sparkles className="h-6 w-6 relative z-10" />
      </motion.button>

      {/* Sidebar Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white dark:bg-gray-950 shadow-2xl z-[60] flex flex-col border-l border-border"
            >
              {/* Header */}
              <div className="p-6 border-b border-border flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20">
                    <Brain className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm uppercase tracking-widest">Support Copilot</h3>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Operational Intelligence Active</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-full">
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Chat Area */}
              <ScrollArea className="flex-1 p-6">
                {messages.length === 0 ? (
                  <div className="space-y-8 py-12">
                    <div className="text-center space-y-2">
                      <h4 className="text-xl font-black tracking-tight">How can I help today?</h4>
                      <p className="text-sm text-muted-foreground font-medium">Ask about backlog, SLA risks, or specific customer issues.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-2">Suggested Commands</p>
                      {SMART_SUGGESTIONS.map(s => (
                        <button 
                          key={s} 
                          onClick={() => handleSend(s)}
                          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-2xl text-sm font-bold text-left transition-all group border border-transparent hover:border-indigo-100"
                        >
                          {s}
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-indigo-600 transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {messages.map((m) => (
                      <ChatMessage key={m.id} message={m} onAction={handleAction} />
                    ))}
                    {isLoading && (
                      <div className="flex items-center gap-3 p-4 text-muted-foreground animate-pulse">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-xs font-black uppercase tracking-widest">Synthesizing Intelligence...</span>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>

              {/* Input Area */}
              <div className="p-6 border-t border-border bg-gray-50/50 dark:bg-gray-900/50">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition-opacity" />
                  <div className="relative flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-sm border border-border">
                    <Input
                      placeholder="Ask about your operations..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
                      className="border-none bg-transparent focus-visible:ring-0 font-medium text-sm h-10"
                    />
                    <Button 
                      size="icon" 
                      onClick={() => handleSend(input)}
                      disabled={!input.trim() || isLoading}
                      className="h-10 w-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 shrink-0"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 mt-4 text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50">
                  <Command className="h-3 w-3" />
                  AI-Powered Operational Command
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default DashboardAssistant;