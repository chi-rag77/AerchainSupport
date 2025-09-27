export type Ticket = {
  id: string;
  customer_id: string;
  subject: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'Pending' | 'Resolved' | 'Closed';
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
};

export type TicketMessage = {
  id: string;
  ticket_id: string;
  sender: string;
  body_html?: string;
  created_at: string;
  is_agent: boolean;
};