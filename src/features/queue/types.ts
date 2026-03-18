import { Ticket } from "@/features/tickets/types";

export type QueueViewMode = 'list' | 'compact' | 'kanban' | 'cluster' | 'focus';

export interface QueueTicket extends Ticket {
  riskScore: number;
  slaRemainingMinutes: number;
  aiTags: string[];
  sentimentTrend: 'improving' | 'worsening' | 'stable';
  escalationLikelihood: number;
  suggestedNextAction: string;
}

export interface QueueState {
  viewMode: QueueViewMode;
  selectedTicketIds: string[];
  isInsightsOpen: boolean;
  sortBy: 'intent' | 'sla' | 'aging' | 'created';
}