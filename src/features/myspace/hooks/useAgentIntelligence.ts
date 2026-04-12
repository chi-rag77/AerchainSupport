import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AgentIntelligence } from '../types';

export function useAgentIntelligence(agentName: string) {
  return useQuery<any, Error>({
    queryKey: ['agentIntelligence', agentName],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-agent-intelligence', {
        method: 'POST',
        body: { agentName }
      });
      if (error) throw error;
      return data;
    },
    enabled: !!agentName,
    refetchInterval: 1000 * 60 * 5, // Refresh every 5 mins
  });
}