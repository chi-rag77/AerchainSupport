import { supabase } from '@/integrations/supabase/client';
import { Ticket, TicketMessage } from '../types';

// Fetches all tickets (up to 10000 limit set in the query)
export async function fetchAllTickets(): Promise<Ticket[]> {
  const { data, error } = await supabase
    .from('freshdesk_tickets')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(10000);

  if (error) throw error;
  
  // Map freshdesk_id to id for consistency
  return data.map(ticket => ({ ...ticket, id: ticket.freshdesk_id })) as Ticket[];
}

// Fetches conversation messages for a single ticket
export async function fetchTicketMessages(ticketId: string): Promise<TicketMessage[]> {
  // Note: The actual sync is triggered via Edge Function in the component, 
  // but this function fetches the already synced data from the DB.
  const { data, error } = await supabase
    .from('ticket_messages')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: false }); // Changed to descending for newest first

  if (error) throw error;
  return data as TicketMessage[];
}