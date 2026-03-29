export interface CustomerBreakdownRow {
  name: string;
  totalInPeriod: number;
  resolvedInPeriod: number;
  open: number;
  pendingTech: number;
  bugs: number;
  otherActive: number;
  totalTicketsTrend?: number;
}

export interface ConversationMessage {
  id: string;
  sender: string;
  body_html: string;
  created_at: string;
  is_agent: boolean;
}

export type UserRole = 'admin' | 'manager' | 'viewer';

export interface OrgUser {
  id: string;
  org_id: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  display_name?: string;
  avatar_url?: string;
  last_active_at?: string;
  created_at: string;
}

export interface Invitation {
  id: string;
  org_id: string;
  email: string;
  role: UserRole;
  token: string;
  invited_by: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  expires_at: string;
  accepted_at?: string;
  created_at: string;
  invited_by_name?: string;
}

export interface AuditLog {
  id: string;
  org_id: string;
  actor_id: string;
  actor_email: string;
  action: string;
  target_type?: string;
  target_id?: string;
  target_email?: string;
  old_value?: any;
  new_value?: any;
  created_at: string;
}

export type Insight = {
  id: string;
  type: 'stalledOnTech' | 'highPriority' | 'info' | 'highVolumeCustomer';
  message: string;
  severity: 'info' | 'warning' | 'critical';
  icon?: string;
  ticketId?: string;
  companyName?: string;
  ticketStatus?: string;
  daysStalled?: number;
  customerName?: string;
  ticketCount?: number;
};

export type Notification = {
  id: string;
  user_id: string;
  message: string;
  type: 'info' | 'warning' | 'critical' | 'success';
  read: boolean;
  created_at: string;
  link?: string;
  digest_key?: string;
  group_count?: number;
};

export type OrgSettings = {
  id: string;
  org_id: string;
  freshdesk_domain: string;
  freshdesk_api_key: string;
  created_at: string;
  updated_at: string;
  webhook_secret?: string;
  last_sync_at?: string;
  sync_enabled?: boolean;
};

export type RuleField = 'status' | 'priority' | 'assignee' | 'company' | 'type' | 'age_days' | 'time_since_update_hours';
export type RuleOperator = 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'is_past';
export type RuleActionType = 'reassign' | 'update_priority' | 'update_status' | 'send_notification';

export interface RuleCondition {
  field: RuleField;
  operator: RuleOperator;
  value: string | number;
}

export interface RuleAction {
  type: RuleActionType;
  target_value: string;
}

export interface AutomationRule {
  id: string;
  org_id: string;
  name: string;
  is_active: boolean;
  trigger_conditions: RuleCondition[];
  actions: RuleAction[];
  last_executed_at: string | null;
  created_at: string;
}