export interface HealthScoreComponent {
  score: number;
  weight: number;
}

export interface AISummary {
  root_issue: {
    module: string;
    percentage: number;
    description: string;
    insight: string;
  };
  composition: {
    bugs: number;
    queries: number;
    config: number;
    insight: string;
  };
  suggested_actions: {
    type: 'engineering' | 'education' | 'risk';
    title: string;
    description: string;
    items: string[];
  }[];
  operational_risk: {
    level: 'Low' | 'Medium' | 'High';
    metric: string;
    target: string;
    description: string;
  };
  reasoning: string[];
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