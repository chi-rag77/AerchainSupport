export type SyncStatus = 'success' | 'failed' | 'running' | 'idle';
export type SyncTrigger = 'cron' | 'webhook' | 'manual';

export interface SyncJob {
  id: string;
  org_id: string;
  trigger: SyncTrigger;
  status: SyncStatus;
  tickets_synced: number;
  error_message?: string;
  started_at: string;
  completed_at?: string;
}

export interface SyncStats {
  lastSyncAt: string | null;
  totalTickets: number;
  healthStatus: 'Live' | 'Stale' | 'Offline';
  isSyncing: boolean;
}