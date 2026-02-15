export interface TrendPoint {
  date: string;
  ticketsCreated: number;
  slaCompliance: number;
}

export interface TrendSignals {
  startDate: string;
  endDate: string;
  avgVolume: number;
  volumeChangePercent: number;
  avgSLA: number;
  slaChangePercent: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface AIIntelligence {
  summary: string;
  rootCause: string;
  recommendedAction: string;
  confidenceScore: number;
}

export interface TrendIntelligenceData {
  trendData: TrendPoint[];
  signals: TrendSignals;
  intelligence: AIIntelligence | null;
}