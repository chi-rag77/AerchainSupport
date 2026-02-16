import { supabase } from '@/integrations/supabase/client';
import { Ticket, TicketMessage } from '../types';

export async function fetchTicketsPaginated(page: number = 1, pageSize: number = 50): Promise<{ data: Ticket[], count: number }> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from('freshdesk_tickets')
    .select('*', { count: 'exact' })
    .order('updated_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  
  return {
    data: data.map(ticket => ({ ...ticket, id: ticket.freshdesk_id })) as Ticket[],
    count: count || 0
  };
}

export async function fetchTicketMessages(ticketId: string): Promise<TicketMessage[]> {
  const { data, error } = await supabase
    .from('ticket_messages')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as TicketMessage[];
}