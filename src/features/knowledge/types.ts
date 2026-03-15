export type KnowledgeCategory = 'Product' | 'Customer Specific' | 'Support SOP';

export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: KnowledgeCategory;
  customer_name?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface KnowledgeDocument {
  id: string;
  name: string;
  file_path: string;
  file_type: string;
  category: KnowledgeCategory;
  customer_name?: string;
  metadata: any;
  created_at: string;
}

export interface ImplementationDNA {
  erp: string;
  approval_levels: number;
  integrations_count: number;
  high_risk_modules: string[];
  custom_validations: boolean;
}

export interface CustomerImplementation {
  id: string;
  customer_name: string;
  dna_summary: ImplementationDNA;
  config_details: string;
  updated_at: string;
}

export interface ExpertChat {
  id: string;
  ticket_id: string;
  expert_id?: string;
  status: 'open' | 'resolved';
  created_at: string;
}

export interface ExpertChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  message: string;
  attachments?: string[];
  created_at: string;
}