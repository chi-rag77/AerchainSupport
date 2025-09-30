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
  totalOpenTicketsOverall: number; // New field for overall open tickets
}

export interface ConversationMessage {
  id: string;
  sender: string; // Name of sender (Agent or Requester)
  body_html: string; // The actual message content (can contain HTML)
  created_at: string;
  is_agent: boolean;
}