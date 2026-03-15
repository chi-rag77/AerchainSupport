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

// --- Incident Explorer Types ---

export interface IssueCluster {
  id: string;
  name: string;
  ticketCount: number;
  lastSeen: string;
  trend: 'improving' | 'worsening' | 'stable';
  topErrors: string[];
  relatedTicketIds: string[];
}

export interface RecurringIssue {
  id: string;
  title: string;
  occurrenceCount: number;
  ticketCount: number;
  timeframe: string;
}

export interface IncidentEvent {
  id: string;
  date: string;
  type: 'critical' | 'high' | 'medium' | 'info';
  title: string;
  description: string;
}

export interface RootCauseMetric {
  module: string;
  percentage: number;
  context: string;
}

export interface IncidentExplorerData {
  clusters: IssueCluster[];
  recurringIssues: RecurringIssue[];
  timeline: IncidentEvent[];
  rootCauses: RootCauseMetric[];
}