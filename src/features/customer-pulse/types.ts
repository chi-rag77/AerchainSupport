import { Ticket } from "@/types";

export type PulseStatus = 'Healthy' | 'Watch' | 'Critical';

export interface DailyActivity {
  day: string;
  created: number;
  resolved: number;
  isSpike: boolean;
  isDip: boolean;
}

export interface IssueMetric {
  label: string;
  percentage: number;
  trend: number;
  status: 'stable' | 'increasing' | 'decreasing';
}

export interface RecurringPattern {
  id: string;
  title: string;
  count: number;
  trend: 'up' | 'repeat';
  firstSeen: string;
  impact: string;
  frequency: string;
}

export interface AgentPulse {
  name: string;
  handled: number;
  resolved: number;
  efficiency: number;
  strength: string;
  concern: string;
}

export interface PulseData {
  customer: string;
  weekRange: string;
  healthScore: number;
  status: PulseStatus;
  confidenceScore: number;
  metrics: {
    total: number;
    resolved: number;
    rate: number;
    rateTrend: number;
    primaryIssue: string;
    primaryIssuePercent: number;
  };
  comparison: {
    ticketsTrend: number;
    resolutionTrend: number;
    recurringTrend: number;
  };
  timeline: DailyActivity[];
  composition: IssueMetric[];
  aiInsights: {
    keyPoints: string[];
    rootCause: string;
    recommendations: string[];
  };
  recurringIssues: RecurringPattern[];
  agents: AgentPulse[];
  efficiency: {
    avgResolutionTime: string;
    slaCompliance: number;
    trendReason: string;
  };
  actions: {
    id: string;
    title: string;
    type: 'assign' | 'escalate' | 'task';
  }[];
}

export interface CustomerContextPreview {
  name: string;
  tickets: number;
  resolution: number;
  status: PulseStatus;
}