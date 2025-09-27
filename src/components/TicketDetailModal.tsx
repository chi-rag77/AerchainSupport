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
import { Ticket, TicketMessage } from '@/types';
import { format } from 'date-fns';

interface TicketDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket | null;
  messages: TicketMessage[];
}

const TicketDetailModal = ({ isOpen, onClose, ticket, messages }: TicketDetailModalProps) => {
  if (!ticket) return null;

  const sortedMessages = [...messages].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const freshdeskTicketUrl = `https://your-freshdesk-domain.freshdesk.com/a/tickets/${ticket.id}`; // Placeholder

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
          <h3 className="text-lg font-semibold mb-2">Conversation Timeline</h3>
          {sortedMessages.length > 0 ? (
            sortedMessages.map((message) => (
              <div key={message.id} className={`flex ${message.is_agent ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[70%] p-3 rounded-lg shadow-sm ${
                  message.is_agent
                    ? 'bg-blue-50 dark:bg-blue-950 text-gray-800 dark:text-gray-200'
                    : 'bg-green-50 dark:bg-green-950 text-gray-800 dark:text-gray-200'
                }`}>
                  <p className="text-xs font-semibold mb-1">
                    {message.sender} - {format(new Date(message.created_at), 'MMM dd, yyyy HH:mm')}
                  </p>
                  {message.body_html ? (
                    <div dangerouslySetInnerHTML={{ __html: message.body_html }} className="prose dark:prose-invert text-sm" />
                  ) : (
                    <p className="text-sm italic text-gray-600 dark:text-gray-400">No message content.</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">No messages for this ticket.</p>
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