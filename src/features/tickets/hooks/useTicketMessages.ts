import { useQuery, UseQueryOptions, useQueryClient } from '@tanstack/react-query';
import { TicketMessage } from '../types';
import { fetchTicketMessages } from '../services/ticket.service';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { invokeEdgeFunction, ApiError } from '@/lib/apiClient'; // Import apiClient

const MESSAGE_QUERY_KEY = "ticketMessages";

export function useTicketMessages(ticketId: string | null) {
  const queryClient = useQueryClient();

  // 1. Fetch messages from our DB
  const { data: conversationMessages = [], isLoading: isLoadingMessages, error: fetchError } = useQuery<TicketMessage[], Error>({
    queryKey: [MESSAGE_QUERY_KEY, ticketId],
    queryFn: () => fetchTicketMessages(ticketId!),
    enabled: !!ticketId,
    staleTime: 5 * 60 * 1000, // Messages don't change often
  } as UseQueryOptions<TicketMessage[], Error>);

  // 2. Function to trigger Freshdesk sync via Edge Function
  const syncMessages = async () => {
    if (!ticketId) return;

    const syncToastId = toast.loading("Syncing latest conversations...", { duration: 10000 });
    try {
      await invokeEdgeFunction(
        'fetch-ticket-conversations',
        {
          method: 'POST',
          body: { freshdesk_ticket_id: ticketId },
        }
      );

      toast.success("Conversations synced successfully!", { id: syncToastId });
      queryClient.invalidateQueries({ queryKey: [MESSAGE_QUERY_KEY, ticketId] }); // Force refetch from DB
    } catch (err: any) {
      let errorMessage = err.message;
      if (err instanceof ApiError) {
        errorMessage = `Sync failed (Status ${err.status}): ${err.message}`;
      }
      toast.error(errorMessage, { id: syncToastId });
      console.error("Error during conversation sync:", err);
    }
  };

  return {
    conversationMessages,
    isLoadingMessages,
    fetchError,
    syncMessages,
  };
}