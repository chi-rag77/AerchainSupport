"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Ticket, ConversationMessage } from '@/types'; // Import ConversationMessage
import { format } from 'date-fns';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils'; // Import cn for conditional class names

interface TicketDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket | null;
  conversationHistory: ConversationMessage[] | undefined; // Changed type to array of ConversationMessage
  isLoadingHistory: boolean; // Changed name
  historyError: Error | null; // Changed name
  onRefreshHistory: () => void; // Changed name
}

const TicketDetailModal = ({ 
  isOpen, 
  onClose, 
  ticket, 
  conversationHistory, 
  isLoadingHistory, 
  historyError,
  onRefreshHistory
}: TicketDetailModalProps) => {
  if (!ticket) return null;

  const freshdeskTicketUrl = `http://aerchain.freshdesk.com/a/tickets/${ticket.id}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{ticket.subject}</DialogTitle>
          <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
            Ticket ID: {ticket.id} | Status: {ticket.status} | Priority: {ticket.priority}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <p><span className="font-semibold">Requester:</span> {ticket.requester_email}</p>
            {ticket.customer && <p><span className="font-semibold">Customer:</span> {ticket.customer}</p>}
            {ticket.type && <p><span className="font-semibold">Type:</span> {ticket.type}</p>}
          </div>
          <div>
            <p><span className="font-semibold">Created:</span> {format(new Date(ticket.created_at), 'MMM dd, yyyy HH:mm')}</p>
            <p><span className="font-semibold">Last Updated:</span> {format(new Date(ticket.updated_at), 'MMM dd, yyyy HH:mm')}</p>
            {ticket.due_by && <p><span className="font-semibold">Due By:</span> {format(new Date(ticket.due_by), 'MMM dd, yyyy HH:mm')}</p>}
          </div>
        </div>

        <Separator />

        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Conversation History</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefreshHistory} 
              disabled={isLoadingHistory}
            >
              {isLoadingHistory ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>
          
          {isLoadingHistory ? (
            <p className="text-center text-gray-500 dark:text-gray-400">Loading conversation history...</p>
          ) : historyError ? (
            <p className="text-center text-red-500">Error loading history: {historyError.message}</p>
          ) : conversationHistory && conversationHistory.length > 0 ? (
            <div className="space-y-4">
              {conversationHistory.map((message, index) => (
                <div 
                  key={message.id || index} 
                  className={cn(
                    "p-3 rounded-lg shadow-sm",
                    message.is_agent 
                      ? "bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-800 ml-auto max-w-[90%]" 
                      : "bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 mr-auto max-w-[90%]"
                  )}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={cn(
                      "font-semibold text-sm",
                      message.is_agent ? "text-blue-800 dark:text-blue-200" : "text-gray-800 dark:text-gray-200"
                    )}>
                      {message.sender}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {format(new Date(message.created_at), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                  <div 
                    className="text-sm text-gray-700 dark:text-gray-300 prose prose-sm dark:prose-invert max-w-none" 
                    dangerouslySetInnerHTML={{ __html: message.body_html }} 
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">No conversation history available.</p>
          )}
        </div>

        <Separator />

        <div className="flex justify-end p-4">
          <Button asChild variant="outline" className="mr-2">
            <a href={freshdeskTicketUrl} target="_blank" rel="noopener noreferrer">
              View in Freshdesk
            </a>
          </Button>
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TicketDetailModal;