import { invokeEdgeFunction } from '@/lib/apiClient';
import { TicketAIAnalysis } from '../types';

export async function analyzeTicket(ticketId: string, customerName: string, forceRefresh = false): Promise<TicketAIAnalysis> {
  return await invokeEdgeFunction<TicketAIAnalysis>('analyze-ticket-ai', {
    method: 'POST',
    body: { ticketId, customerName, forceRefresh },
  });
}