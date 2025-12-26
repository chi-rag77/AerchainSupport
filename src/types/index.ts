export interface CustomerBreakdownRow {
  name: string;
  totalInPeriod: number; // Renamed from totalToday
  resolvedInPeriod: number; // Renamed from resolvedToday
  open: number;
  pendingTech: number;
  bugs: number;
  otherActive: number; // New field for other active statuses
  totalTicketsTrend?: number; // New: Percentage change vs. last period
}

export interface ConversationMessage {
  id: string;
  sender: string; // Name of sender (Agent or Requester)
  body_html: string; // The actual message content (can contain HTML)
  created_at: string;
  is_agent: boolean;
}

export type Insight = {
  id: string;
  type: 'stalledOnTech' | 'highPriority' | 'info' | 'highVolumeCustomer';
  message: string;
  severity: 'info' | 'warning' | 'critical';
  icon?: string;
  // New structured fields for stalledOnTech insights
  ticketId?: string;
  companyName?: string;
  ticketStatus?: string;
  daysStalled?: number;
  // New structured fields for highVolumeCustomer insights
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
  link?: string; // Optional link to a specific page/resource
  digest_key?: string; // New: Key to group similar notifications for digest
  group_count?: number; // New: Number of notifications in this digest group
};

export type OrgUser = {
  id: string;
  org_id: string;
  email: string;
  role: 'admin' | 'manager' | 'viewer';
  is_active: boolean;
  created_at: string;
};

export type OrgSettings = {
  id: string;
  org_id: string;
  freshdesk_domain: string;
  freshdesk_api_key: string;
  created_at: string;
  updated_at: string;
};

// --- Automation Rule Types ---
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
  target_value: string; // e.g., assignee email, new priority value, status value
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