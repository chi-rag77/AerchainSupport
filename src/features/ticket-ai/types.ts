export interface TicketAIAnalysis {
  id?: string;
  ticket_id: string;
  summary: string;
  customer_tone: string;
  agent_tone: string;
  escalation_risk: 'low' | 'medium' | 'high';
  is_escalating: boolean;
  sentiment_score: number;
  sentiment_trend: 'improving' | 'worsening' | 'stable';
  suggested_action: string;
  confidence_score: number;
  updated_at: string;
}