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
import { Ticket } from '@/types'; // Removed TicketMessage import
import { format } from 'date-fns';
import { RefreshCw } from 'lucide-react';

// Define the type for the conversation summary
type ConversationSummary = {
  initialMessage: string;
  lastAgentReply: string;
};

interface TicketDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket | null;
  conversationSummary: ConversationSummary | undefined; // Changed to conversationSummary
  isLoadingSummary: boolean;
  summaryError: Error | null;
  onRefreshSummary: () => void; // Added refresh function
}

const TicketDetailModal = ({ 
  isOpen, 
  onClose, 
  ticket, 
  conversationSummary, 
  isLoadingSummary, 
  summaryError,
  onRefreshSummary
}: TicketDetailModalProps) => {
  if (!ticket) return null;

  const freshdeskTicketUrl = `http://aerchain.freshdesk.com/a/tickets/${ticket.id}`; // Updated Freshdesk URL

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
            <h3 className="text-lg font-semibold">Conversation Summary</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefreshSummary} 
              disabled={isLoadingSummary}
            >
              {isLoadingSummary ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>
          
          {isLoadingSummary ? (
            <p className="text-center text-gray-500 dark:text-gray-400">Loading conversation summary...</p>
          ) : summaryError ? (
            <p className="text-center text-red-500">Error loading summary: {summaryError.message}</p>
          ) : conversationSummary ? (
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-gray-700 dark:text-gray-300">Initial Message:</p>
                <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{conversationSummary.initialMessage}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700 dark:text-gray-300">Last Agent Reply:</p>
                <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{conversationSummary.lastAgentReply}</p>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">No conversation summary available.</p>
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