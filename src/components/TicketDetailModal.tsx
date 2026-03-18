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

// Lens Components
import ResolveLens from './tickets/ResolveLens';
import MonitorLens from './tickets/MonitorLens';
import AnalyzeLens from './tickets/AnalyzeLens';

interface TicketDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket | null;
}

type LensMode = 'resolve' | 'monitor' | 'analyze';

const TicketDetailModal = ({ isOpen, onClose, ticket }: TicketDetailModalProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeMode, setActiveMode] = useState<LensMode>('resolve');

  const { conversationMessages, isLoadingMessages, syncMessages } = useTicketMessages(ticket?.id || null);
  const { analysis, refreshAnalysis, isLoading: isAnalyzing } = useTicketAIAnalysis(ticket?.id || null, ticket?.cf_company || 'Unknown');

  useEffect(() => {
    if (isOpen && ticket?.id) {
      syncMessages();
      setActiveMode('resolve');
      setIsExpanded(false);
    }
  }, [isOpen, ticket?.id]);

  if (!ticket) return null;

  const handleModeChange = (mode: LensMode) => {
    setActiveMode(mode);
    if (mode === 'analyze') {
      setIsExpanded(true);
      if (!analysis) refreshAnalysis();
    }
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
          isExpanded ? "sm:max-w-[85vw]" : "sm:max-w-[50vw]"
        )}
      >
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
                onClick={() => handleModeChange('analyze')} 
                disabled={isAnalyzing}
                className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
              >
                {isAnalyzing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                AI Intelligence
              </Button>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* 2. Mode Switcher (Resolve, Monitor, Analyze) */}
          <div className="px-6 py-3 border-b border-border flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
            <div className="flex items-center p-1 bg-white dark:bg-gray-800 rounded-xl border border-border shadow-sm">
              {(['resolve', 'monitor', 'analyze'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => handleModeChange(mode)}
                  className={cn(
                    "h-8 px-5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                    activeMode === mode 
                      ? "bg-indigo-600 text-white shadow-md" 
                      : "text-muted-foreground hover:text-foreground hover:bg-gray-50 dark:hover:bg-gray-700"
                  )}
                >
                  {mode === 'resolve' && <User className="h-3.5 w-3.5" />}
                  {mode === 'monitor' && <Shield className="h-3.5 w-3.5" />}
                  {mode === 'analyze' && <Brain className="h-3.5 w-3.5" />}
                  {mode}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-8 px-3 text-[10px] font-bold gap-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg">
                <Search className="h-3.5 w-3.5" /> Knowledge Base
              </Button>
            </div>
          </div>

          {/* 3. Lens Content Area */}
          <div className="flex-1 overflow-y-auto p-8">
            {activeMode === 'resolve' && (
              <ResolveLens 
                ticket={ticket} 
                messages={conversationMessages} 
                onGenerateReply={() => toast.info("Generating smart reply...")} 
              />
            )}
            {activeMode === 'monitor' && (
              <MonitorLens 
                ticket={ticket} 
                onAnalyzeRisk={() => handleModeChange('analyze')} 
              />
            )}
            {activeMode === 'analyze' && (
              <AnalyzeLens 
                ticket={ticket} 
                analysis={analysis} 
                isLoading={isAnalyzing} 
              />
            )}
          </div>
        </div>

        {/* 4. Footer */}
        <div className="p-5 bg-card border-t border-border flex justify-between items-center shadow-inner">
          <div className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            <Command className="h-4 w-4" />
            {activeMode.toUpperCase()} MODE ACTIVE
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