"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client'; // Import supabase client
import { Ticket, TicketMessage } from '@/types'; // Import TicketMessage type
import { format } from 'date-fns'; // Import format for date formatting
import { Loader2 } from 'lucide-react'; // Import Loader2 icon for loading state
import { cn } from '@/lib/utils'; // Import cn for conditional class names

interface TicketDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket | null;
}

const TicketDetailModal = ({ 
  isOpen, 
  onClose, 
  ticket, 
}: TicketDetailModalProps) => {
  const [conversationMessages, setConversationMessages] = useState<TicketMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  useEffect(() => {
    if (isOpen && ticket?.id) {
      const fetchAndSyncMessages = async () => {
        setIsLoadingMessages(true);
        
        // 1. Check if messages already exist for this ticket in Supabase
        const { data: existingMessages, error: checkError } = await supabase
          .from('ticket_messages')
          .select('id')
          .eq('ticket_id', ticket.id)
          .limit(1); // Just need to know if at least one exists

        if (checkError) {
          console.error("Error checking for existing messages:", checkError);
          // Continue to fetch from Freshdesk even if check fails
        }

        // If no existing messages, or if check failed, try to sync from Freshdesk
        if (!existingMessages || existingMessages.length === 0 || checkError) {
          console.log(`No existing messages found for ticket ${ticket.id}, syncing from Freshdesk...`);
          try {
            // Invoke the new Edge Function to fetch and upsert conversations
            const { data, error: syncError } = await supabase.functions.invoke('fetch-ticket-conversations', {
              method: 'POST',
              body: { freshdesk_ticket_id: ticket.id },
            });

            if (syncError) {
              console.error("Error syncing conversations from Freshdesk:", syncError);
              // Optionally show a toast error to the user
            } else {
              console.log("Successfully synced conversations:", data);
            }
          } catch (err) {
            console.error("Unexpected error during conversation sync:", err);
          }
        } else {
          console.log(`Existing messages found for ticket ${ticket.id}, skipping Freshdesk sync.`);
        }

        // 2. Fetch messages from Supabase (whether newly synced or existing)
        const { data: messagesData, error: fetchError } = await supabase
          .from('ticket_messages')
          .select('*')
          .eq('ticket_id', ticket.id)
          .order('created_at', { ascending: true });

        if (fetchError) {
          console.error("Error fetching conversation messages from Supabase:", fetchError);
          // Optionally show a toast error to the user
        } else {
          setConversationMessages(messagesData || []);
        }
        setIsLoadingMessages(false);
      };
      fetchAndSyncMessages();
    } else {
      setConversationMessages([]); // Clear messages when modal closes
    }
  }, [isOpen, ticket?.id]); // Re-run effect when modal opens or ticket changes

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
          <h3 className="text-lg font-semibold mb-2">Conversation History</h3>
          {isLoadingMessages ? (
            <div className="flex items-center justify-center h-24 text-gray-500 dark:text-gray-400">
              <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading messages...
            </div>
          ) : conversationMessages.length > 0 ? (
            <div className="space-y-4">
              {conversationMessages.map((message) => (
                <div key={message.id} className={cn(
                  "p-3 rounded-lg shadow-sm max-w-[80%]", // Added max-w-[80%] for chat bubble effect
                  message.is_agent ? "bg-blue-50 dark:bg-blue-950 ml-auto text-right" : "bg-gray-50 dark:bg-gray-700 mr-auto text-left"
                )}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-sm">{message.sender}</span>
                    <span className="text-xs text-muted-foreground">{format(new Date(message.created_at), 'MMM dd, yyyy HH:mm')}</span>
                  </div>
                  {/* Render HTML content safely */}
                  <div dangerouslySetInnerHTML={{ __html: message.body_html || '' }} className="text-sm text-foreground" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">No conversation messages found for this ticket.</p>
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