"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Sparkles, X, Send, Maximize2, Minimize2, 
  Trash2, MessageSquare, Loader2, Zap, Info 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ChatMessage as ChatMessageType, SMART_SUGGESTIONS } from '@/features/assistant/types';
import { getAssistantResponse } from '@/features/assistant/services/assistant.service';
import ChatMessage from './ChatMessage';
import { cn } from '@/lib/utils';

const DashboardAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'ai' | 'rule'>('ai');
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMsg: ChatMessageType = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      mode: 'ai'
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    const response = await getAssistantResponse(content);
    
    const assistantMsg: ChatMessageType = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response.answer,
      timestamp: new Date().toISOString(),
      mode: response.mode
    };

    setMessages(prev => [...prev, assistantMsg]);
    setMode(response.mode);
    setIsLoading(false);
  };

  const clearChat = () => {
    setMessages([]);
    setMode('ai');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={cn(
              "mb-4 overflow-hidden shadow-2xl rounded-[24px] border border-border bg-background/95 backdrop-blur-xl flex flex-col transition-all duration-300",
              isExpanded ? "w-[600px] h-[700px]" : "w-[380px] h-[500px]"
            )}
          >
            {/* Header */}
            <div className="p-4 border-b border-border bg-white/50 dark:bg-gray-900/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20">
                  {mode === 'ai' ? <Brain className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
                </div>
                <div>
                  <h3 className="text-sm font-bold leading-none">AI Operations Assistant</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", mode === 'ai' ? "bg-green-500" : "bg-amber-500")} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      {mode === 'ai' ? 'AI Mode Active' : 'Rule-Based Mode'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={clearChat} className="h-8 w-8 rounded-full">
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)} className="h-8 w-8 rounded-full hidden sm:flex">
                  {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 rounded-full">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <ScrollArea className="flex-1 p-4" viewportRef={scrollRef}>
                {messages.length === 0 && (
                  <div className="py-8 text-center space-y-6">
                    <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 inline-block">
                      <Sparkles className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                      <p className="text-sm font-bold text-indigo-900 dark:text-indigo-200">How can I help you today?</p>
                      <p className="text-xs text-indigo-700/70 dark:text-indigo-300/70 mt-1">Ask about tickets, performance, or insights.</p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Suggestions</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {SMART_SUGGESTIONS.map((s) => (
                          <button
                            key={s}
                            onClick={() => handleSend(s)}
                            className="text-xs font-semibold px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-border hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all text-left"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} />
                ))}

                {isLoading && (
                  <div className="flex justify-start mb-4">
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl rounded-tl-none border border-border shadow-sm flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                      <span className="text-xs font-medium text-muted-foreground">AI is thinking...</span>
                    </div>
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-border bg-white/50 dark:bg-gray-900/50">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
                className="relative flex items-center gap-2"
              >
                <Input
                  placeholder="Ask about tickets, performance..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="pr-12 h-12 rounded-xl border-none bg-white dark:bg-gray-800 shadow-inner focus-visible:ring-2 focus-visible:ring-indigo-500/50"
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={!input.trim() || isLoading}
                  className="absolute right-1.5 h-9 w-9 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
              <p className="text-[9px] text-center text-muted-foreground mt-3 flex items-center justify-center gap-1">
                <Info className="h-2.5 w-2.5" />
                AI can make mistakes. Verify important metrics.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "h-14 w-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300",
              isOpen ? "bg-gray-900 text-white rotate-90" : "bg-indigo-600 text-white"
            )}
          >
            {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
            {!isOpen && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-500"></span>
              </span>
            )}
          </motion.button>
        </TooltipTrigger>
        <TooltipContent side="left" className="font-bold">
          Ask AI about your operations
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default DashboardAssistant;