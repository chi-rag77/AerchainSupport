export type ActionType = 'ai' | 'rule' | 'system';
export type ActionPriority = 'critical' | 'high' | 'medium' | 'low';
export type ActionStatus = 'open' | 'in_progress' | 'resolved' | 'dismissed';
export type ActionEntityType = 'customer' | 'ticket' | 'system';

export interface Action {
  id: string;
  org_id: string;
  title: string;
  description: string;
  type: ActionType;
  priority: ActionPriority;
  impact_score: number;
  urgency_score: number;
  status: ActionStatus;
  entity_type?: ActionEntityType;
  entity_id?: string;
  suggested_actions: string[];
  assignee_id?: string;
  metadata: any;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  // Derived
  priority_score?: number;
}

export interface ActionFilters {
  status: ActionStatus[];
  priority: ActionPriority[];
  type: ActionType[];
}