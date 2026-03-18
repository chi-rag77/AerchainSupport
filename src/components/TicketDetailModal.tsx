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
  Archive, Bell, Play, Search, ShieldAlert, Zap, Maximize2, Minimize2, ExternalLink, ChevronDown,
  History, Fingerprint, Activity, Layout, Send, Command
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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

  const getStatusIcon = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('open')) return <Hourglass className="h-3 w-3" />;
    if (s.includes('resolved')) return <CheckCircle className="h-3 w-3" />;
    if (s.includes('escalated')) return <ShieldAlert className="h-3 w-3" />;
    return <Activity className="h-3 w-3" />;
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="right" 
        className={cn(
          "flex flex-col p-0 overflow-hidden transition-all duration-500 ease-in-out border-l border-border shadow-2xl bg-background",
          isExpanded ? "sm:max-w-[75vw]" : "sm:max-w-[45vw]"
        )}
      >
        <TextSelectionAI />
        
        {/* 1. Header -> High Contrast Control Bar */}
        <SheetHeader className="p-5 bg-card border-b border-border sticky top-0 z-20">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 shrink-0">
                <Fingerprint className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase">Ticket #{ticket.id}</span>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="secondary" className="h-5 px-2 text-[9px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 gap-1 border border-indigo-100/50">
                      {getStatusIcon(ticket.status)}
                      {ticket.status}
                    </Badge>
                    <Badge variant="secondary" className="h-5 px-2 text-[9px] font-black uppercase tracking-widest bg-rose-50 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 gap-1 border border-rose-100/50">
                      <Zap className="h-3 w-3" />
                      {ticket.priority}
                    </Badge>
                  </div>
                </div>
                <SheetTitle className="text-xl font-black truncate text-foreground mt-0.5 tracking-tight">{ticket.subject}</SheetTitle>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-9 w-9 rounded-xl hover:bg-accent text-muted-foreground hover:text-foreground transition-all"
              >
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Separator orientation="vertical" className="h-5 mx-1" />
              <Button 
                onClick={handleAIAnalyze} 
                disabled={isAnalyzing}
                className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
              >
                {isAnalyzing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                AI Intelligence
              </Button>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 flex overflow-hidden relative">
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* 2. Mode Switcher */}
            <div className="px-6 py-3 border-b border-border flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
              <div className="flex items-center p-1 bg-white dark:bg-gray-800 rounded-xl border border-border shadow-sm">
                {(['agent', 'manager', 'ai'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setActiveMode(mode)}
                    className={cn(
                      "h-8 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                      activeMode === mode 
                        ? "bg-indigo-600 text-white shadow-md" 
                        : "text-muted-foreground hover:text-foreground hover:bg-gray-50 dark:hover:bg-gray-700"
                    )}
                  >
                    {mode === 'agent' && <User className="h-3.5 w-3.5" />}
                    {mode === 'manager' && <Shield className="h-3.5 w-3.5" />}
                    {mode === 'ai' && <Brain className="h-3.5 w-3.5" />}
                    {mode}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-8 px-3 text-[10px] font-bold gap-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg">
                  <Search className="h-3.5 w-3.5" /> Knowledge Base
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsAIWorkspaceOpen(!isAIWorkspaceOpen)}
                  className={cn(
                    "h-8 px-3 text-[10px] font-bold gap-2 rounded-lg transition-all", 
                    isAIWorkspaceOpen ? "bg-indigo-600 text-white shadow-md" : "text-muted-foreground hover:bg-accent"
                  )}
                >
                  <Layout className="h-3.5 w-3.5" /> Workspace
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10">
              {/* 3. Metadata Tiles */}
              <div className="grid grid-cols-3 gap-6">
                <div className="p-5 rounded-[24px] bg-blue-50/30 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 shadow-sm space-y-3 group hover:border-blue-300 transition-all">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 flex items-center gap-2">
                    <User className="h-4 w-4" /> Requester
                  </span>
                  <div className="space-y-1">
                    <p className="text-sm font-bold truncate text-foreground">{ticket.requester_email}</p>
                    <p className="text-[11px] font-bold text-blue-500 uppercase tracking-tighter flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5" /> {ticket.cf_company || 'No Company'}
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-[24px] bg-purple-50/30 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30 shadow-sm space-y-3 group hover:border-purple-300 transition-all">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-600 flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" /> Timeline
                  </span>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-foreground">Created {format(new Date(ticket.created_at), 'MMM dd')}</p>
                    <p className="text-[11px] font-medium text-purple-500 flex items-center gap-1.5">
                      <History className="h-3.5 w-3.5" /> Updated {formatDistanceToNowStrict(parseISO(ticket.updated_at))} ago
                    </p>
                  </div>
                </div>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="p-5 rounded-[24px] bg-amber-50/30 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 shadow-sm space-y-3 cursor-help group hover:border-amber-300 transition-all">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 flex items-center gap-2">
                          <Timer className="h-4 w-4" /> Status Aging
                        </span>
                        <div className="space-y-1">
                          <p className="text-sm font-black text-amber-700 dark:text-amber-300">{ticket.status}</p>
                          <p className="text-[11px] font-bold text-amber-500 uppercase tracking-tighter flex items-center gap-1.5">
                            <Activity className="h-3.5 w-3.5" /> Active: {formatDistanceToNowStrict(parseISO(ticket.updated_at))}
                          </p>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="p-4 rounded-2xl shadow-2xl border-none bg-gray-900 text-white">
                      <div className="space-y-2">
                        <p className="font-black text-[10px] uppercase tracking-widest opacity-50">Lifecycle Breakdown</p>
                        <div className="flex justify-between gap-8 text-xs"><span className="font-medium">Open:</span> <span className="font-black">12h</span></div>
                        <div className="flex justify-between gap-8 text-xs"><span className="font-medium">On Tech:</span> <span className="font-black">2d 4h</span></div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* 4. Inline Action */}
              {!isExpanded && (
                <div className="flex justify-center">
                  <Button variant="outline" className="h-11 px-10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] gap-2.5 border-dashed border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 shadow-sm transition-all hover:scale-105">
                    <Search className="h-4 w-4" /> Check Impact Lens
                  </Button>
                </div>
              )}

              <Separator className="opacity-50" />

              {/* 5. Conversation Thread */}
              <div className="space-y-8">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2.5 text-foreground">
                    <MessageSquare className="h-4.5 w-4.5 text-indigo-600" />
                    Conversation Thread
                  </h3>
                  {!isExpanded && (
                    <Button variant="link" size="sm" onClick={() => setIsExpanded(true)} className="h-auto p-0 text-[10px] font-bold text-indigo-600 gap-1.5 hover:no-underline group">
                      View Full History <ChevronDown className="h-3.5 w-3.5 group-hover:translate-y-0.5 transition-transform" />
                    </Button>
                  )}
                </div>

                {isLoadingMessages ? (
                  <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                    <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Loading Thread...</p>
                  </div>
                ) : (
                  <div className="space-y-10 relative before:absolute before:left-5 before:top-0 before:h-full before:w-0.5 before:bg-gray-100 dark:before:bg-gray-800">
                    {allMessages.map((message) => (
                      <div key={message.id} className={cn("relative flex gap-6 group", message.is_agent ? "flex-row-reverse" : "flex-row")}>
                        <div className="absolute left-5 top-3 h-2.5 w-2.5 rounded-full bg-indigo-600 z-10 ring-4 ring-background" />
                        
                        <Avatar className="h-11 w-11 flex-shrink-0 border-2 border-background shadow-lg group-hover:scale-110 transition-transform">
                          <AvatarFallback className={cn("text-[10px] font-black", message.is_agent ? "bg-indigo-600 text-white" : "bg-gray-100 text-muted-foreground")}>
                            {message.sender.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className={cn("flex-1 space-y-3", message.is_agent ? "text-right" : "text-left")}>
                          <div className={cn("flex items-center gap-3 mb-1", message.is_agent ? "justify-end" : "justify-start")}>
                            <span className="font-black text-[10px] uppercase tracking-widest text-foreground">{message.sender.split('@')[0]}</span>
                            <span className="text-[9px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                              <Clock className="h-2.5 w-2.5" />
                              {format(new Date(message.created_at), 'MMM dd · HH:mm')}
                            </span>
                          </div>

                          <div className={cn(
                            "inline-block p-6 rounded-[24px] text-sm font-medium leading-relaxed shadow-sm border transition-all group-hover:shadow-xl",
                            message.is_agent 
                              ? "bg-indigo-50/40 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800 rounded-tr-none" 
                              : "bg-white dark:bg-gray-800 border-border rounded-tl-none"
                          )}>
                            <div dangerouslySetInnerHTML={{ __html: message.body_html || '' }} className="prose prose-sm dark:prose-invert max-w-none break-words text-foreground" />
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

        {/* 7. Footer */}
        <div className="p-5 bg-card border-t border-border flex justify-between items-center shadow-inner">
          <div className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            <Command className="h-4 w-4" />
            Triage Mode Active
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="h-11 px-6 rounded-xl font-bold text-xs border-border gap-2.5 hover:bg-gray-50 transition-all" asChild>
              <a href={`http://aerchain.freshdesk.com/a/tickets/${ticket.id}`} target="_blank" rel="noopener noreferrer">
                Freshdesk <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
            <Button onClick={onClose} className="h-11 px-10 rounded-xl font-bold text-xs bg-gray-900 text-white hover:bg-gray-800 shadow-xl shadow-gray-900/20 transition-all active:scale-95">Close Workspace</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TicketDetailModal;