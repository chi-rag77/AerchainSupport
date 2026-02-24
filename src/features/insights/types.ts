import { Ticket } from "@/types";

export interface IssueCluster {
  id: string;
  topic: string;
  count: number;
  trend: number;
  rootCauseProbability: number;
  linkedEvent: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface ForecastPoint {
  date: string;
  actual?: number;
  predicted: number;
  upperBound: number;
  lowerBound: number;
}

export interface AutomationROI {
  potentialAutomationRate: number;
  estimatedSavings: number;
  topCategories: { name: string; deflectionPotential: number; avgResolutionTime: number }[];
}

export interface AccountHealth {
  company: string;
  healthScore: number;
  sentimentTrend: 'improving' | 'worsening' | 'stable';
  churnProbability: number;
  signals: string[];
}

export interface AgentInsight {
  name: string;
  complexityLoad: number;
  burnoutRisk: 'low' | 'medium' | 'high';
  skillMatch: number;
  recommendation: string;
}

export interface InsightsV2Data {
  summary: {
    narrative: string;
    highlights: { label: string; value: string; trend: number; type: 'positive' | 'negative' | 'neutral' }[];
  };
  clusters: IssueCluster[];
  forecast: {
    points: ForecastPoint[];
    recommendation: string;
  };
  automation: AutomationROI;
  accountRisks: AccountHealth[];
  agentIntelligence: AgentInsight[];
  businessImpact: {
    retentionImpact: number;
    annualRevenueImpact: number;
    costPerAccount: { name: string; cost: number }[];
  };
}