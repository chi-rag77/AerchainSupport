export type ReportCategory = 
  | 'Customer Health' 
  | 'Support Performance' 
  | 'Ticket Insights' 
  | 'Implementation' 
  | 'Executive';

export type ChartType = 'bar' | 'line' | 'pie' | 'kpi' | 'table' | 'treemap';

export interface Report {
  id: string;
  title: string;
  description: string;
  category: ReportCategory;
  type: ChartType;
  dataSource: 'tickets' | 'customers' | 'implementations';
  config: any;
  isCustom?: boolean;
  lastRun?: string;
}

export interface ReportMetric {
  label: string;
  value: string | number;
  trend: number;
  status: 'good' | 'warning' | 'critical' | 'neutral';
}