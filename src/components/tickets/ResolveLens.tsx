"use client";

import React from 'react';
import { Ticket, TicketMessage } from '@/features/tickets/types';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageSquare, Sparkles, Pin, Link as LinkIcon, 
  Zap, Clock, Send, CornerDownLeft, CheckCircle2,
  History, AlertCircle
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import MessageAIAction from './MessageAIAction';

interface ResolveLensProps {
  ticket: Ticket;
  messages: TicketMessage[];
  onGenerateReply: () => void;
}

const ResolveLens = ({ ticket, messages, onGenerateReply }: ResolveLensProps) => {
  return (
    <div className="flex flex-col h-full space-y-6">
      {/* 1. Lightweight Context Bar */}
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-indigo-50/30 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/50">
        <div className="flex items-center gap-2 border-r border-indigo-100 dark:border-indigo-800 pr-4">
          <History className="h-4 w-4 text-indigo-600" />
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">History:</span>
          <Badge variant="secondary" className="bg-white dark:bg-gray-800 text-[10px] font-bold">5 Past Tickets</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-600" />
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">SLA:</span>
          <span className="text-xs font-bold text-amber-700 dark:text-amber-400">2h 15m remaining</span>
        </div>
      </div>

      {/* 2. Conversation Thread */}
      <div className="flex-1 space-y-8 relative before:absolute before:left-5 before:top-0 before:h-full before:w-0.5 before:bg-gray-100 dark:before:bg-gray-800">
        {messages.map((message) => (
          <div key={message.id} className={cn("relative flex gap-5 group", message.is_agent ? "flex-row-reverse" : "flex-row")}>
            <div className="absolute left-5 top-2.5 h-2 w-2 rounded-full bg-indigo-600 z-10 ring-4 ring-background" />
            
            <Avatar className="h-10 w-10 flex-shrink-0 border-2 border-background shadow-md">
              <AvatarFallback className={cn("text-[10px] font-black", message.is_agent ? "bg-indigo-600 text-white" : "bg-gray-100 text-muted-foreground")}>
                {message.sender.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className={cn("flex-1 space-y-2", message.is_agent ? "text-right" : "text-left")}>
              <div className={cn("flex items-center gap-3 mb-1", message.is_agent ? "justify-end" : "justify-start")}>
                <span className="font-black text-[10px] uppercase tracking-widest text-foreground">{message.sender.split('@')[0]}</span>
                <span className="text-[9px] font-bold text-muted-foreground uppercase">{format(parseISO(message.created_at), 'MMM dd · HH:mm')}</span>
              </div>

              <div className={cn(
                "inline-block p-5 rounded-2xl text-sm font-medium leading-relaxed shadow-sm border transition-all group-hover:shadow-md",
                message.is_agent 
                  ? "bg-indigo-50/40 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800 rounded-tr-none" 
                  : "bg-white dark:bg-gray-800 border-border rounded-tl-none"
              )}>
                <div dangerouslySetInnerHTML={{ __html: message.body_html || '' }} className="prose prose-sm dark:prose-invert max-w-none break-words text-foreground" />
                
                {/* Inline Actions */}
                <div className="flex items-center gap-1 mt-4 pt-3 border-t border-border/50 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-[9px] font-black uppercase gap-1.5 hover:bg-indigo-50 text-indigo-600">
                    <CornerDownLeft className="h-3 w-3" /> Reply
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-[9px] font-black uppercase gap-1.5 hover:bg-amber-50 text-amber-600">
                    <Pin className="h-3 w-3" /> Important
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-[9px] font-black uppercase gap-1.5 hover:bg-blue-50 text-blue-600">
                    <LinkIcon className="h-3 w-3" /> Link KB
                  </Button>
                  <div className="ml-auto">
                    <MessageAIAction content={message.body_html || ""} onResult={() => {}} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Smart Reply Assistant Trigger */}
      <div className="sticky bottom-0 pt-4 bg-background/80 backdrop-blur-sm">
        <div className="p-4 rounded-2xl border-2 border-dashed border-indigo-200 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-950/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-600 text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold">Smart Reply Assistant</p>
              <p className="text-[10px] text-muted-foreground">Generate a contextual response based on thread history.</p>
            </div>
          </div>
          <Button onClick={onGenerateReply} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] uppercase tracking-widest h-9 px-4 rounded-xl gap-2">
            Generate Reply <Zap className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResolveLens;