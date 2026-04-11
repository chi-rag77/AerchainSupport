import { Ticket, Insight } from "@/types";

export type KPIArchetype = 'volume' | 'backlog' | 'resolved' | 'attention' | 'risk' | 'health' | 'recurrence' | 'quality';

export interface KPIMetric {
  title: string;
  value: number | string;
  trend: number;
  microInsight: string;
  archetype: KPIArchetype;
  sparklineData: { value: number }[];
}

export interface GeographicData {
  countryCode: string;
  countryName: string;
  total: number;
  resolved: number;
  open: number;
}

export interface GeographySummary {
  activeCountries: number;
  totalGlobalTickets: number;
  topRegion: string;
  distribution: GeographicData[];
}

export interface Bottleneck {
  category: string;
  count: number;
  trend: number;
  impactLevel: "low" | "medium" | "high";
  avgAge: number;
  aiInsight: string;
}

export interface ForecastData {
  forecastVolume: number;
  forecastSLA: number;
  breachProbability: number;
  aiNarrative: string;
}

export interface CustomerRisk {
  company: string;
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  openCount: number;
  urgentCount: number;
  slaMetPercent: number;
  sentiment: number; // -1 to 1
}

export interface IssueCluster {
  id: string;
  title: string;
  occurrences: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  impact: 'High' | 'Medium' | 'Low';
  modules: string[];
  rootCause: string;
  suggestedFix: string;
}

export interface ExecutiveAction {
  id: string;
  title: string;
  riskAddressed: string;
  impact: string;
  priority: 'low' | 'medium' | 'high';
}

export interface ExecutiveSummary {
  summary: string;
  riskLevel: string;
  confidenceScore: number;
  keyDrivers: string[];
  executiveAction: string;
  updatedAt: string;
}

export interface DashboardData {
  executiveSummary: ExecutiveSummary | null;
  kpis: KPIMetric[];
  geography: GeographySummary;
  risks: any[];
  bottlenecks: Bottleneck[];
  forecast: ForecastData;
  customerRisks: CustomerRisk[];
  agentCapacity: AgentCapacity[];
  clusters: IssueCluster[];
  slaTimeline: { date: string; status: 'green' | 'amber' | 'red' }[];
  actions: ExecutiveAction[];
  systemHealth: {
    aiConfidence: number;
    dataFreshness: string;
    syncIntegrity: 'Healthy' | 'Degraded';
  };
  lastSync: string;
  insights: any[];
  slaRiskScore: number;
  tickerMetrics: {
    created: { value: number; delta: number };
    resolved: { value: number; delta: number };
  };
}