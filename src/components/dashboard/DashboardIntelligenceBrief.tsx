"use client";

import React, { useMemo } from 'react';
import { 
  AlertCircle, AlertTriangle, Info, CheckCircle2, 
  ArrowRight, Zap, Bot
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DashboardData } from '@/features/dashboard/types';

interface DashboardIntelligenceBriefProps {
  data: DashboardData;
}

const DashboardIntelligenceBrief = ({ data }: DashboardIntelligenceBriefProps) => {
  if (!data) return null;

  // --- 1. Health Snapshot Logic ---
  const healthNudge = useMemo(() => {
    const avgCapacity = data.agentCapacity.length > 0 
      ? Math.round(data.agentCapacity.reduce((acc, curr) => acc + curr.capacityPercent, 0) / data.agentCapacity.length)
      : 0;
    
    const status = avgCapacity > 90 ? 'Strained' : 'Healthy';
    
    return {
      type: 'info' as const,
      statusLabel: 'INFO',
      title: avgCapacity > 90 ? "Capacity Strained" : "Capacity Optimal",
      description: `Team at ${avgCapacity}% capacity with ${data.tickerMetrics.created.value} tickets created today.`,
      footerMetric: `Queue: ${status}`,
      linkText: "View Team",
    };
  }, [data]);

  // --- 2. Risk Signals Logic ---
  const riskNudge = useMemo(() => {
    const topRisk = data.customerRisks[0];
    const totalAtRisk = data.customerRisks.filter(r => r.riskLevel === 'HIGH').length;

    return {
      type: 'critical' as const,
      statusLabel: 'CRITICAL',
      title: "Churn Risk Detected",
      description: topRisk 
        ? `${topRisk.company} has ${topRisk.urgentCount} urgent tickets — reach out now`
        : `${totalAtRisk} customers are trending toward churn.`,
      footerMetric: topRisk ? `${topRisk.riskScore}/100 risk score` : "No high risks",
      linkText: "View Customer",
    };
  }, [data]);

  // --- 3. Product Intelligence Logic ---
  const productNudge = useMemo(() => {
    const topCluster = data.clusters[0];
    const spike = data.kpis.find(k => k.archetype === 'volume')?.trend || 0;

    return {
      type: 'warning' as const,
      statusLabel: 'WARNING',
      title: topCluster ? `${topCluster.title} Spiking` : "Issue Volume Spiking",
      description: topCluster 
        ? `${topCluster.occurrences} tickets this week. Likely ${topCluster.modules[0]} issue.`
        : `Ticket volume is up ${spike}% this week across all modules.`,
      footerMetric: `↑ ${Math.abs(spike)}% volume`,
      linkText: "Notify Product",
    };
  }, [data]);

  // --- 4. Forecast Logic ---
  const forecastNudge = useMemo(() => {
    const slaRate = data.kpis.find(k => k.archetype === 'attention')?.value || '0%';
    const prob = Math.round(data.forecast.breachProbability * 100);

    return {
      type: 'success' as const,
      statusLabel: 'SUCCESS',
      title: prob > 50 ? "SLA at Risk" : "SLA On Track",
      description: `${slaRate} adherence this week — ${prob}% chance of breaches next week.`,
      footerMetric: `${slaRate} SLA rate`,
      linkText: "View SLA",
    };
  }, [data]);

  const nudges = [riskNudge, productNudge, healthNudge, forecastNudge];

  const typeGradients = {
    critical: "bg-gradient-to-br from-rose-50/80 to-white dark:from-rose-950/20 dark:to-gray-950",
    warning: "bg-gradient-to-br from-amber-50/80 to-white dark:from-amber-950/20 dark:to-gray-950",
    info: "bg-gradient-to-br from-blue-50/80 to-white dark:from-blue-950/20 dark:to-gray-950",
    success: "bg-gradient-to-br from-emerald-50/80 to-white dark:from-emerald-950/20 dark:to-gray-950",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <span className="text-lg">🤖</span>
        <h3 className="text-sm font-black text-foreground flex items-center gap-2">
          AI Insights <span className="text-muted-foreground font-medium lowercase tracking-normal">• 4 nudges</span>
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 border border-border rounded-[20px] bg-white dark:bg-gray-950 overflow-hidden shadow-sm">
        {nudges.map((nudge, idx) => {
          const isCritical = nudge.type === 'critical';
          const isWarning = nudge.type === 'warning';
          const isSuccess = nudge.type === 'success';
          const isInfo = nudge.type === 'info';

          const Icon = isCritical ? AlertCircle : isWarning ? AlertTriangle : isSuccess ? CheckCircle2 : Info;
          
          return (
            <div 
              key={idx} 
              className={cn(
                "p-6 flex flex-col justify-between min-h-[180px] transition-all duration-300",
                typeGradients[nudge.type],
                idx === 0 && "border-r border-b border-border",
                idx === 1 && "border-b border-border",
                idx === 2 && "border-r border-border",
                "group"
              )}
            >
              <div className="space-y-4">
                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "p-1 rounded-md",
                    isCritical && "text-rose-600 bg-rose-100 dark:bg-rose-900/40",
                    isWarning && "text-amber-600 bg-amber-100 dark:bg-amber-900/40",
                    isInfo && "text-blue-600 bg-blue-100 dark:bg-blue-900/40",
                    isSuccess && "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40"
                  )}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest",
                    isCritical && "text-rose-600",
                    isWarning && "text-amber-600",
                    isInfo && "text-blue-600",
                    isSuccess && "text-emerald-600"
                  )}>
                    {nudge.statusLabel}
                  </span>
                </div>

                {/* Content */}
                <div className="space-y-1">
                  <h4 className="text-base font-bold tracking-tight text-foreground">{nudge.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {nudge.description}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-tighter">
                  {nudge.footerMetric}
                </span>
                <button className="text-[11px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-all group-hover:gap-2">
                  {nudge.linkText} <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardIntelligenceBrief;