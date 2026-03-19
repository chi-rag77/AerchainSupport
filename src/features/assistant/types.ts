export type MessageRole = 'user' | 'assistant';

export interface AIAction {
  label: string;
  type: 'filter' | 'navigate' | 'api';
  payload: any;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  type?: 'insight' | 'action' | 'navigation' | 'knowledge';
  title?: string;
  bullets?: string[];
  actions?: AIAction[];
  mode?: 'ai' | 'rule';
}

export const SMART_SUGGESTIONS = [
  "Why is the backlog high?",
  "Show me all SLA risks",
  "How do I fix invoice sync errors?",
  "Assign urgent tickets to me",
  "What is the resolution trend?"
];