"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { RecommendedAction } from '@/features/customer360/types';

interface ActionSectionProps {
  actions: RecommendedAction[];
}

const ActionSection = ({ actions }: ActionSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <Zap className="h-4 w-4 text-amber-500" />
        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Recommended Actions</h4>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {actions.map((action) => (
          <Card key={action.id} className="border-none shadow-sm rounded-2xl bg-white dark:bg-gray-800 group hover:shadow-md transition-all overflow-hidden">
            <CardContent className="p-0 flex items-stretch">
              <div className="w-1.5 bg-indigo-500" />
              <div className="p-5 flex-1 flex items-center justify-between gap-6">
                <div className="space-y-1">
                  <h5 className="text-sm font-black text-foreground">{action.title}</h5>
                  <p className="text-xs font-medium text-muted-foreground leading-relaxed">{action.description}</p>
                </div>
                <Button size="icon" variant="ghost" className="rounded-full h-10 w-10 bg-gray-50 dark:bg-gray-900 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ActionSection;