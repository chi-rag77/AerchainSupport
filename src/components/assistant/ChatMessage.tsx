"use client";

import React from 'react';
import { ChatMessage as ChatMessageType } from '@/features/assistant/types';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Brain, User, Copy, Check, Zap, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isAssistant = message.role === 'assistant';
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex w-full gap-3 mb-4",
        isAssistant ? "justify-start" : "justify-end"
      )}
    >
      {isAssistant && (
        <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-800">
          <Brain className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        </div>
      )}

      <div className={cn(
        "relative group max-w-[85%] rounded-2xl text-sm shadow-sm",
        isAssistant 
          ? "bg-white dark:bg-gray-800 text-foreground border border-border rounded-tl-none" 
          : "bg-indigo-600 text-white rounded-tr-none"
      )}>
        <div className="p-3 leading-relaxed">
          {message.content}
        </div>
        
        {isAssistant && message.mode && (
          <div className="px-3 pb-2 flex items-center gap-2 text-muted-foreground border-t border-border/50 mt-2 pt-2">
            {message.mode === 'ai' ? (
              <Zap className="h-3 w-3 text-purple-500" />
            ) : (
              <AlertTriangle className="h-3 w-3 text-amber-500" />
            )}
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {message.mode === 'ai' ? 'AI Generated' : 'Rule-Based Fallback'}
            </span>
          </div>
        )}

        {isAssistant && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="absolute -right-10 top-0 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
          >
            {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
          </Button>
        )}
      </div>

      {!isAssistant && (
        <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 border border-border">
          <User className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
    </motion.div>
  );
};

export default ChatMessage;