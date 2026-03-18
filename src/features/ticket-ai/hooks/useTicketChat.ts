import { useState } from 'react';
import { invokeEdgeFunction } from '@/lib/apiClient';
import { toast } from 'sonner';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  cards?: any[];
  followUps?: string[];
}

export function useTicketChat(ticketId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (query: string) => {
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const result = await invokeEdgeFunction<any>('ticket-chat-intelligence', {
        body: { 
          ticketId, 
          query,
          history: messages.map(m => ({ role: m.role, content: m.content }))
        }
      });

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.answer,
        cards: result.cards,
        followUps: result.followUps
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      toast.error("AI failed to respond. Please try again.");
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I'm sorry, I encountered an error while analyzing the ticket. Please try again in a moment."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => setMessages([]);

  return {
    messages,
    isLoading,
    sendMessage,
    clearChat
  };
}