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
import { supabase } from '@/integrations/supabase/client';
import { Ticket, TicketMessage, TicketTimelineEvent } from '@/types';
import { format } from 'date-fns';
import { Loader2, AlertCircle, Clock, MessageSquare, UserPlus, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Import new sub-components
import TicketHeader from './TicketHeader';
import TicketMetadataCards from './TicketMetadataCards';
import TicketTimeline from './TicketTimeline';
import ConversationBubble from './ConversationBubble';
import TicketActionBar from './TicketActionBar';

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

  const timelineEvents: TicketTimelineEvent[] = useMemo(() => {
    if (!ticket) return [];

    const events: TicketTimelineEvent[] = [];

    // Ticket Created event
    events.push({
      id: `created-${ticket.id}`,
      type: 'created',
      timestamp: ticket.created_at,
      description: 'Ticket created',
      icon: Clock,
    });

    // First message event
    if (conversationMessages.length > 0) {
      const firstMessage = conversationMessages[0];
      events.push({
        id: `first-message-${firstMessage.id}`,
        type: 'message',
        timestamp: firstMessage.created_at,
        description: `First message from ${firstMessage.sender}`,
        icon: MessageSquare,
      });
    }

    // Assigned event (simplified: if assignee exists and is not 'Unassigned')
    if (ticket.assignee && ticket.assignee !== 'Unassigned') {
      // This assumes assignment happens around creation or first update.
      // For a more accurate timeline, historical assignment data would be needed.
      events.push({
        id: `assigned-${ticket.id}`,
        type: 'assigned',
        timestamp: ticket.updated_at, // Using updated_at as a proxy for assignment time
        description: `Assigned to ${ticket.assignee}`,
        icon: UserPlus,
      });
    }

    // Priority changed event (simplified: if priority is High/Urgent, assume it was set)
    if (ticket.priority === 'High' || ticket.priority === 'Urgent') {
      events.push({
        id: `priority-${ticket.id}`,
        type: 'priority_changed',
        timestamp: ticket.updated_at, // Using updated_at as a proxy
        description: `Priority set to ${ticket.priority}`,
        icon: AlertCircle,
      });
    }

    // Sort events by timestamp
    return events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [ticket, conversationMessages]);


  if (!ticket) return null;

  const freshdeskTicketUrl = `http://aerchain.freshdesk.com/a/tickets/${ticket.id}`;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className={cn(
          "w-full sm:max-w-[520px] flex flex-col",
          "backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl rounded-l-3xl"
        )}
      >
        {/* Header Block */}
        <TicketHeader ticket={ticket} />

        {/* Metadata Cards */}
        <TicketMetadataCards ticket={ticket} />

        <Separator className="mx-6 w-auto" />

        {/* Timeline View */}
        <TicketTimeline events={timelineEvents} />

        <Separator className="mx-6 w-auto" />

        {/* Conversation Area */}
        <div className="flex-grow overflow-y-auto p-6 space-y-4">
          <h3 className="text-lg font-semibold text-foreground mb-4">Conversation</h3>
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
                <ConversationBubble
                  key={message.id}
                  message={message}
                  requesterEmail={ticket.requester_email}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">No conversation messages found for this ticket.</p>
          )}
        </div>

        {/* Bottom Action Bar */}
        <TicketActionBar onClose={onClose} freshdeskTicketUrl={freshdeskTicketUrl} />
      </SheetContent>
    </Sheet>
  );
};

export default TicketDetailModal;