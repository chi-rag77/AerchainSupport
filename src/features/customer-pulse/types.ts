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
  trend: 'up' | 'repeat' | 'down';
  firstSeen: string;
  impact: 'High' | 'Medium' | 'Low';
  frequency: 'Daily' | 'Weekly' | 'Intermittent';
  insight: string;
}

export interface AgentPerformance {
  name: string;
  tickets: number;
  efficiency: number;
  avg_time: string;
  sla: number;
  strength: string;
  concern: string;
  signal: 'Strong' | 'Attention' | 'Risk';
  workload: 'Balanced' | 'High' | 'Overloaded';
  taskMix: { label: string; percent: number }[];
}

export interface TeamMember {
  name: string;
  tickets: number;
  percent: number;
}

export interface CustomerDigest {
  customerName: string;
  weekLabel: string;
  aiSummary: string;
  metrics: {
    volume: { total: number; wow: number };
    classification: { bugs: number; queries: number; tasks: number; features: number };
    status: { closed: number; open: number; backlog: number };
    sla: { adherence: number };
    critical: { urgent: number; escalated: number };
  };
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
  agentPerformance: {
    primary: AgentPerformance;
    team: TeamMember[];
  };
  efficiency: {
    avg_resolution_time: string;
    sla_compliance: number;
    first_response_time: string;
    efficiency_score: number;
    bottlenecks: any[];
    insights: any;
  };
  actions: {
    id: string;
    title: string;
    type: 'assign' | 'escalate' | 'task';
  }[];
}