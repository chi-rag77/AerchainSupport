"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { 
  AlertCircle, AlertTriangle, Info, CheckCircle2, 
  ArrowRight, Sparkles, Brain, TrendingUp, Zap 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface IntelligenceCardProps {
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  description: React.ReactNode;
  footerMetric: string;
  linkText: string;
  onLinkClick?: () => void;
}

const IntelligenceCard = ({ type, title, description, footerMetric, linkText, onLinkClick }: IntelligenceCardProps) => {
  const config = {
    critical: {
      icon: AlertCircle,
      label: "CRITICAL",
      colors: "border-rose-100 bg-white dark:bg-gray-900",
      badge: "text-rose-600 bg-rose-50 dark:bg-rose-900/20",
      iconColor: "text-rose-600"
    },
    warning: {
      icon: AlertTriangle,
      label: "WARNING",
      colors: "border-amber-100 bg-white dark:bg-gray-900",
      badge: "text-amber-600 bg-amber-50 dark:bg-amber-900/20",
      iconColor: "text-amber-600"
    },
    info: {
      icon: Info,
      label: "INFO",
      colors: "border-blue-100 bg-white dark:bg-gray-900",
      badge: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
      iconColor: "text-blue-600"
    },
    success: {
      icon: Zap,
      label: "SUCCESS",
      colors: "border-emerald-100 bg-white dark:bg-gray-900",
      badge: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
      iconColor: "text-emerald-600"
    }
  }[type];

  const Icon = config.icon;

  return (
    <Card className={cn("border shadow-sm rounded-xl overflow-hidden group transition-all hover:shadow-md", config.colors)}>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className={cn("p-1 rounded-md", config.badge)}>
            <Icon className="h-3.5 w-3.5" />
          </div>
          <span className={cn("text-[10px] font-black uppercase tracking-widest", config.iconColor)}>
            {config.label}
          </span>
        </div>

        <div className="space-y-1.5">
          <h4 className="text-base font-bold tracking-tight text-foreground">{title}</h4>
          <div className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </div>
        </div>

        <div className="pt-3 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-tighter">
            {footerMetric}
          </span>
          <button 
            onClick={onLinkClick}
            className="text-[11px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-all group-hover:gap-2"
          >
            {linkText} <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

interface DashboardIntelligenceBriefProps {
  data: any;
}

const DashboardIntelligenceBrief = ({ data }: DashboardIntelligenceBriefProps) => {
  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <Brain className="h-4 w-4 text-indigo-600" />
        <h3 className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-2">
          AI Insights <span className="text-muted-foreground font-medium lowercase tracking-normal">• 4 nudges</span>
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Health Snapshot */}
        <IntelligenceCard 
          type="info"
          title="Health Snapshot"
          description={
            <>
              Your support team is running at <span className="font-bold text-foreground">74% capacity</span> with <span className="font-bold text-foreground">1,247 tickets created today</span> and <span className="font-bold text-foreground">89% resolution rate</span>. The team resolved 456 tickets this week, averaging 123 hours per resolution (vs 145h target). ✓ Operations look healthy overall.
            </>
          }
          footerMetric="Queue: Healthy"
          linkText="View Team"
        />

        {/* 2. Risk Signals */}
        <IntelligenceCard 
          type="critical"
          title="Churn Risk Detected"
          description={
            <>
              Escalations are up 30% this week (7 escalations vs baseline 5.3), and 8 customers are trending toward churn. The top concern: <span className="font-bold text-rose-600">Acme Corp</span> with 5 escalations in 3 days. 3 SLA breaches detected—recommend CSM outreach.
            </>
          }
          footerMetric="87/100 risk score"
          linkText="View Customer"
        />

        {/* 3. Product Intelligence */}
        <IntelligenceCard 
          type="warning"
          title="API Tickets Spiking"
          description={
            <>
              Payment Integration issues are spiking (+300%): 28 tickets this week vs 6 last week. This affects 12 customers. → Export feature trending down (improving): 15 tickets with steady close rate. 18% of all tickets relate to 3 recurring issues.
            </>
          }
          footerMetric="↑ 300% volume"
          linkText="Notify Product"
        />

        {/* 4. Forecast */}
        <IntelligenceCard 
          type="success"
          title="SLA On Track"
          description={
            <>
              Expect ~950 tickets (±12%) next week, with 38% chance of SLA breaches. Churn risk forecast: 4-6 customers at elevated risk. ✓ Recommendation: Maintain current team capacity and proactively reach out to flagged accounts.
            </>
          }
          footerMetric="94% SLA rate"
          linkText="View SLA"
        />
      </div>
    </div>
  );
};

export default DashboardIntelligenceBrief;