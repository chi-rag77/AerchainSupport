import { Ticket } from "@/types";

export interface RiskSignal {
  id: string;
  title: string;
  description: string;
  impactScope: string;
  confidence: number;
  severity: 'critical' | 'warning' | 'info';
}

export interface CustomerMomentum {
  company: string;
  score: number;
  status: 'improving' | 'stable' | 'at-risk';
  volume: number;
  sentimentDelta: number;
}

export interface IssueCluster {
  topic: string;
  growth: number;
  exposure: number;
  riskLevel: 'high' | 'medium' | 'low';
}

export interface WeeklyAIAnalysis {
  improvement: string;
  degradation: string;
  pattern: string;
  attention: string;
  confidence: number;
}

export interface WeeklyIntelligenceData {
  customerName: string;
  weekLabel: string;
  
  stabilityIndex: {
    score: number;
    status: 'Stable' | 'Watch' | 'Degrading';
    trend: number;
  };
  snapshot: {
    ticketsOpened: { value: number; trend: number };
    slaBreach: { value: number; trend: number };
    escalationRate: { value: number; trend: number };
    avgResponseTime: { value: string; trend: number };
    sentimentScore: { value: number; trend: number };
  };

  trends: {
    label: string;
    direction: 'up' | 'down' | 'stable';
    acceleration: number;
    volatility: number;
    value: string | number;
  }[];

  riskSignals: RiskSignal[];
  customerRadar: CustomerMomentum[];
  issueClusters: IssueCluster[];

  frictionIndex: number;
  efficiencyScore: number;
  forecast: {
    nextWeekSla: number;
    probability: number;
    narrative: string;
  };

  aiNarrative: WeeklyAIAnalysis;
  actions: { title: string; reason: string; priority: 'high' | 'medium' | 'low' }[];
}