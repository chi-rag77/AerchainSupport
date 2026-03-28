"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Sparkles, X, MessageSquare, 
  Send, Zap, ShieldAlert, Target, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

const AIOpsAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Trigger */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 h-14 w-14 bg-indigo-600 text-white rounded-2xl shadow-2xl flex items-center justify-center z-50 group"
      >
        <div className="absolute inset-0 bg-indigo-400 rounded-2xl blur-lg opacity-0 group-hover:opacity-40 transition-opacity" />
        <Brain className="h-6 w-6 relative z-10" />
      </motion.button>

      {/* Expandable Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 right-8 w-96 h-[520px] bg-white dark:bg-gray-900 rounded-[32px] shadow-2xl z-50 flex flex-col border border-border overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 bg-indigo-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md">
                  <Sparkles className="h-5 w-5" />
                </div>
                <span className="font-black text-sm uppercase tracking-widest">AI Ops Assistant</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/10 rounded-full">
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50">
                  <p className="text-xs font-bold text-indigo-900 dark:text-indigo-200 leading-relaxed">
                    "I'm monitoring your system health. Currently, Freshdesk sync is stable, but I've detected a slight increase in API latency from the US-East region."
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Suggested Queries</p>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      "Why did sync fail yesterday?",
                      "Show tickets not synced",
                      "Fix webhook issue",
                      "Check API usage limits"
                    ].map(q => (
                      <button key={q} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-left text-xs font-bold transition-all border border-transparent hover:border-indigo-100">
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-6 border-t border-border bg-gray-50/50 dark:bg-gray-900/50">
              <div className="relative">
                <Input 
                  placeholder="Ask about system ops..." 
                  className="h-12 pr-12 rounded-xl border-none shadow-inner bg-white dark:bg-gray-800 font-medium text-sm"
                />
                <Button size="icon" className="absolute right-1 top-1 h-10 w-10 rounded-lg bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIOpsAssistant;