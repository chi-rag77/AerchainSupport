import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ActiveRiskData } from '../types';

export function useActiveRisk() {
  return useQuery<ActiveRiskData, Error>({
    queryKey: ['activeRisks'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-active-risks', { method: 'POST' });
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds for "live" feel
  });
}