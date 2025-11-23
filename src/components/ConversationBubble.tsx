"use client";

import React from 'react';
import { TicketMessage } from '@/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Paperclip, Tag, FileText } from 'lucide-react'; // Icons for attachments, tags, notes

interface ConversationBubbleProps {
  message: TicketMessage;
  requesterEmail: string;
}

const ConversationBubble = ({ message, requesterEmail }: ConversationBubbleProps) => {
  const isCustomer = message.sender.toLowerCase().includes(requesterEmail.toLowerCase()) || !message.is_agent;
  const senderInitials = message.sender.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className={cn(
      "flex items-start gap-3",
      isCustomer ? "justify-start" : "justify-end"
    )}>
      {isCustomer && (
        <Avatar className="h-8 w-8 border border-gray-200 dark:border-gray-600 shadow-sm flex-shrink-0">
          <AvatarFallback className="text-xs bg-gray-200 dark:bg-gray-700">
            {senderInitials}
          </AvatarFallback>
        </Avatar>
      )}
      <div className={cn(
        "relative p-3 rounded-xl shadow-sm max-w-[75%] group",
        isCustomer
          ? "bg-gray-50 dark:bg-gray-700 text-foreground rounded-bl-none"
          : "bg-gradient-to-br from-indigo-500 to-blue-400 text-white rounded-br-none"
      )}>
        <div className={cn(
          "flex items-center mb-1",
          isCustomer ? "justify-start" : "justify-end"
        )}>
          <span className={cn(
            "font-semibold text-sm",
            isCustomer ? "text-foreground" : "text-white"
          )}>
            {message.sender}
          </span>
          <span className={cn(
            "ml-2 text-xs",
            isCustomer ? "text-muted-foreground" : "text-indigo-100 opacity-80"
          )}>
            {format(new Date(message.created_at), 'hh:mm a')}
          </span>
        </div>
        <div
          dangerouslySetInnerHTML={{ __html: message.body_html || '' }}
          className={cn(
            "text-sm break-words",
            isCustomer ? "text-foreground" : "text-white"
          )}
        />
        {/* Placeholder for icons - assuming message content might imply these */}
        <div className="flex gap-2 mt-2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {/* Example: if message body contains "attachment" */}
          {message.body_html?.toLowerCase().includes('attachment') && (
            <span className="flex items-center"><Paperclip className="h-3 w-3 mr-1" /> Attachment</span>
          )}
          {/* Example: if message is an internal note (not directly supported by type, but for illustration) */}
          {message.body_html?.toLowerCase().includes('internal note') && (
            <span className="flex items-center"><FileText className="h-3 w-3 mr-1" /> Internal Note</span>
          )}
        </div>
      </div>
      {!isCustomer && (
        <Avatar className="h-8 w-8 border border-gray-200 dark:border-gray-600 shadow-sm flex-shrink-0">
          <AvatarFallback className="text-xs bg-gray-200 dark:bg-gray-700">
            {senderInitials}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default ConversationBubble;