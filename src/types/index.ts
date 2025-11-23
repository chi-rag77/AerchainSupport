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
  description_text?: string;
  description_html?: string;
  custom_fields?: Record<string, any>;
  assignee?: string; // Added assignee field
  // Freshdesk custom fields
  cf_company?: string;
  cf_country?: string;
  cf_module?: string;
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

// New types for Customer 360° Overview
export interface Customer {
  id: string;
  name: string;
  logoUrl?: string; // Optional logo URL
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  arr: number;
  renewal: string; // ISO date string
  accountManager: string;
  healthScore: number; // 0-100
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface MoodWavePoint {
  date: string; // ISO date string
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface Event {
  id: string;
  type: 'ticket' | 'product' | 'visit' | 'call' | 'email' | 'meeting';
  date: string; // ISO date string
  title: string;
  summary: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  channels: string[]; // e.g., ["support", "billing", "web"]
  ticketId?: string; // Only for 'ticket' type events
  attachments?: { name: string; url: string; }[];
  fullContext?: string; // Detailed description for EventCard
}

export interface ModuleData {
  module: string;
  usage: number; // percentage
  errors: number; // count
  happiness: number; // 0-100
}

export interface Alert {
  id: string;
  severity: 'info' | 'warning' | 'high' | 'critical';
  message: string;
  timestamp: string; // ISO date string
  actionCta?: string;
}

export interface ActionItem {
  id: string;
  label: string;
  icon: React.ElementType;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'ghost';
}

export interface CustomerDNAProfile {
  key: string;
  value: string | number | string[];
  description: string;
}