import { Ticket, Insight } from "@/types";

export interface ExecutiveSummary {
  summary: string;
  keyDrivers: string[];
  trendDirection: 'improving' | 'worsening' | 'stable';
  executiveAction: string;
  confidenceScore: number;
}

export interface KPIMetric {
  title: string;
  value: number | string;
  trend: number;
  microInsight: string;
  archetype: 'volume' | 'health' | 'attention';
}

export interface RiskMetric {
  title: string;
  count: number;
  trend: number;
  color: string;
}

export interface AgentIntelligence {
  name: string;
  status: 'Normal' | 'Overloaded';
  openCount: number;
  urgentCount: number;
  avgAge: string;
  riskInsight?: string;
}

export interface DashboardData {
  executiveSummary: ExecutiveSummary | null;
  kpis: KPIMetric[];
  risks: RiskMetric[];
  team: AgentIntelligence[];
  slaRiskScore: number; // 0-100
  lastSync: string;
}