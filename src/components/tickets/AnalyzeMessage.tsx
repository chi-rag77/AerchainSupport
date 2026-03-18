"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { 
  Bot, User, ArrowRight, Sparkles, Info, 
  Target, MessageSquare, Zap, ShieldAlert 
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AnalyzeMessageProps {
  message: {
    role: 'user' | 'assistant';
    content: string;
    cards?: any[];
    followUps?: string[];
  };
  onFollowUp: (query: string) => void;
}

const iconMap: Record<string, any> = {
  Target,
  MessageSquare,
  Zap,
  ShieldAlert,
  Info
};

const AnalyzeMessage = ({ message, onFollowUp }: AnalyzeMessageProps) => {
  const isAssistant = message.role === 'assistant';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-4",
        !isAssistant && "flex-row-reverse"
      )}
    >
      <div className={cn(
        "h-8 w-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm border",
        isAssistant ? "bg-indigo-600 text-white border-indigo-500" : "bg-white dark:bg-gray-800 text-foreground border-border"
      )}>
        {isAssistant ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
      </div>

      <div className={cn("space-y-4 flex-1 max-w-[85%]", !isAssistant && "text-right")}>
        {/* Text Content */}
        <div className={cn(
          "inline-block p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-sm border",
          isAssistant 
            ? "bg-white dark:bg-gray-800 border-border rounded-tl-none text-left" 
            : "bg-indigo-600 text-white border-indigo-500 rounded-tr-none text-left"
        )}>
          {message.content}
        </div>

        {/* Dynamic Cards */}
        {isAssistant && message.cards && message.cards.length > 0 && (
          <div className="space-y-3 mt-2">
            {message.cards.map((card, i) => {
              const Icon = iconMap[card.icon] || Info;
              return (
                <Card key={i} className={cn(
                  "border-none shadow-sm rounded-2xl overflow-hidden",
                  card.status === 'critical' ? "bg-rose-50 dark:bg-rose-950/20" : "bg-indigo-50/50 dark:bg-indigo-950/20"
                )}>
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <Icon className={cn("h-4 w-4", card.status === 'critical' ? "text-rose-600" : "text-indigo-600")} />
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest",
                        card.status === 'critical' ? "text-rose-600" : "text-indigo-600"
                      )}>
                        {card.title}
                      </span>
                    </div>
                    <p className="text-sm font-bold leading-relaxed text-foreground/90">
                      {card.content}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Follow-up Suggestions */}
        {isAssistant && message.followUps && message.followUps.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="w-full text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Ask Next:</span>
            {message.followUps.map((text) => (
              <Button
                key={text}
                variant="outline"
                size="sm"
                onClick={() => onFollowUp(text)}
                className="rounded-full h-8 px-4 text-[10px] font-bold border-indigo-100 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all"
              >
                {text}
                <ArrowRight className="h-3 w-3 ml-2 opacity-50" />
              </Button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AnalyzeMessage;