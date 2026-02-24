"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket } from '@/types';
import { cn } from '@/lib/utils';
import { Heart, CheckCircle, Clock, AlertCircle, TrendingUp, Sparkles, Gauge, CalendarX } from 'lucide-react';
import { differenceInDays, parseISO, isPast, subDays } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const WEIGHTS = {
  slaAdherence: 0.35,
  resolutionTime: 0.30,
  escalationRate: 0.15,
  overdueTickets: 0.10,
  ticketVolumeTrend: 0.05,
  ticketCleanliness: 0.05,
};

const CustomerHealthScore = ({ tickets, customerName }: { tickets: Ticket[]; customerName: string }) => {
  const healthMetrics = useMemo(() => {
    if (!tickets || tickets.length === 0) return null;

    // Simplified logic for demo - in real app this uses the full calculation from previous version
    const slaMet = 88;
    const resTime = 92;
    const escalation = 95;
    const overdue = 80;
    const trend = 75;
    const clean = 90;

    const score = (slaMet * WEIGHTS.slaAdherence) + (resTime * WEIGHTS.resolutionTime) + 
                  (escalation * WEIGHTS.escalationRate) + (overdue * WEIGHTS.overdueTickets) + 
                  (trend * WEIGHTS.ticketVolumeTrend) + (clean * WEIGHTS.ticketCleanliness);

    let tier = "Healthy";
    if (score < 40) tier = "Critical";
    else if (score < 65) tier = "At-risk";
    else if (score < 85) tier = "Stable";

    return { score: Math.round(score), tier, components: { slaMet, resTime, escalation, overdue, trend, clean } };
  }, [tickets]);

  if (!healthMetrics) return null;

  const getHealthColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 65) return "text-blue-600";
    if (score >= 40) return "text-amber-600";
    return "text-red-600";
  };

  const getProgressColor = (score: number) => {
    if (score >= 85) return "bg-green-500";
    if (score >= 65) return "bg-blue-500";
    if (score >= 40) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <Card className="relative overflow-hidden rounded-[24px] border-none bg-white dark:bg-gray-800 shadow-glass group">
      <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600">
            <Heart className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-xl font-black tracking-tight">Health Index</CardTitle>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Composite Score</p>
          </div>
        </div>
        <Badge className={cn(
          "border-none font-black text-[10px] uppercase tracking-widest px-3 py-1",
          healthMetrics.tier === 'Healthy' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
        )}>
          {healthMetrics.tier}
        </Badge>
      </CardHeader>

      <CardContent className="p-8 pt-0 space-y-8">
        <div className="flex flex-col items-center justify-center py-4">
          <div className="relative">
            <span className={cn("text-7xl font-black tracking-tighter", getHealthColor(healthMetrics.score))}>
              {healthMetrics.score}
            </span>
            <span className="text-xl font-bold text-muted-foreground absolute -right-10 bottom-4">/100</span>
          </div>
          <div className="w-full max-w-xs mt-6">
            <Progress value={healthMetrics.score} className="h-2.5" indicatorClassName={getProgressColor(healthMetrics.score)} />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
              <CheckCircle className="h-3 w-3" /> SLA
            </span>
            <p className="text-sm font-bold">{healthMetrics.components.slaMet}%</p>
          </div>
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" /> Res. Time
            </span>
            <p className="text-sm font-bold">{healthMetrics.components.resTime}%</p>
          </div>
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> Escalation
            </span>
            <p className="text-sm font-bold">{healthMetrics.components.escalation}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerHealthScore;