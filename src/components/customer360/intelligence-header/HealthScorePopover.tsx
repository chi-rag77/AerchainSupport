"use client";

import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Info, TrendingUp, MessageSquare, ShieldAlert, Clock, CheckCircle2 } from 'lucide-react';
import { CustomerIntelligenceData } from '@/features/customer360/types';

interface HealthScorePopoverProps {
  data: CustomerIntelligenceData;
}

const HealthScorePopover = ({ data }: HealthScorePopoverProps) => {
  const components = [
    { label: "SLA Adherence", data: data.health_score_components.sla_adherence, icon: CheckCircle2 },
    { label: "Customer Sentiment", data: data.health_score_components.sentiment, icon: MessageSquare },
    { label: "Ticket Volume Trend", data: data.health_score_components.ticket_volume, icon: TrendingUp },
    { label: "Escalation Risk", data: data.health_score_components.escalation, icon: ShieldAlert },
    { label: "Unresolved Tickets", data: data.health_score_components.unresolved, icon: Clock },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="link" size="sm" className="h-auto p-0 text-xs text-muted-foreground gap-1">
          <Info className="h-3 w-3" /> How score is built
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 rounded-2xl shadow-2xl border-none p-6">
        <div className="space-y-4">
          <div>
            <h4 className="font-bold text-lg">Customer Health Score = {data.health_score} / 100</h4>
            <p className="text-xs text-muted-foreground">Calculated using the following weighted metrics:</p>
          </div>
          <div className="space-y-3">
            {components.map(item => (
              <div key={item.label}>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <item.icon className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-semibold">{item.label}</span>
                  </div>
                  <span className="text-xs font-bold">{item.data.score} / 100</span>
                </div>
                <Progress value={item.data.score} className="h-1.5" />
                <p className="text-[10px] text-muted-foreground text-right mt-0.5">Weight: {item.data.weight}%</p>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default HealthScorePopover;