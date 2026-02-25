import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { analyzeTicket } from '../services/ticketAI.service';
import { TicketAIAnalysis } from '../types';
import { toast } from 'sonner';

export function useTicketAIAnalysis(ticketId: string | null, customerName: string | null) {
  const queryClient = useQueryClient();
  const queryKey = ['ticketAIAnalysis', ticketId];

  // Set enabled: false to prevent automatic fetching on mount
  const { data: analysis, isLoading, error } = useQuery<TicketAIAnalysis, Error>({
    queryKey,
    queryFn: () => analyzeTicket(ticketId!, customerName!),
    enabled: false, 
    staleTime: 24 * 60 * 60 * 1000,
  });

  const analyzeMutation = useMutation({
    mutationFn: () => analyzeTicket(ticketId!, customerName!, true),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, data);
      toast.success("AI Analysis complete!");
    },
    onError: (err: any) => {
      toast.error(`Analysis failed: ${err.message}`);
    }
  });

  return {
    analysis,
    isLoading: isLoading || analyzeMutation.isPending,
    error,
    refreshAnalysis: analyzeMutation.mutate,
    isInitial: !analysis && !analyzeMutation.isPending && !isLoading,
  };
}