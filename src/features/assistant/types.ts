export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  mode: 'ai' | 'rule';
}

export interface AssistantState {
  isOpen: boolean;
  isExpanded: boolean;
  messages: ChatMessage[];
  isLoading: boolean;
  mode: 'ai' | 'rule';
}

export const SMART_SUGGESTIONS = [
  "How many tickets were created today?",
  "What is the current backlog status?",
  "Which countries are using Aerchain?",
  "How many bugs were reported today?",
  "Show me the resolution performance."
];