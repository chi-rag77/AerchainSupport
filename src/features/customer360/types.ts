export interface CustomerIntelligenceData {
  customer: string;
  health_score: number;
  status: 'Excellent' | 'Healthy' | 'Watchlist' | 'At Risk' | 'Critical' | 'No Data';
  open_tickets: number;
  ticket_growth: string;
  sla_risk: 'Low' | 'Medium' | 'High';
  ai_summary: string;
  confidence: number;
  metadata: {
    tier: string;
    arr: string;
    industry: string;
    since: string;
    renewal: string;
  };
}