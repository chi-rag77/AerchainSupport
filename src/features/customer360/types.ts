export interface HealthScoreComponent {
  score: number;
  weight: number;
}

export interface AISummary {
  status: string;
  key_drivers: string[];
  top_issues: string[];
  recommended_actions: string[];
}

export interface CustomerIntelligenceData {
  customer: string;
  health_score: number;
  status: 'Excellent' | 'Healthy' | 'Watchlist' | 'At Risk' | 'Critical' | 'No Data';
  open_tickets: number;
  ticket_growth: string;
  sla_risk: 'Low' | 'Medium' | 'High';
  ai_summary: AISummary;
  confidence: number;
  explainability: string;
  health_score_components: {
    sla_adherence: HealthScoreComponent;
    sentiment: HealthScoreComponent;
    ticket_volume: HealthScoreComponent;
    escalation: HealthScoreComponent;
    unresolved: HealthScoreComponent;
  };
  metadata: {
    tier: string;
    arr: string;
    industry: string;
    since: string;
    renewal: string;
  };
}