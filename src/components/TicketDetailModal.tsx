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
import { Ticket } from '@/types'; // Removed ConversationMessage import
import { format } from 'date-fns';
// Removed RefreshCw import
// Removed cn import

interface TicketDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket | null;
  // Removed conversationHistory, isLoadingHistory, historyError, onRefreshHistory props
}

const TicketDetailModal = ({ 
  isOpen, 
  onClose, 
  ticket, 
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
          <h3 className="text-lg font-semibold mb-2">Full Conversation</h3>
          {ticket.description_html ? (
            <div 
              className="text-sm text-gray-700 dark:text-gray-300 prose prose-sm dark:prose-invert max-w-none" 
              dangerouslySetInnerHTML={{ __html: ticket.description_html }} 
            />
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">No conversation content available in ticket description.</p>
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