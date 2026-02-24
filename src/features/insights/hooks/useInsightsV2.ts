import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { InsightsV2Data } from '../types';

export function useInsightsV2() {
  return useQuery<InsightsV2Data, Error>({
    queryKey: ['insightsV2'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-insights-v2', { method: 'POST' });
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}