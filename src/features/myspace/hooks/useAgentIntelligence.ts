import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AgentIntelligence } from '../types';

export function useAgentIntelligence() {
  return useQuery<AgentIntelligence, Error>({
    queryKey: ['agentIntelligence'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-agent-intelligence', {
        method: 'POST'
      });
      if (error) throw error;
      return data;
    },
    refetchInterval: 1000 * 60 * 15, // Refresh every 15 mins
  });
}