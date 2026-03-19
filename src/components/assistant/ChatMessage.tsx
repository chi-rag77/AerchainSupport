"use client";

import React from 'react';
import { ChatMessage as ChatMessageType } from '@/features/assistant/types';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Brain, User, Zap, ArrowRight, ListFilter, Search, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatMessageProps {
  message: ChatMessageType;
  onAction?: (action: any) => void;
}

const ChatMessage = ({ message, onAction }: ChatMessageProps) => {
  const isAssistant = message.role === 'assistant';

  const getIcon = (type?: string) => {
    switch (type) {
      case 'insight': return <Zap className="h-4 w-4 text-amber-500" />;
      case 'navigation': return <ListFilter className="h-4 w-4 text-blue-500" />;
      case 'knowledge': return <Search className="h-4 w-4 text-indigo-500" />;
      case 'action': return <ShieldAlert className="h-4 w-4 text-rose-500" />;
      default: return <Brain className="h-4 w-4 text-indigo-600" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex w-full gap-3 mb-6", isAssistant ? "justify-start" : "justify-end")}
    >
      {isAssistant && (
        <div className="h-8 w-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-800">
          {getIcon(message.type)}
        </div>
      )}

      <div className={cn(
        "relative group max-w-[85%] space-y-3",
        !isAssistant && "bg-indigo-600 text-white p-4 rounded-2xl rounded-tr-none shadow-md"
      )}>
        {isAssistant ? (
          <div className="bg-white dark:bg-gray-800 border border-border p-5 rounded-2xl rounded-tl-none shadow-sm space-y-4">
            {message.title && (
              <h4 className="font-black text-sm uppercase tracking-widest text-foreground/80 border-b pb-2">
                {message.title}
              </h4>
            )}
            
            <p className="text-sm font-medium leading-relaxed text-foreground/90">
              {message.content}
            </p>

            {message.bullets && message.bullets.length > 0 && (
              <ul className="space-y-2">
                {message.bullets.map((b, i) => (
                  <li key={i} className="text-xs font-bold text-muted-foreground flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            )}

            {message.actions && message.actions.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {message.actions.map((action, i) => (
                  <Button
                    key={i}
                    size="sm"
                    onClick={() => onAction?.(action)}
                    className="h-8 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-100 font-bold text-[10px] uppercase tracking-widest gap-2"
                  >
                    {action.label}
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm font-bold leading-relaxed">{message.content}</p>
        )}
      </div>

      {!isAssistant && (
        <div className="h-8 w-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 border border-border">
          <User className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
    </motion.div>
  );
};

export default ChatMessage;