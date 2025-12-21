export type Ticket = {
  id: string;
  customer_id?: string;
  subject: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent' | `Unknown (${number})`;
  status: 'Open (Being Processed)' | 'Pending (Awaiting your Reply)' | 'Resolved' | 'Closed' | 'Waiting on Customer' | 'On Tech' | 'On Product' | 'Escalated' | `Unknown (${number})`;
  type?: string;
  customer?: string;
  requester_email: string;
  created_at: string;
  updated_at: string;
  due_by?: string;
  fr_due_by?: string;
  resolved_at?: string;
  first_response_at?: string;
  description_text?: string;
  description_html?: string;
  custom_fields?: Record<string, any>;
  assignee?: string;
  cf_company?: string;
  cf_country?: string;
  cf_module?: string;
  cf_dependency?: string;
  cf_recurrence?: string;
  ageing?: number;
};

export type TicketMessage = {
  id: string;
  ticket_id: string;
  sender: string;
  body_html?: string;
  created_at: string;
  is_agent: boolean;
};

export interface TicketFilters {
  searchTerm: string;
  status: string;
  priority: string;
  assignees: string[];
  companies: string[];
  types: string[];
  dependencies: string[];
  myTickets: boolean;
  highPriority: boolean;
  slaBreached: boolean;
  dateField: 'created_at' | 'updated_at';
  dateRange?: { from?: Date; to?: Date };
}