import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Action, ActionStatus } from '../types';
import { toast } from 'sonner';

export function useActions() {
  const queryClient = useQueryClient();

  const { data: actions = [], isLoading, error } = useQuery<Action[]>({
    queryKey: ['actions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('actions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Apply scoring logic: priority_score = (impact_score * 0.6) + (urgency_score * 0.4)
      return (data as Action[]).map(action => ({
        ...action,
        priority_score: (action.impact_score * 0.6) + (action.urgency_score * 0.4)
      })).sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0));
    },
    refetchInterval: 30000, // Refresh every 30s
  });

  const updateActionMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Partial<Action> }) => {
      const { error } = await supabase
        .from('actions')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actions'] });
    },
    onError: (err: any) => {
      toast.error(`Failed to update action: ${err.message}`);
    }
  });

  return {
    actions,
    isLoading,
    error,
    updateAction: updateActionMutation.mutate,
    isUpdating: updateActionMutation.isPending
  };
}