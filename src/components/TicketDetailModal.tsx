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
import { format, isPast, parseISO } from 'date-fns';
import {
  Loader2, AlertCircle, Copy, CheckCircle, Hourglass, Clock, Users, Shield, Laptop, XCircle,
  Tag, Building2, MessageSquare, CalendarDays, User, Info, RefreshCw, Brain, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useTicketMessages } from '@/features/tickets/hooks/useTicketMessages';
import { useTicketAIAnalysis } from '@/features/ticket-ai/hooks/useTicketAIAnalysis';
import AITicketAnalyzerPanel from './tickets/AITicketAnalyzerPanel';

interface TicketDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket | null;
}

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    toast.success("Copied to clipboard!");
  }).catch(err => {
    toast.error("Failed to copy to clipboard.");
  });
};

const TicketDetailModal = ({ isOpen, onClose, ticket }: TicketDetailModalProps) => {
  const [showAI, setShowAI] = useState(false);
  const { conversationMessages, isLoadingMessages, isFetchingMessages, syncMessages } = useTicketMessages(ticket?.id || null);
  const { analysis, isLoading: isAnalyzing, refreshAnalysis, error: aiError } = useTicketAIAnalysis(
    ticket?.id || null, 
    ticket?.cf_company || 'Unknown'
  );

  // Prepend the initial ticket description as the first message
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

    return [initialMessage, ...conversationMessages];
  }, [ticket, conversationMessages]);

  useEffect(() => {
    if (isOpen && ticket?.id) {
      syncMessages();
      setShowAI(false); // Reset view when opening new ticket
    }
  }, [isOpen, ticket?.id]);

  if (!ticket) return null;

  const freshdeskTicketUrl = `http://aerchain.freshdesk.com/a/tickets/${ticket.id}`;

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    let icon: React.ElementType = Info;
    let colorClass = "bg-gray-50 text-gray-700 border border-gray-200 shadow-sm";

    switch (statusLower) {
      case 'open (being processed)':
        icon = Hourglass;
        colorClass = "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm";
        break;
      case 'pending (awaiting your reply)':
        icon = Clock;
        colorClass = "bg-yellow-50 text-yellow-700 border border-yellow-200 shadow-sm";
        break;
      case 'resolved':
        icon = CheckCircle;
        colorClass = "bg-green-50 text-green-700 border border-green-200 shadow-sm";
        break;
      case 'escalated':
        icon = AlertCircle;
        colorClass = "bg-red-50 text-red-700 border border-red-200 shadow-sm";
        break;
    }
    const IconComponent = icon;
    return (
      <Badge className={cn("flex items-center gap-1 px-2 py-1 text-xs font-semibold", colorClass)}>
        <IconComponent className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityLower = priority.toLowerCase();
    let icon: React.ElementType = Info;
    let colorClass = "bg-gray-50 text-gray-700 border border-gray-200 shadow-sm";

    switch (priorityLower) {
      case 'urgent':
        icon = AlertCircle;
        colorClass = "bg-gradient-to-r from-red-400 to-red-300 text-white shadow-md";
        break;
      case 'high':
        icon = AlertCircle;
        colorClass = "bg-gradient-to-r from-orange-400 to-orange-300 text-white shadow-md";
        break;
    }
    const IconComponent = icon;
    return (
      <Badge className={cn("flex items-center gap-1 px-2 py-1 text-xs font-semibold", colorClass)}>
        <IconComponent className="h-3 w-3" />
        {priority}
      </Badge>
    );
  };

  const isOverdue = ticket.due_by && isPast(parseISO(ticket.due_by)) && ticket.status.toLowerCase() !== 'resolved' && ticket.status.toLowerCase() !== 'closed';

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-2xl flex flex-col p-0">
        <SheetHeader className="p-6 pb-4 bg-sky-100 backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.05)] sticky top-0 z-10">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-grow">
              <SheetTitle className="text-2xl font-extrabold leading-tight text-foreground mb-2">
                {ticket.subject}
              </SheetTitle>
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                  <Tag className="h-3 w-3" /> ID: {ticket.id}
                  <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => copyToClipboard(ticket.id)}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </span>
                {getStatusBadge(ticket.status)}
                {getPriorityBadge(ticket.priority)}
              </div>
            </div>
            <Button 
              onClick={() => setShowAI(!showAI)} 
              className={cn(
                "flex items-center gap-2 transition-all duration-300",
                showAI ? "bg-purple-600 hover:bg-purple-700" : "bg-white text-purple-600 border-purple-200 hover:bg-purple-50"
              )}
              variant={showAI ? "default" : "outline"}
            >
              <Brain className={cn("h-4 w-4", showAI ? "animate-pulse" : "")} />
              {showAI ? "View Conversation" : "AI Analyzer"}
            </Button>
          </div>
        </SheetHeader>

        <div className="flex-grow overflow-y-auto p-6">
          {showAI ? (
            <AITicketAnalyzerPanel 
              analysis={analysis} 
              isLoading={isAnalyzing} 
              onRefresh={refreshAnalysis} 
              error={aiError}
            />
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" /> Requester
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p className="truncate font-medium">{ticket.requester_email}</p>
                    <p className="text-muted-foreground">{ticket.cf_company || 'No Company'}</p>
                  </CardContent>
                </Card>

                <Card className="shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" /> Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p><span className="text-muted-foreground">Created:</span> {format(new Date(ticket.created_at), 'MMM dd, HH:mm')}</p>
                    {ticket.due_by && (
                      <p className={cn(isOverdue ? "text-red-600 font-bold" : "")}>
                        <span className="text-muted-foreground">Due:</span> {format(new Date(ticket.due_by), 'MMM dd, HH:mm')}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-500" /> Conversation
                </h3>
                <Button variant="ghost" size="sm" onClick={syncMessages} disabled={isFetchingMessages}>
                  <RefreshCw className={cn("h-4 w-4 mr-2", isFetchingMessages && "animate-spin")} />
                  {isFetchingMessages ? "Syncing..." : "Sync"}
                </Button>
              </div>

              {isLoadingMessages ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin mb-2" />
                  <p className="text-sm">Fetching messages...</p>
                </div>
              ) : allMessages.length > 0 ? (
                <div className="space-y-6 relative before:absolute before:left-4 before:top-0 before:h-full before:w-0.5 before:bg-gray-100 dark:before:bg-gray-800">
                  {allMessages.map((message) => (
                    <div key={message.id} className={cn("flex gap-3 relative", message.is_agent ? "flex-row-reverse" : "flex-row")}>
                      <div className="absolute left-3.5 top-2 h-2 w-2 rounded-full bg-primary z-10" />
                      <Avatar className="h-8 w-8 flex-shrink-0 border">
                        <AvatarFallback className={cn("text-[10px]", message.is_agent ? "bg-blue-600 text-white" : "bg-gray-200")}>
                          {message.sender.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className={cn(
                        "p-4 rounded-2xl shadow-sm max-w-[85%] border",
                        message.is_agent ? "bg-blue-50/50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800" : "bg-white dark:bg-gray-900 border-border",
                        message.id === 'initial-description' && "border-l-4 border-l-blue-500"
                      )}>
                        <div className="flex justify-between items-center mb-2 gap-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs truncate">{message.sender}</span>
                            {message.id === 'initial-description' && <Badge variant="outline" className="text-[8px] h-4 px-1">Initial Description</Badge>}
                          </div>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">{format(new Date(message.created_at), 'MMM dd, HH:mm')}</span>
                        </div>
                        <div dangerouslySetInnerHTML={{ __html: message.body_html || '' }} className="text-sm prose prose-sm dark:prose-invert max-w-none break-words" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-xl border border-dashed">
                  <p className="text-sm text-muted-foreground">No messages found.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <Separator />
        <div className="p-6 bg-background flex justify-end gap-3">
          <Button asChild variant="outline">
            <a href={freshdeskTicketUrl} target="_blank" rel="noopener noreferrer">Open in Freshdesk</a>
          </Button>
          <Button onClick={onClose}>Close</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TicketDetailModal;