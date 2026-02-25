import { Ticket } from "@/types";

export interface WeeklyMetrics {
  created: number;
  resolved: number;
  backlog: number;
  avgResolutionTime: string;
  trends: {
    created: number;
    resolved: number;
    backlog: number;
  };
}

export interface WeeklyTicketMix {
  bugs: { count: number; percentage: number };
  queries: { count: number; percentage: number };
  tasks: { count: number; percentage: number };
}

export interface WeeklyAIAnalysis {
  summary: string;
  sentiment: string;
  topIssues: string[];
  recommendations: { title: string; reason: string; priority: 'high' | 'medium' | 'low' }[];
  confidence: number;
}

export interface WeeklySummaryData {
  customerName: string;
  weekLabel: string;
  metrics: WeeklyMetrics;
  ticketMix: WeeklyTicketMix;
  aiAnalysis?: WeeklyAIAnalysis;
}