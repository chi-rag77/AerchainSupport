export interface RootCauseCluster {
  topic: string;
  growth: number;
  probability: number;
  source: string;
  impact: 'low' | 'medium' | 'high';
}

export interface AutomationOpportunity {
  category: string;
  potential: number; // percentage
  savings: string;
  effort: 'low' | 'medium' | 'high';
}

export interface AccountHealth {
  company: string;
  sentiment: 'Positive' | 'Neutral' | 'Frustrated' | 'Critical';
  sentimentScore: number;
  churnRisk: 'Low' | 'Medium' | 'High';
  healthScore: number;
}

export interface AgentIntelligence {
  name: string;
  loadPercent: number;
  burnoutRisk: 'Low' | 'Medium' | 'High';
  complexityMix: string; // e.g., "35% Complex"
  recommendation: string;
}

export interface InsightsV2Data {
  summary: {
    narrative: string;
    volumeTrend: number;
    trendingTopic: string;
    highRiskAccounts: number;
    automationPotential: number;
  };
  rootCauses: RootCauseCluster[];
  forecast: {
    expectedVolume: number;
    volumeTrend: number;
    predictedSLA: number;
    slaTrend: number;
    recommendation: string;
  };
  automation: AutomationOpportunity[];
  accountHealth: AccountHealth[];
  agentIntel: AgentIntelligence[];
  businessImpact: {
    retentionImprovement: number;
    estimatedImpact: string;
    costPerTicket: string;
  };
  lastSync: string;
  confidence: number;
}