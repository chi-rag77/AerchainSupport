"use client";

import React, { useState, useEffect } from 'react';
import {
  Sheet, // Changed from Dialog
  SheetContent, // Changed from DialogContent
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"; // Changed from dialog
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { Ticket, TicketMessage } from '@/types';
import { format } from 'date-fns';
import { Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndSyncMessages = async () => {
      if (!ticket?.id) return;

      setIsLoadingMessages(true);
      setFetchError(null); // Clear previous errors

      try {
        // 1. Verify parent ticket exists in freshdesk_tickets table
        const { data: parentTicketData, error: parentTicketError } = await supabase
          .from('freshdesk_tickets')
          .select('freshdesk_id')
          .eq('freshdesk_id', ticket.id)
          .single();

        if (parentTicketError && parentTicketError.code !== 'PGRST116') { // PGRST116 is 'No rows found'
          console.error("Error checking parent ticket existence:", parentTicketError);
          setFetchError(`Failed to verify parent ticket: ${parentTicketError.message}`);
          setIsLoadingMessages(false);
          return;
        }

        if (!parentTicketData) {
          console.warn(`Parent ticket ${ticket.id} not found in freshdesk_tickets. Attempting to sync all tickets.`);
          toast.info("Ticket not found in database. Attempting to sync all tickets to ensure data integrity.", { id: "sync-parent-ticket" });
          
          // Trigger a full ticket sync
          const { error: syncError } = await supabase.functions.invoke('fetch-freshdesk-tickets', {
            method: 'POST',
            body: { action: 'syncTickets' },
          });

          if (syncError) {
            console.error("Error during full ticket sync:", syncError);
            toast.error(`Failed to sync tickets: ${syncError.message}. Please try again.`, { id: "sync-parent-ticket" });
            setFetchError("Parent ticket not found and failed to sync. Please try syncing tickets manually.");
            setIsLoadingMessages(false);
            return;
          } else {
            toast.success("Tickets synced. Retrying conversation fetch...", { id: "sync-parent-ticket" });
            // After successful sync, re-check for parent ticket
            const { data: retryParentTicketData, error: retryParentTicketError } = await supabase
              .from('freshdesk_tickets')
              .select('freshdesk_id')
              .eq('freshdesk_id', ticket.id)
              .single();

            if (retryParentTicketError || !retryParentTicketData) {
              console.error(`Parent ticket ${ticket.id} still not found after sync.`);
              setFetchError("Parent ticket still not found after sync. Please ensure the ticket exists in Freshdesk and try syncing again.");
              setIsLoadingMessages(false);
              return;
            }
          }
        }

        // 2. Check if messages already exist for this ticket in Supabase
        const { data: existingMessages, error: checkError } = await supabase
          .from('ticket_messages')
          .select('id')
          .eq('ticket_id', ticket.id)
          .limit(1);

        if (checkError) {
          console.error("Error checking for existing messages:", checkError);
          // Continue to fetch from Freshdesk even if check fails
        }

        // If no existing messages, or if check failed, try to sync from Freshdesk
        if (!existingMessages || existingMessages.length === 0 || checkError) {
          console.log(`No existing messages found for ticket ${ticket.id}, syncing from Freshdesk...`);
          const { data, error: syncError } = await supabase.functions.invoke('fetch-ticket-conversations', {
            method: 'POST',
            body: { freshdesk_ticket_id: ticket.id },
          });

          if (syncError) {
            console.error("Error syncing conversations from Freshdesk:", syncError);
            setFetchError(`Failed to sync conversations: ${syncError.message}`);
          } else {
            console.log("Successfully synced conversations:", data);
          }
        } else {
          console.log(`Existing messages found for ticket ${ticket.id}, skipping Freshdesk sync.`);
        }

        // 3. Fetch messages from Supabase (whether newly synced or existing)
        const { data: messagesData, error: fetchMessagesError } = await supabase
          .from('ticket_messages')
          .select('*')
          .eq('ticket_id', ticket.id)
          .order('created_at', { ascending: true });

        if (fetchMessagesError) {
          console.error("Error fetching conversation messages from Supabase:", fetchMessagesError);
          setFetchError(`Failed to load conversation messages: ${fetchMessagesError.message}`);
        } else {
          setConversationMessages(messagesData || []);
        }
      } catch (err: any) {
        console.error("Unexpected error during conversation fetch/sync:", err);
        setFetchError(`An unexpected error occurred: ${err.message}`);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    if (isOpen && ticket?.id) {
      fetchAndSyncMessages();
    } else {
      setConversationMessages([]); // Clear messages when modal closes
      setFetchError(null);
    }
  }, [isOpen, ticket?.id]); // Re-run effect when modal opens or ticket changes

  if (!ticket) return null;

  const freshdeskTicketUrl = `http://aerchain.freshdesk.com/a/tickets/${ticket.id}`;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}> {/* Changed from Dialog */}
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col"> {/* Changed from DialogContent, added side and flex-col */}
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold">{ticket.subject}</SheetTitle>
          <SheetDescription className="text-sm text-gray-500 dark:text-gray-400">
            Ticket ID: {ticket.id} | Status: {ticket.status} | Priority: {ticket.priority}
          </SheetDescription>
        </SheetHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm my-4"> {/* Adjusted margin */}
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

        <div className="flex-grow overflow-y-auto py-4 space-y-4"> {/* Added flex-grow and overflow-y-auto */}
          <h3 className="text-lg font-semibold mb-2">Conversation History</h3>
          {isLoadingMessages ? (
            <div className="flex items-center justify-center h-24 text-gray-500 dark:text-gray-400">
              <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading messages...
            </div>
          ) : fetchError ? (
            <div className="flex flex-col items-center justify-center h-24 text-red-500 dark:text-red-400 text-center">
              <AlertCircle className="h-6 w-6 mb-2" />
              <p className="font-medium">Error loading conversations:</p>
              <p className="text-sm">{fetchError}</p>
              <p className="text-sm mt-2">Please try syncing tickets from the main page.</p>
            </div>
          ) : conversationMessages.length > 0 ? (
            <div className="space-y-4">
              {conversationMessages.map((message) => (
                <div key={message.id} className={cn(
                  "p-3 rounded-lg shadow-sm max-w-[80%]",
                  message.is_agent ? "bg-blue-50 dark:bg-blue-950 ml-auto text-right" : "bg-gray-50 dark:bg-gray-700 mr-auto text-left"
                )}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-sm">{message.sender}</span>
                    <span className="text-xs text-muted-foreground">{format(new Date(message.created_at), 'MMM dd, yyyy HH:mm')}</span>
                  </div>
                  <div dangerouslySetInnerHTML={{ __html: message.body_html || '' }} className="text-sm text-foreground" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">No conversation messages found for this ticket.</p>
          )}
        </div>

        <Separator />

        <div className="flex justify-end pt-4">
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