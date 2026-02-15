export type SlackEventType = 
  | 'SLA_BREACH' 
  | 'ESCALATION_RISK' 
  | 'DAILY_SUMMARY' 
  | 'VOLUME_SPIKE' 
  | 'AGENT_OVERLOAD';

export interface SlackIntegration {
  id: string;
  org_id: string;
  workspace_name: string;
  workspace_id: string;
  is_active: boolean;
  default_channel_id?: string;
  created_at: string;
}

export interface SlackNotificationRule {
  id: string;
  org_id: string;
  event_type: SlackEventType;
  channel_id: string;
  is_enabled: boolean;
}

export interface SlackChannel {
  id: string;
  name: string;
  is_private: boolean;
}