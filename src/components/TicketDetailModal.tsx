"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { Ticket } from "@/features/tickets/types"; // Updated import path
import { format, isPast, parseISO } from 'date-fns';
import {
  Loader2, AlertCircle, Copy, CheckCircle, Hourglass, Clock, Users, Shield, Laptop, XCircle,
  Tag, Building2, MessageSquare, CalendarDays, User, Info, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useTicketMessages } from '@/features/tickets/hooks/useTicketMessages'; // New hook import

interface TicketDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket | null;
}

// Helper function for copying to clipboard
const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    toast.success("Copied to clipboard!");
  }).catch(err => {
    console.error("Failed to copy text: ", err);
    toast.error("Failed to copy to clipboard.");
  });
};

const TicketDetailModal = ({
  isOpen,
  onClose,
  ticket,
}: TicketDetailModalProps) => {
  const { conversationMessages, isLoadingMessages, fetchError, syncMessages } = useTicketMessages(ticket?.id || null);

  useEffect(() => {
    if (isOpen && ticket?.id) {
      // Trigger initial sync when modal opens
      syncMessages();
    }
  }, [isOpen, ticket?.id]); // Removed syncMessages from dependency array to prevent infinite loop

  if (!ticket) return null;

  const freshdeskTicketUrl = `http://aerchain.freshdesk.com/a/tickets/${ticket.id}`;

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    let icon: React.ElementType = Info;
    let colorClass = "bg-gray-50 text-gray-700 border border-gray-200 shadow-sm"; // Default soft-neon

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
      case 'closed':
        icon = XCircle;
        colorClass = "bg-gray-50 text-gray-700 border border-gray-200 shadow-sm";
        break;
      case 'escalated':
        icon = AlertCircle;
        colorClass = "bg-red-50 text-red-700 border border-red-200 shadow-sm"; // Soft red for escalated status
        break;
      case 'waiting on customer':
        icon = Users;
        colorClass = "bg-purple-50 text-purple-700 border border-purple-200 shadow-sm";
        break;
      case 'on tech':
        icon = Laptop;
        colorClass = "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm";
        break;
      case 'on product':
        icon = Shield;
        colorClass = "bg-pink-50 text-pink-700 border border-pink-200 shadow-sm";
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
    let colorClass = "bg-gray-50 text-gray-700 border border-gray-200 shadow-sm"; // Default soft-neon

    switch (priorityLower) {
      case 'urgent':
        icon = AlertCircle;
        colorClass = "bg-gradient-to-r from-red-400 to-red-300 text-white shadow-md"; // Bold gradient for urgent
        break;
      case 'high':
        icon = AlertCircle;
        colorClass = "bg-gradient-to-r from-orange-400 to-orange-300 text-white shadow-md"; // Bold gradient for high
        break;
      case 'medium':
        icon = MessageSquare;
        colorClass = "bg-yellow-50 text-yellow-700 border border-yellow-200 shadow-sm"; // Soft yellow for medium
        break;
      case 'low':
        icon = Clock;
        colorClass = "bg-gray-50 text-gray-700 border border-gray-200 shadow-sm"; // Soft gray for low
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
      <SheetContent side="right" className="w-full sm:max-w-xl flex flex-col p-0">
        {/* Ticket Header Capsule */}
        <SheetHeader className="p-6 pb-4 bg-sky-100 backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.05)] sticky top-0 z-10">
          <div className="mb-4"> {/* Added mb-4 for spacing under title block */}
            <SheetTitle className="text-3xl font-extrabold leading-tight text-foreground">
              {ticket.subject}
            </SheetTitle>
            <SheetDescription className="flex flex-col gap-2 text-sm text-gray-700 dark:text-gray-200">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 font-medium">
                  <Tag className="h-4 w-4 text-gray-600 dark:text-gray-300" /> ID: {ticket.id}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-600 dark:text-gray-300 hover:text-foreground hover:bg-white/10" onClick={() => copyToClipboard(ticket.id)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copy Ticket ID</TooltipContent>
                  </Tooltip>
                </span>
                {ticket.assignee && ticket.assignee !== "Unassigned" && (
                  <>
                    <span className="text-gray-400 dark:text-gray-500">•</span>
                    <span className="flex items-center gap-2">
                      <Avatar className="h-6 w-6 border border-gray-300 dark:border-gray-600">
                        <AvatarFallback className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          {ticket.assignee.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-gray-700 dark:text-gray-200">{ticket.assignee}</span>
                    </span >
                  </>
                )}
              </div>
            </SheetDescription>
          </div>
          {/* Dedicated row for chips */}
          <div className="flex flex-wrap items-center gap-2">
            {getStatusBadge(ticket.status)}
            {getPriorityBadge(ticket.priority)}
          </div>
        </SheetHeader>

        {/* Main Content Area - Scrollable */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          {/* Contextual Detail Panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Requester & Company Profile */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" /> Requester Details
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p><span className="font-medium">Email:</span> {ticket.requester_email}</p>
                {ticket.cf_company && <p><span className="font-medium">Company:</span> {ticket.cf_company}</p>}
                {ticket.cf_country && <p><span className="font-medium">Country:</span> {ticket.cf_country}</p>}
              </CardContent>
            </Card>

            {/* Ticket Timeline & Lifecycle */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" /> Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p><span className="font-medium">Created:</span> {format(new Date(ticket.created_at), 'MMM dd, yyyy HH:mm')}</p>
                <p><span className="font-medium">Last Updated:</span> {format(new Date(ticket.updated_at), 'MMM dd, yyyy HH:mm')}</p>
                {ticket.due_by && (
                  <p className={cn("font-medium", isOverdue ? "text-red-600 dark:text-red-400" : "")}>
                    <span>Due By:</span> {format(new Date(ticket.due_by), 'MMM dd, yyyy HH:mm')}
                    {isOverdue && <span className="ml-2 text-xs font-bold">(OVERDUE)</span>}
                  </p>
                )}
                {ticket.fr_due_by && <p><span className="font-medium">First Response Due:</span> {format(new Date(ticket.fr_due_by), 'MMM dd, yyyy HH:mm')}</p>}
              </CardContent>
            </Card>

            {/* Ticket Categorization */}
            <Card className="md:col-span-2 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" /> Categorization
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                {ticket.type && <p><span className="font-medium">Type:</span> {ticket.type}</p>}
                {ticket.cf_module && <p><span className="font-medium">Module:</span> {ticket.cf_module}</p>}
                {ticket.cf_dependency && <p><span className="font-medium">Dependency:</span> {ticket.cf_dependency}</p>}
                {ticket.cf_recurrence && <p><span className="font-medium">Recurrence:</span> {ticket.cf_recurrence}</p>}
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Conversation Stream */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-foreground">Conversation History</h3>
            <Button variant="outline" size="sm" onClick={syncMessages} disabled={isLoadingMessages}>
              {isLoadingMessages ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Sync
            </Button>
          </div>
          {isLoadingMessages ? (
            <div className="flex items-center justify-center h-24 text-gray-500 dark:text-gray-400">
              <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading messages...
            </div>
          ) : fetchError ? (
            <div className="flex flex-col items-center justify-center h-24 text-red-500 dark:text-red-400 text-center">
              <AlertCircle className="h-6 w-6 mb-2" />
              <p className="font-medium">Error loading conversations:</p>
              <p className="text-sm">{fetchError}</p>
              <p className="text-sm mt-2">Please ensure Freshdesk credentials are correct and try syncing.</p>
            </div>
          ) : conversationMessages.length > 0 ? (
            <div className="relative space-y-6 before:absolute before:left-4 before:top-0 before:h-full before:w-0.5 before:bg-gray-200 dark:before:bg-gray-700">
              {conversationMessages.map((message, index) => (
                <div key={message.id} className={cn(
                  "flex items-start gap-3 relative",
                  message.is_agent ? "justify-end" : "justify-start"
                )}>
                  {/* Timeline dot */}
                  <div className="absolute left-3.5 top-0.5 h-3 w-3 rounded-full bg-primary dark:bg-primary-foreground z-10"></div>

                  {!message.is_agent && (
                    <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
                      <AvatarFallback className="text-xs bg-gray-200 dark:bg-gray-700">
                        {message.sender.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div className={cn(
                    "p-4 rounded-xl shadow-md max-w-[80%] relative",
                    message.is_agent
                      ? "bg-blue-50 dark:bg-blue-950/50 text-right rounded-br-none"
                      : "bg-gray-50 dark:bg-gray-700 rounded-bl-none"
                  )}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-sm text-foreground">{message.sender}</span>
                      <span className="text-xs text-muted-foreground">{format(new Date(message.created_at), 'MMM dd, yyyy HH:mm')}</span>
                    </div>
                    <div dangerouslySetInnerHTML={{ __html: message.body_html || '' }} className="text-sm text-foreground break-words" />
                  </div>

                  {message.is_agent && (
                    <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
                      <AvatarFallback className="text-xs bg-blue-700 text-white">
                        {message.sender.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">No conversation messages found for this ticket.</p>
          )}
        </div>

        {/* Action Bar */}
        <Separator className="mt-auto" />
        <div className="flex justify-end p-6 bg-background shadow-lg sticky bottom-0 z-10">
          <Button asChild variant="outline" className="mr-2">
            <a href={freshdeskTicketUrl} target="_blank" rel="noopener noreferrer">
              View in Freshdesk
            </a>
          </Button>
          <Button onClick={onClose}>Close</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TicketDetailModal;