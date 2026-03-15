"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { 
  Brain, Send, User, Bot, 
  FileText, ExternalLink, MessageSquare, 
  Loader2, ShieldAlert, ArrowRight, Sparkles
} from 'lucide-react';
import { invokeEdgeFunction } from '@/lib/apiClient';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  confidence?: number;
  sources?: { title: string; section: string }[];
}

const AIKnowledgeAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your Knowledge Assistant. Ask me anything about product workflows or customer-specific implementations.",
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const result = await invokeEdgeFunction<any>('knowledge-ai-assistant', {
        body: { query: input, customerName: 'All' }
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
        content: "I encountered an error searching the knowledge base. Please try again."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-glass rounded-[32px] bg-white dark:bg-gray-800 overflow-hidden flex flex-col h-[700px]">
      <CardHeader className="p-6 border-b border-border bg-gray-50/50 dark:bg-gray-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-black tracking-tight">Support Brain AI</CardTitle>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">RAG Engine Online</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1 p-6" viewportRef={scrollRef}>
          <div className="space-y-6">
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex gap-4 max-w-[85%]",
                  m.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm",
                  m.role === 'assistant' ? "bg-indigo-600 text-white border-indigo-500" : "bg-white dark:bg-gray-700 text-foreground border-border"
                )}>
                  {m.role === 'assistant' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </div>

                <div className="space-y-3">
                  <div className={cn(
                    "p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-sm",
                    m.role === 'assistant' 
                      ? "bg-white dark:bg-gray-800 border border-border rounded-tl-none" 
                      : "bg-indigo-600 text-white rounded-tr-none"
                  )}>
                    {m.content}
                  </div>

                  {m.role === 'assistant' && m.sources && m.sources.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 px-1">
                        <FileText className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sources</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {m.sources.map((s, i) => (
                          <Badge key={i} variant="outline" className="bg-gray-50 dark:bg-gray-900 border-border/50 text-[10px] font-bold py-1 px-2 gap-1.5">
                            {s.title}
                            <ExternalLink className="h-2.5 w-2.5" />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {m.role === 'assistant' && m.confidence && m.confidence < 70 && (
                    <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/50 space-y-3">
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
              <div className="flex gap-4 max-w-[85%]">
                <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-border rounded-tl-none flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                  <span className="text-sm font-bold text-muted-foreground animate-pulse">Searching documentation...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-6 border-t border-border bg-gray-50/30 dark:bg-gray-900/30">
          <div className="relative group">
            <Input 
              placeholder="Ask about product workflows or customer configs..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="h-14 pl-6 pr-14 rounded-2xl bg-white dark:bg-gray-800 border-none shadow-glass focus-visible:ring-2 focus-visible:ring-indigo-500/50 font-medium"
            />
            <Button 
              size="icon" 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIKnowledgeAssistant;