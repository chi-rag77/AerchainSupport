import { Ticket } from "@/types";

export interface RecurringIssueCluster {
  id: string;
  title: string;
  occurrences: number;
  modules: string[];
  trend: 'increasing' | 'stable' | 'decreasing';
  impact: 'High' | 'Medium' | 'Low';
  rootCause: string;
  suggestedFix: string;
  confidence: number;
  history: { month: string; count: number }[];
  requiresEscalation: boolean;
  sampleTickets: string[]; // IDs of sample tickets
}

export interface RecurringIssueRadarData {
  clusters: RecurringIssueCluster[];
  moduleDistribution: { module: string; percentage: number }[];
  globalTrend: number;
  totalRecurringTickets: number;
}