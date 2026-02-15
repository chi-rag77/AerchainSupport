import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { analyzeTicket } from '../services/ticketAI.service';
import { TicketAIAnalysis } from '../types';
import { toast } from 'sonner';

export function useTicketAIAnalysis(ticketId: string | null, customerName: string | null) {
  const queryClient = useQueryClient();
  const queryKey = ['ticketAIAnalysis', ticketId];

  const { data: analysis, isLoading, error, refetch } = useQuery<TicketAIAnalysis, Error>({
    queryKey,
    queryFn: () => analyzeTicket(ticketId!, customerName!),
    enabled: !!ticketId && !!customerName,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });

  const analyzeMutation = useMutation({
    mutationFn: () => analyzeTicket(ticketId!, customerName!, true),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, data);
      toast.success("AI Analysis updated!");
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
  };
}