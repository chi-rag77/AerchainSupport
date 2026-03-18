"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { 
  Bot, User, ArrowRight, Sparkles, Info, 
  Target, MessageSquare, Zap, ShieldAlert,
  Clock, CheckCircle2, AlertCircle
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, parseISO } from 'date-fns';

interface AnalyzeMessageProps {
  message: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp?: string;
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
  
  // Helper to highlight keywords
  const highlightText = (text: string) => {
    const keywords = [
      { word: 'Completed', color: 'text-green-600 dark:text-green-400 font-bold' },
      { word: 'Delayed', color: 'text-amber-600 dark:text-amber-400 font-bold' },
      { word: 'Blocked', color: 'text-red-600 dark:text-red-400 font-bold' },
      { word: 'Critical', color: 'text-red-600 dark:text-red-400 font-bold' },
    ];

    let highlighted = text;
    keywords.forEach(({ word, color }) => {
      const regex = new RegExp(`(${word})`, 'gi');
      highlighted = highlighted.replace(regex, `<span class="${color}">$1</span>`);
    });
    return highlighted;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-4 w-full group",
        !isAssistant && "flex-row-reverse"
      )}
    >
      {/* Scan-Line Avatar */}
      <div className={cn(
        "h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border transition-transform group-hover:scale-105",
        isAssistant 
          ? "bg-indigo-600 text-white border-indigo-500 shadow-indigo-200/50" 
          : "bg-white dark:bg-gray-800 text-foreground border-border"
      )}>
        {isAssistant ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
      </div>

      <div className={cn(
        "space-y-3 flex-1 max-w-[700px]", // Capped width for readability
        !isAssistant && "text-right"
      )}>
        {/* Metadata Header */}
        <div className={cn(
          "flex items-center gap-3 px-1",
          !isAssistant && "flex-row-reverse"
        )}>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-gray-100">
            {isAssistant ? "Support Brain AI" : "You"}
          </span>
          <span className="text-[9px] font-bold text-muted-foreground uppercase flex items-center gap-1">
            <Clock className="h-2.5 w-2.5" />
            {message.timestamp ? format(parseISO(message.timestamp), 'HH:mm') : 'Just now'}
          </span>
        </div>

        {/* Message Bubble */}
        <div className={cn(
          "relative p-5 rounded-[24px] text-[15px] font-medium leading-[1.7] shadow-sm border transition-all",
          isAssistant 
            ? "bg-indigo-50/30 dark:bg-indigo-950/10 border-indigo-100/50 dark:border-indigo-900/30 rounded-tl-none text-left text-gray-800 dark:text-gray-200" 
            : "bg-white dark:bg-gray-800 border-border rounded-tr-none text-left text-gray-900 dark:text-gray-100"
        )}>
          <div 
            dangerouslySetInnerHTML={{ __html: highlightText(message.content) }} 
            className="whitespace-pre-wrap"
          />
        </div>

        {/* Dynamic Insight Cards */}
        {isAssistant && message.cards && message.cards.length > 0 && (
          <div className="space-y-3 mt-4">
            {message.cards.map((card, i) => {
              const Icon = iconMap[card.icon] || Info;
              const isCritical = card.status === 'critical';
              
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className={cn(
                    "border-none shadow-md rounded-[20px] overflow-hidden transition-all hover:shadow-lg",
                    isCritical ? "bg-rose-50/50 dark:bg-rose-950/20" : "bg-white dark:bg-gray-800"
                  )}>
                    <CardContent className="p-0 flex items-stretch">
                      {/* Left Accent Border */}
                      <div className={cn(
                        "w-1.5 shrink-0",
                        isCritical ? "bg-rose-500" : "bg-indigo-500"
                      )} />
                      
                      <div className="p-5 space-y-3 flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "p-1.5 rounded-lg",
                              isCritical ? "bg-rose-100 text-rose-600" : "bg-indigo-50 text-indigo-600"
                            )}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <span className={cn(
                              "text-[10px] font-black uppercase tracking-[0.15em]",
                              isCritical ? "text-rose-600" : "text-indigo-600"
                            )}>
                              {card.title}
                            </span>
                          </div>
                          {isCritical && (
                            <Badge className="bg-rose-500 text-white border-none text-[9px] font-black uppercase">
                              Action Required
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm font-bold leading-relaxed text-foreground/90">
                          {card.content}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Follow-up Suggestions */}
        {isAssistant && message.followUps && message.followUps.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 justify-start">
            <div className="w-full flex items-center gap-2 mb-1">
              <Sparkles className="h-3 w-3 text-indigo-500" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Suggested Next Steps</span>
            </div>
            {message.followUps.map((text) => (
              <Button
                key={text}
                variant="outline"
                size="sm"
                onClick={() => onFollowUp(text)}
                className="rounded-full h-8 px-4 text-[10px] font-bold border-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm"
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