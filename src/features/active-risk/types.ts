import { Ticket } from "@/types";

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface RiskMetricData {
  count: number;
  trend: number;
  riskLevel: RiskLevel;
  microInsight: string;
  tickets: RiskTicket[];
}

export interface RiskTicket extends Ticket {
  riskReason: string;
  slaRemainingPercent?: number;
  suggestedAction?: string;
  confidenceScore?: number;
}

export interface ActiveRiskData {
  summary: {
    message: string;
    posture: 'Stable' | 'Deteriorating' | 'Critical';
  };
  metrics: {
    escalationRisk: RiskMetricData;
    slaRisk: RiskMetricData;
    agentOverload: RiskMetricData;
    volumeSpike: RiskMetricData;
  };
}