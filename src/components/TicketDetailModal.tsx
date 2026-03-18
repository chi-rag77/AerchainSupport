"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Ticket } from "@/features/tickets/types";
import { format, isPast, parseISO, formatDistanceToNowStrict } from 'date-fns';
import {
  Loader2, AlertCircle, CheckCircle, Hourglass, Clock, Users, Shield, Laptop, XCircle,
  Tag, Building2, MessageSquare, CalendarDays, User, Info, RefreshCw, Brain, Sparkles, Timer,
  Archive, Bell, Play, Search, ShieldAlert, Zap, Maximize2, Minimize2, ExternalLink, ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTicketMessages } from '@/features/tickets/hooks/useTicketMessages';
import { useTicketAIAnalysis } from '@/features/ticket-ai/hooks/useTicketAIAnalysis';
import AIWorkspacePanel from './tickets/AIWorkspacePanel';
import MessageAIAction from './tickets/MessageAIAction';
import TextSelectionAI from './tickets/TextSelectionAI';

interface TicketDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket | null;
}

const TicketDetailModal = ({ isOpen, onClose, ticket }: TicketDetailModalProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeMode, setActiveMode] = useState<'agent' | 'manager' | 'ai'>('agent');
  const [isAIWorkspaceOpen, setIsAIWorkspaceOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { conversationMessages, isLoadingMessages, syncMessages } = useTicketMessages(ticket?.id || null);
  const { analysis, refreshAnalysis } = useTicketAIAnalysis(ticket?.id || null, ticket?.cf_company || 'Unknown');

  const allMessages = useMemo(() => {
    if (!ticket) return [];
    const initialMessage = {
      id: 'initial-description',
      ticket_id: ticket.id,
      sender: ticket.requester_email,
      body_html: ticket.description_html || ticket.description_text || 'No description provided.',
      created_at: ticket.created_at,
      is_agent: false,
    };
    // In Peek mode, we only show the last 2 messages + initial description
    const msgs = [...conversationMessages, initialMessage];
    return isExpanded ? msgs : msgs.slice(0, 3);
  }, [ticket, conversationMessages, isExpanded]);

  useEffect(() => {
    if (isOpen && ticket?.id) {
      syncMessages();
      setIsExpanded(false);
      setIsAIWorkspaceOpen(false);
    }
  }, [isOpen, ticket?.id]);

  if (!ticket) return null;

  const handleAIAnalyze = async () => {
    setIsAnalyzing(true);
    await refreshAnalysis();
    setIsAnalyzing(false);
    setIsAIWorkspaceOpen(true);
    setIsExpanded(true);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="right" 
        className={cn(
          "flex flex-col p-0 overflow-hidden transition-all duration-500 ease-in-out border-l border-border shadow-2xl",
          isExpanded ? "sm:max-w-[70vw]" : "sm:max-w-[45vw]"
        )}
        style={{ backdropFilter: 'blur(12px)', backgroundColor: 'rgba(var(--background), 0.85)' }}
      >
        <TextSelectionAI />
        
        {/* 1. Compact Action Control Bar */}
        <SheetHeader className="p-4 bg-white/50 dark:bg-gray-900/50 border-b border-border sticky top-0 z-20">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-lg font-black tracking-tighter text-muted-foreground shrink-0">#{ticket.id}</span>
              <SheetTitle className="text-base font-bold truncate">{ticket.subject}</SheetTitle>
              <div className="flex items-center gap-1.5 shrink-0">
                <Badge variant="outline" className="h-5 px-2 text-[9px] font-black uppercase tracking-widest border-indigo-100 text-indigo-600">
                  {ticket.status}
                </Badge>
                <Badge variant="outline" className="h-5 px-2 text-[9px] font-black uppercase tracking-widest border-rose-100 text-rose-600">
                  {ticket.priority}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-8 w-8 rounded-lg hover:bg-indigo-50 text-indigo-600"
              >
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Separator orientation="vertical" className="h-4 mx-1" />
              <Button 
                onClick={handleAIAnalyze} 
                disabled={isAnalyzing}
                variant="ghost"
                className="h-8 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest gap-1.5 text-indigo-600 hover:bg-indigo-50"
              >
                {isAnalyzing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
                AI Analyze
              </Button>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 flex overflow-hidden relative">
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* 2. High-Density Mode Switcher */}
            <div className="px-4 py-2 border-b border-border flex items-center justify-between bg-gray-50/30 dark:bg-gray-900/30">
              <div className="flex items-center p-0.5 bg-white dark:bg-gray-800 rounded-lg border border-border shadow-sm">
                {(['agent', 'manager', 'ai'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setActiveMode(mode)}
                    className={cn(
                      "h-6 px-3 rounded-md text-[9px] font-black uppercase tracking-widest transition-all",
                      activeMode === mode ? "bg-indigo-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] font-bold gap-1.5 text-indigo-600 hover:bg-indigo-50">
                  <Search className="h-3 w-3" /> KB
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsAIWorkspaceOpen(!isAIWorkspaceOpen)}
                  className={cn("h-7 px-2 text-[10px] font-bold gap-1.5", isAIWorkspaceOpen ? "text-indigo-600 bg-indigo-50" : "text-muted-foreground")}
                >
                  <Brain className="h-3 w-3" /> Workspace
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* 3. Compact Insight Tiles (Single Row) */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-border/50 shadow-sm space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                    <User className="h-3 w-3" /> Requester
                  </span>
                  <p className="text-xs font-bold truncate">{ticket.requester_email}</p>
                  <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-tighter">{ticket.cf_company || 'No Company'}</p>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-border/50 shadow-sm space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" /> Timeline
                  </span>
                  <p className="text-xs font-bold">Created {format(new Date(ticket.created_at), 'MMM dd')}</p>
                  <p className="text-[10px] font-medium text-muted-foreground">Updated {formatDistanceToNowStrict(parseISO(ticket.updated_at))} ago</p>
                </div>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-900/50 shadow-sm space-y-1 cursor-help">
                        <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600 flex items-center gap-1">
                          <Timer className="h-3 w-3" /> Status Aging
                        </span>
                        <p className="text-xs font-black text-indigo-700 dark:text-indigo-300">{ticket.status}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Active: {formatDistanceToNowStrict(parseISO(ticket.updated_at))}</p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="p-3 rounded-xl shadow-2xl border-none bg-gray-900 text-white">
                      <div className="space-y-1.5">
                        <p className="font-black text-[9px] uppercase tracking-widest opacity-50">Lifecycle Breakdown</p>
                        <div className="flex justify-between gap-6 text-[10px]"><span className="font-medium">Open:</span> <span className="font-black">12h</span></div>
                        <div className="flex justify-between gap-6 text-[10px]"><span className="font-medium">On Tech:</span> <span className="font-black">2d 4h</span></div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* 4. Inline Impact Lens */}
              {!isExpanded && (
                <div className="flex justify-center">
                  <Button variant="ghost" className="h-8 px-4 rounded-full text-[10px] font-black uppercase tracking-widest gap-2 border border-dashed border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                    <Search className="h-3 w-3" /> Check Impact
                  </Button>
                </div>
              )}

              <Separator className="opacity-50" />

              {/* 5. Scrollable Conversation Thread */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    <MessageSquare className="h-3.5 w-3.5 text-indigo-600" />
                    Conversation
                  </h3>
                  {!isExpanded && (
                    <Button variant="link" size="sm" onClick={() => setIsExpanded(true)} className="h-auto p-0 text-[10px] font-bold">
                      View All Thread <ChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                  )}
                </div>

                {isLoadingMessages ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin text-indigo-600 mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">Loading...</p>
                  </div>
                ) : (
                  <div className="space-y-6 relative before:absolute before:left-4 before:top-0 before:h-full before:w-0.5 before:bg-gray-100 dark:before:bg-gray-800">
                    {allMessages.map((message) => (
                      <div key={message.id} className={cn("relative flex gap-4 group", message.is_agent ? "flex-row-reverse" : "flex-row")}>
                        <div className="absolute left-4 top-2 h-1.5 w-1.5 rounded-full bg-indigo-600 z-10 ring-4 ring-white dark:ring-gray-950" />
                        
                        <Avatar className="h-8 w-8 flex-shrink-0 border border-white dark:border-gray-900 shadow-sm">
                          <AvatarFallback className={cn("text-[10px] font-black", message.is_agent ? "bg-indigo-600 text-white" : "bg-gray-200")}>
                            {message.sender.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className={cn("flex-1 space-y-2", message.is_agent ? "text-right" : "text-left")}>
                          <div className={cn("flex items-center gap-2 mb-0.5", message.is_agent ? "justify-end" : "justify-start")}>
                            <span className="font-black text-[10px] uppercase tracking-widest">{message.sender.split('@')[0]}</span>
                            <span className="text-[9px] font-bold text-muted-foreground uppercase">{format(new Date(message.created_at), 'MMM dd · HH:mm')}</span>
                          </div>

                          <div className={cn(
                            "inline-block p-4 rounded-2xl text-xs font-medium leading-relaxed shadow-sm border transition-all group-hover:shadow-md",
                            message.is_agent 
                              ? "bg-indigo-50/30 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-800 rounded-tr-none" 
                              : "bg-white dark:bg-gray-800 border-border rounded-tl-none"
                          )}>
                            <div dangerouslySetInnerHTML={{ __html: message.body_html || '' }} className="prose prose-xs dark:prose-invert max-w-none break-words" />
                            <MessageAIAction 
                              content={message.body_html || ""} 
                              onResult={(res) => toast.info(res, { duration: 5000 })} 
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 6. Right Panel -> AI Workspace */}
          <AIWorkspacePanel 
            isOpen={isAIWorkspaceOpen} 
            onClose={() => setIsAIWorkspaceOpen(false)} 
            ticket={ticket}
          />
        </div>

        {/* 7. Compact Footer */}
        <div className="p-3 bg-white dark:bg-gray-900 border-t border-border flex justify-between items-center">
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
            <Info className="h-3 w-3" />
            Triage Mode
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="h-9 px-4 rounded-xl font-bold text-xs" asChild>
              <a href={`http://aerchain.freshdesk.com/a/tickets/${ticket.id}`} target="_blank" rel="noopener noreferrer">
                Freshdesk <ExternalLink className="ml-1.5 h-3 w-3" />
              </a>
            </Button>
            <Button onClick={onClose} className="h-9 px-6 rounded-xl font-bold text-xs bg-gray-900 text-white hover:bg-gray-800">Close</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TicketDetailModal;