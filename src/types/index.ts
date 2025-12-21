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