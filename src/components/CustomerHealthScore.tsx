"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket } from '@/types';
import { cn } from '@/lib/utils';
import { Heart, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle, Sparkles, MessageSquare } from 'lucide-react';
import { differenceInDays, parseISO, isPast, subDays } from 'date-fns';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface CustomerHealthScoreProps {
  tickets: Ticket[];
  customerName: string;
}

// Default weights for the implementable sub-scores (re-normalized to sum to 100%)
const WEIGHTS = {
  slaAdherence: 0.35,
  resolutionTime: 0.30,
  escalationRate: 0.15,
  ticketVolumeTrend: 0.10,
  ticketCleanliness: 0.10,
};

// Default targets for calculations
const RESOLUTION_TARGET_DAYS = 3; // Example: 3 days
const TREND_FACTOR = 2; // As per user's suggestion for ticket volume trend

const CustomerHealthScore = ({ tickets, customerName }: CustomerHealthScoreProps) => {
  const healthMetrics = useMemo(() => {
    if (!tickets || tickets.length === 0) {
      return {
        score: 0,
        tier: "No Data",
        slaAdherence: { score: 0, raw: "N/A" },
        resolutionTime: { score: 0, raw: "N/A" },
        escalationRate: { score: 0, raw: "N/A" },
        ticketVolumeTrend: { score: 0, raw: "N/A" },
        ticketCleanliness: { score: 0, raw: "N/A" },
        unimplemented: {
          reopenRate: "Requires historical status changes (e.g., 'reopened_count' field)",
          engagementReplyTime: "Requires message event data (e.g., 'median_customer_reply_minutes')",
          productUsageCoverage: "Requires product usage data (e.g., 'modules_in_use_pct')",
        }
      };
    }

    // --- 1. SLA Adherence (score_sla) ---
    const slaApplicableTickets = tickets.filter(t => t.due_by);
    const slaMetCount = slaApplicableTickets.filter(t => {
      const updatedAt = parseISO(t.updated_at);
      const dueBy = parseISO(t.due_by!);
      return updatedAt <= dueBy;
    }).length;
    const sla_met_pct = slaApplicableTickets.length > 0 ? (slaMetCount / slaApplicableTickets.length) * 100 : 100; // If no SLA tickets, assume 100% met
    const score_sla = sla_met_pct;

    // --- 2. Resolution Time (score_res) ---
    const resolvedTickets = tickets.filter(t => t.status.toLowerCase() === 'resolved' || t.status.toLowerCase() === 'closed');
    let median_resolution_days: number | "N/A" = "N/A";
    if (resolvedTickets.length > 0) {
      const resolutionTimes = resolvedTickets.map(t => differenceInDays(parseISO(t.updated_at), parseISO(t.created_at))).sort((a, b) => a - b);
      const mid = Math.floor(resolutionTimes.length / 2);
      median_resolution_days = resolutionTimes.length % 2 === 0
        ? (resolutionTimes[mid - 1] + resolutionTimes[mid]) / 2
        : resolutionTimes[mid];
    }
    const score_res = median_resolution_days !== "N/A" && median_resolution_days > 0
      ? Math.min(100, (100 * RESOLUTION_TARGET_DAYS) / median_resolution_days)
      : 100; // If no resolved tickets or median is 0, assume perfect score

    // --- 3. Escalation Rate (score_escal) ---
    const escalatedTickets = tickets.filter(t => t.status.toLowerCase() === 'escalated').length;
    const escalation_pct = (escalatedTickets / tickets.length) * 100;
    const score_escal = (1 - escalation_pct / 100) * 100;

    // --- 4. Ticket Volume Trend (score_trend) ---
    const now = new Date();
    const last30DaysStart = subDays(now, 30);
    const prev30DaysStart = subDays(now, 60);

    const ticketsLast30 = tickets.filter(t => parseISO(t.created_at) >= last30DaysStart).length;
    const ticketsPrev30 = tickets.filter(t => parseISO(t.created_at) >= prev30DaysStart && parseISO(t.created_at) < last30DaysStart).length;

    let trend_pct = 0;
    if (ticketsPrev30 > 0) {
      trend_pct = ((ticketsLast30 - ticketsPrev30) / ticketsPrev30) * 100;
    } else if (ticketsLast30 > 0) {
      trend_pct = 100; // All new tickets in current period
    }

    let score_trend = 0;
    if (trend_pct <= 0) {
      score_trend = 100;
    } else {
      score_trend = Math.max(0, 100 - trend_pct * TREND_FACTOR);
    }

    // --- 5. Ticket Cleanliness (score_clean) ---
    let cleanTickets = 0;
    tickets.forEach(ticket => {
      const isSubjectGood = ticket.subject && ticket.subject.length >= 10;
      const isDescriptionGood = (ticket.description_text && ticket.description_text.length >= 20) || (ticket.description_html && ticket.description_html.length >= 20);
      const isTypeCategorized = ticket.type && ticket.type !== 'Unknown Type';
      const isModuleCategorized = ticket.cf_module && ticket.cf_module !== 'N/A'; // Assuming 'N/A' is a placeholder for uncategorized

      if (isSubjectGood && isDescriptionGood && isTypeCategorized && isModuleCategorized) {
        cleanTickets++;
      }
    });
    const clean_pct = (cleanTickets / tickets.length) * 100;
    const score_clean = clean_pct;

    // --- Calculate Final Health Score ---
    const finalHealthScore =
      score_sla * WEIGHTS.slaAdherence +
      score_res * WEIGHTS.resolutionTime +
      score_escal * WEIGHTS.escalationRate +
      score_trend * WEIGHTS.ticketVolumeTrend +
      score_clean * WEIGHTS.ticketCleanliness;

    let tier = "";
    if (finalHealthScore >= 80) tier = "Healthy";
    else if (finalHealthScore >= 60) tier = "At-risk";
    else if (finalHealthScore >= 40) tier = "Needs action soon";
    else tier = "Critical";

    return {
      score: parseFloat(finalHealthScore.toFixed(1)),
      tier,
      slaAdherence: { score: parseFloat(score_sla.toFixed(1)), raw: `${sla_met_pct.toFixed(1)}%` },
      resolutionTime: { score: parseFloat(score_res.toFixed(1)), raw: `${median_resolution_days} days (Target: ${RESOLUTION_TARGET_DAYS} days)` },
      escalationRate: { score: parseFloat(score_escal.toFixed(1)), raw: `${escalation_pct.toFixed(1)}%` },
      ticketVolumeTrend: { score: parseFloat(score_trend.toFixed(1)), raw: `${trend_pct.toFixed(1)}%` },
      ticketCleanliness: { score: parseFloat(score_clean.toFixed(1)), raw: `${clean_pct.toFixed(1)}%` },
      unimplemented: {
        reopenRate: "Requires historical status changes (e.g., 'reopened_count' field)",
        engagementReplyTime: "Requires message event data (e.g., 'median_customer_reply_minutes')",
        productUsageCoverage: "Requires product usage data (e.g., 'modules_in_use_pct')",
      }
    };
  }, [tickets]);

  const getHealthColorClass = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    if (score >= 40) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const getTierColorClass = (tier: string) => {
    switch (tier) {
      case "Healthy": return "bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-200";
      case "At-risk": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-200";
      case "Needs action soon": return "bg-orange-100 text-orange-800 dark:bg-orange-950/30 dark:text-orange-200";
      case "Critical": return "bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-950/30 dark:text-gray-200";
    }
  };

  return (
    <Card className="relative overflow-hidden group transition-all duration-300 hover:shadow-lg hover:scale-[1.02] h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" /> Customer Health Score
        </CardTitle>
        <span className={cn("px-3 py-1 rounded-full text-xs font-semibold", getTierColorClass(healthMetrics.tier))}>
          {healthMetrics.tier}
        </span>
      </CardHeader>
      <CardContent className="text-sm space-y-4">
        <div className="flex items-baseline justify-between">
          <p className="text-muted-foreground">Overall Health:</p>
          <div className="text-5xl font-bold">
            <span className={getHealthColorClass(healthMetrics.score)}>{healthMetrics.score}</span>
            <span className="text-xl text-muted-foreground">/100</span>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-foreground flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" /> Component Scores
          </h4>
          <ul className="space-y-1">
            <li className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-1"><CheckCircle className="h-4 w-4 text-green-500" /> SLA Adherence:</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="font-medium text-foreground">{healthMetrics.slaAdherence.score} <span className="text-xs text-muted-foreground">({healthMetrics.slaAdherence.raw})</span></span>
                </TooltipTrigger>
                <TooltipContent>Percentage of tickets resolved within SLA.</TooltipContent>
              </Tooltip>
            </li>
            <li className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-1"><Clock className="h-4 w-4 text-blue-500" /> Resolution Time:</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="font-medium text-foreground">{healthMetrics.resolutionTime.score} <span className="text-xs text-muted-foreground">({healthMetrics.resolutionTime.raw})</span></span>
                </TooltipTrigger>
                <TooltipContent>Median resolution time vs. target ({RESOLUTION_TARGET_DAYS} days).</TooltipContent>
              </Tooltip>
            </li>
            <li className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-1"><AlertCircle className="h-4 w-4 text-red-500" /> Escalation Rate:</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="font-medium text-foreground">{healthMetrics.escalationRate.score} <span className="text-xs text-muted-foreground">({healthMetrics.escalationRate.raw})</span></span>
                </TooltipTrigger>
                <TooltipContent>Percentage of tickets that were escalated.</TooltipContent>
              </Tooltip>
            </li>
            <li className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-1"><TrendingUp className="h-4 w-4 text-purple-500" /> Ticket Volume Trend:</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="font-medium text-foreground">{healthMetrics.ticketVolumeTrend.score} <span className="text-xs text-muted-foreground">({healthMetrics.ticketVolumeTrend.raw})</span></span>
                </TooltipTrigger>
                <TooltipContent>Change in ticket volume (last 30 days vs. previous 30 days).</TooltipContent>
              </Tooltip>
            </li>
            <li className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-1"><Sparkles className="h-4 w-4 text-yellow-500" /> Ticket Cleanliness:</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="font-medium text-foreground">{healthMetrics.ticketCleanliness.score} <span className="text-xs text-muted-foreground">({healthMetrics.ticketCleanliness.raw})</span></span>
                </TooltipTrigger>
                <TooltipContent>Quality of ticket data (subject, description, categorization).</TooltipContent>
              </Tooltip>
            </li>
          </ul>
        </div>

        {/* Unimplemented components section */}
        <div className="mt-4 pt-4 border-t border-border">
          <h4 className="font-semibold text-muted-foreground text-sm mb-2">Additional Metrics (Requires more data):</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li><XCircle className="h-3 w-3 inline-block mr-1 text-red-500" /> Reopen Rate: {healthMetrics.unimplemented.reopenRate}</li>
            <li><XCircle className="h-3 w-3 inline-block mr-1 text-red-500" /> Engagement / Reply Time: {healthMetrics.unimplemented.engagementReplyTime}</li>
            <li><XCircle className="h-3 w-3 inline-block mr-1 text-red-500" /> Product Usage Coverage: {healthMetrics.unimplemented.productUsageCoverage}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerHealthScore;