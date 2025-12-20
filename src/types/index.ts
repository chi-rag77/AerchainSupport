export type Ticket = {
  id: string;
  customer_id?: string; // customer_id might not always be present or directly mapped from Freshdesk
  subject: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent' | `Unknown (${number})`; // Added Unknown for unmapped priorities
  status: 'Open (Being Processed)' | 'Pending (Awaiting your Reply)' | 'Resolved' | 'Closed' | 'Waiting on Customer' | 'On Tech' | 'On Product' | 'Escalated' | `Unknown (${number})`; // Updated with Freshdesk statuses and Unknown
  type?: string;
  customer?: string;
  requester_email: string;
  created_at: string;
  updated_at: string;
  due_by?: string;
  fr_due_by?: string;
  resolved_at?: string; // New: Timestamp when the ticket was resolved/closed
  first_response_at?: string; // New: Timestamp of the first response
  description_text?: string;
  description_html?: string;
  custom_fields?: Record<string, any>;
  assignee?: string; // Added assignee field
  // Freshdesk custom fields
  cf_company?: string;
  cf_country?: string; // New: Custom field for country
  cf_module?: string; // New: Custom field for module
  cf_dependency?: string;
  cf_recurrence?: string;
  ageing?: number; // Added ageing field
};

export type TicketMessage = {
  id: string;
  ticket_id: string;
  sender: string;
  body_html?: string;
  created_at: string;
  is_agent: boolean;
};

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