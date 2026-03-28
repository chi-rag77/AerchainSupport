import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SyncJob, SyncStats } from '../types';
import { toast } from 'sonner';
import { invokeEdgeFunction } from '@/lib/apiClient';
import { differenceInMinutes } from 'date-fns';

export function useSyncStatus() {
  const queryClient = useQueryClient();

  // 1. Fetch Sync History
  const { data: history = [], isLoading: isLoadingHistory } = useQuery<SyncJob[]>({
    queryKey: ['syncHistory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sync_jobs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data as SyncJob[];
    },
    refetchInterval: 10000, // Poll every 10s
  });

  // 2. Fetch Global Sync Stats
  const { data: stats, isLoading: isLoadingStats } = useQuery<SyncStats>({
    queryKey: ['syncStats'],
    queryFn: async () => {
      const { count } = await supabase.from('freshdesk_tickets').select('*', { count: 'exact', head: true });
      const { data: settings } = await supabase.from('org_settings').select('last_sync_at').single();
      
      const lastSync = settings?.last_sync_at;
      let health: SyncStats['healthStatus'] = 'Offline';
      
      if (lastSync) {
        const diff = differenceInMinutes(new Date(), new Date(lastSync));
        if (diff < 20) health = 'Live';
        else if (diff < 60) health = 'Stale';
        else health = 'Offline';
      }

      return {
        lastSyncAt: lastSync || null,
        totalTickets: count || 0,
        healthStatus: health,
        isSyncing: history[0]?.status === 'running'
      };
    },
    enabled: history.length >= 0,
  });

  // 3. Trigger Sync Mutation
  const triggerSync = useMutation({
    mutationFn: async () => {
      return await invokeEdgeFunction('fetch-freshdesk-tickets', {
        method: 'POST',
        body: { action: 'syncTickets' },
      });
    },
    onSuccess: () => {
      toast.success("Manual sync initiated.");
      queryClient.invalidateQueries({ queryKey: ['syncHistory'] });
      queryClient.invalidateQueries({ queryKey: ['syncStats'] });
    },
    onError: (err: any) => {
      toast.error(`Sync failed: ${err.message}`);
    }
  });

  return {
    history,
    stats,
    isLoading: isLoadingHistory || isLoadingStats,
    triggerSync: triggerSync.mutate,
    isTriggering: triggerSync.isPending
  };
}