"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Ticket } from "@/features/tickets/types";
import { format, isPast, parseISO, formatDistanceToNowStrict } from 'date-fns';
import {
  Loader2, AlertCircle, Copy, CheckCircle, Hourglass, Clock, Users, Shield, Laptop, XCircle,
  Tag, Building2, MessageSquare, CalendarDays, User, Info, RefreshCw, Brain, Sparkles, Timer,
  Archive, Bell, Play, Search, LayoutDashboard, ShieldAlert, Zap, ChevronRight, ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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
  const [activeMode, setActiveMode] = useState<'agent' | 'manager' | 'ai'>('agent');
  const [isAIWorkspaceOpen, setIsAIWorkspaceOpen] = useState(false);
  const [conversationView, setConversationView] = useState<'standard' | 'ai'>('standard');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { conversationMessages, isLoadingMessages, isFetchingMessages, syncMessages } = useTicketMessages(ticket?.id || null);
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
    return [...conversationMessages, initialMessage];
  }, [ticket, conversationMessages]);

  useEffect(() => {
    if (isOpen && ticket?.id) {
      syncMessages();
      setIsAIWorkspaceOpen(false);
      setConversationView('standard');
    }
  }, [isOpen, ticket?.id]);

  if (!ticket) return null;

  const handleAIAnalyze = async () => {
    setIsAnalyzing(true);
    await refreshAnalysis();
    setIsAnalyzing(false);
    setIsAIWorkspaceOpen(true);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-[90vw] lg:max-w-[75vw] flex flex-col p-0 overflow-hidden">
        <TextSelectionAI />
        
        {/* 1. Header -> Action Control Bar */}
        <SheetHeader className="p-6 pb-4 bg-white dark:bg-gray-900 border-b border-border sticky top-0 z-20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black tracking-tighter text-muted-foreground">#{ticket.id}</span>
                <SheetTitle className="text-2xl font-black tracking-tight">{ticket.subject}</SheetTitle>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="rounded-full font-bold text-[10px] uppercase tracking-widest border-2">
                  {ticket.status}
                </Badge>
                <Badge variant="outline" className="rounded-full font-bold text-[10px] uppercase tracking-widest border-2">
                  {ticket.priority} Priority
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-1.5 rounded-2xl border border-border shadow-sm">
              <Button 
                onClick={handleAIAnalyze} 
                disabled={isAnalyzing}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[10px] h-10 px-5 rounded-xl gap-2 shadow-lg shadow-indigo-500/20"
              >
                {isAnalyzing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
                AI Analyze ⚡
              </Button>
              <Separator orientation="vertical" className="h-6 mx-1" />
              <Button variant="ghost" size="sm" className="h-10 px-4 rounded-xl font-bold text-xs gap-2">
                <Play className="h-3.5 w-3.5" /> Reopen
              </Button>
              <Button variant="ghost" size="sm" className="h-10 px-4 rounded-xl font-bold text-xs gap-2">
                <Archive className="h-3.5 w-3.5" /> Archive
              </Button>
              <Button variant="ghost" size="sm" className="h-10 px-4 rounded-xl font-bold text-xs gap-2">
                <Bell className="h-3.5 w-3.5" /> Notify
              </Button>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 flex overflow-hidden relative">
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Mode Switcher */}
            <div className="px-8 py-4 border-b border-border flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
              <div className="flex items-center p-1 bg-white dark:bg-gray-800 rounded-xl border border-border shadow-sm">
                {(['agent', 'manager', 'ai'] as const).map((mode) => (
                  <Button
                    key={mode}
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveMode(mode)}
                    className={cn(
                      "h-8 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                      activeMode === mode ? "bg-indigo-600 text-white shadow-md" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {mode} Mode
                  </Button>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" className="font-bold text-xs gap-2 text-indigo-600">
                  <Search className="h-3.5 w-3.5" /> Search Knowledge 📚
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsAIWorkspaceOpen(!isAIWorkspaceOpen)}
                  className={cn("font-bold text-xs gap-2", isAIWorkspaceOpen ? "text-indigo-600" : "text-muted-foreground")}
                >
                  <Brain className="h-3.5 w-3.5" /> AI Workspace
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-12">
              {/* 3. Insight Tiles -> Expandable Intelligence */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-sm bg-white dark:bg-gray-800 rounded-[24px] overflow-hidden group">
                  <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <User className="h-4 w-4" /> Requester
                    </CardTitle>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg opacity-0 group-hover:opacity-100 text-indigo-600 hover:bg-indigo-50 transition-all">
                      <Zap className="h-3.5 w-3.5" />
                    </Button>
                  </CardHeader>
                  <CardContent className="p-6 pt-0 space-y-1">
                    <p className="font-black text-foreground truncate">{ticket.requester_email}</p>
                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-tighter">{ticket.cf_company || 'No Company'}</p>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white dark:bg-gray-800 rounded-[24px] overflow-hidden group">
                  <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" /> Timeline
                    </CardTitle>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg opacity-0 group-hover:opacity-100 text-indigo-600 hover:bg-indigo-50 transition-all">
                      <Zap className="h-3.5 w-3.5" />
                    </Button>
                  </CardHeader>
                  <CardContent className="p-6 pt-0 space-y-1">
                    <p className="text-sm font-bold">Created {format(new Date(ticket.created_at), 'MMM dd, HH:mm')}</p>
                    <p className="text-xs font-medium text-muted-foreground">Last updated {formatDistanceToNowStrict(parseISO(ticket.updated_at))} ago</p>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-indigo-50/30 dark:bg-indigo-950/10 rounded-[24px] overflow-hidden group">
                  <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2">
                      <Timer className="h-4 w-4" /> Status Aging
                    </CardTitle>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-indigo-600 hover:bg-indigo-100 transition-all">
                          <Info className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="p-4 rounded-xl shadow-2xl border-none">
                        <div className="space-y-2">
                          <p className="font-black text-[10px] uppercase tracking-widest">Lifecycle Breakdown</p>
                          <div className="space-y-1">
                            <div className="flex justify-between gap-8 text-xs"><span className="font-medium">Open:</span> <span className="font-black">12h</span></div>
                            <div className="flex justify-between gap-8 text-xs"><span className="font-medium">On Tech:</span> <span className="font-black">2d 4h</span></div>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </CardHeader>
                  <CardContent className="p-6 pt-0 space-y-1">
                    <p className="text-lg font-black text-indigo-700 dark:text-indigo-300">{ticket.status}</p>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">Active for {formatDistanceToNowStrict(parseISO(ticket.updated_at))}</p>
                  </CardContent>
                </Card>
              </div>

              {/* 4. Impact Lens -> On-Demand Analysis */}
              <div className="flex items-center justify-center">
                <Button variant="outline" className="rounded-full h-12 px-8 font-black uppercase tracking-widest text-xs gap-3 border-2 border-dashed border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 transition-all">
                  <Search className="h-4 w-4" />
                  Check Impact 🔍
                </Button>
              </div>

              <Separator className="opacity-50" />

              {/* 2. Conversation -> Dual Mode */}
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
                    <MessageSquare className="h-6 w-6 text-indigo-600" />
                    Conversation Thread
                  </h3>
                  
                  <div className="flex items-center p-1 bg-gray-100 dark:bg-gray-800 rounded-xl border border-border">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setConversationView('standard')}
                      className={cn("h-8 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest", conversationView === 'standard' && "bg-white dark:bg-gray-700 shadow-sm")}
                    >
                      Standard View
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setConversationView('ai')}
                      className={cn("h-8 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest gap-2", conversationView === 'ai' && "bg-white dark:bg-gray-700 shadow-sm text-indigo-600")}
                    >
                      <Sparkles className="h-3 w-3" />
                      AI Insights
                    </Button>
                  </div>
                </div>

                {isLoadingMessages ? (
                  <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                    <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
                    <p className="text-sm font-bold uppercase tracking-widest animate-pulse">Loading Thread...</p>
                  </div>
                ) : (
                  <div className="space-y-10 relative before:absolute before:left-5 before:top-0 before:h-full before:w-0.5 before:bg-gray-100 dark:before:bg-gray-800">
                    {allMessages.map((message) => (
                      <div key={message.id} className={cn("relative flex gap-6 group", message.is_agent ? "flex-row-reverse" : "flex-row")}>
                        <div className="absolute left-5 top-2 h-2 w-2 rounded-full bg-indigo-600 z-10 ring-4 ring-white dark:ring-gray-950" />
                        
                        <Avatar className="h-10 w-10 flex-shrink-0 border-2 border-white dark:border-gray-900 shadow-sm">
                          <AvatarFallback className={cn("text-xs font-black", message.is_agent ? "bg-indigo-600 text-white" : "bg-gray-200")}>
                            {message.sender.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className={cn(
                          "flex-1 space-y-3",
                          message.is_agent ? "text-right" : "text-left"
                        )}>
                          <div className={cn("flex items-center gap-3 mb-1", message.is_agent ? "justify-end" : "justify-start")}>
                            <span className="font-black text-xs uppercase tracking-widest">{message.sender}</span>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">{format(new Date(message.created_at), 'MMM dd · HH:mm')}</span>
                          </div>

                          <div className={cn(
                            "inline-block p-6 rounded-[28px] text-sm font-medium leading-relaxed shadow-sm border transition-all group-hover:shadow-md",
                            message.is_agent 
                              ? "bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800 rounded-tr-none" 
                              : "bg-white dark:bg-gray-800 border-border rounded-tl-none"
                          )}>
                            <div dangerouslySetInnerHTML={{ __html: message.body_html || '' }} className="prose prose-sm dark:prose-invert max-w-none break-words" />
                            
                            {/* 7. Message-Level AI */}
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

          {/* 5. Right Panel -> AI Workspace */}
          <AIWorkspacePanel 
            isOpen={isAIWorkspaceOpen} 
            onClose={() => setIsAIWorkspaceOpen(false)} 
            ticket={ticket}
          />
        </div>

        <div className="p-6 bg-white dark:bg-gray-900 border-t border-border flex justify-between items-center">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            <Info className="h-3.5 w-3.5" />
            Intelligence when you need it. Silence when you don’t.
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-xl font-bold h-11 px-6" asChild>
              <a href={`http://aerchain.freshdesk.com/a/tickets/${ticket.id}`} target="_blank" rel="noopener noreferrer">
                Open in Freshdesk <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button onClick={onClose} className="rounded-xl font-bold h-11 px-8 bg-gray-900 text-white hover:bg-gray-800">Close Workspace</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TicketDetailModal;