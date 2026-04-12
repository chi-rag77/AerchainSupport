import { Ticket } from "@/features/tickets/types";

export interface AgentIntelligence {
  briefing: {
    text: string;
    mood: string;
    recommendation: string;
  };
  actions: {
    id: string;
    action: string;
    why: string;
    priority: 'urgent' | 'high' | 'medium' | 'low';
    impactMinutes: number;
    done: boolean;
  }[];
  stats: {
    handledToday: number;
    avgResTime: string;
    csat: number;
    sla: number;
    trends: {
      handled: number;
      resTime: number;
      csat: number;
      sla: number;
    };
  };
  queue: {
    total: number;
    urgent: number;
    pending: number;
    readyToClose: number;
    inProgress: number;
    healthScore: number;
  };
}

export interface AgentPreferences {
  work_hours_start: string;
  work_hours_end: string;
  dnd_hours: string;
  preferred_categories: string[];
  skills_expertise: string[];
  communication_preference: 'email' | 'chat' | 'both';
  auto_pause_duration_minutes: number;
}