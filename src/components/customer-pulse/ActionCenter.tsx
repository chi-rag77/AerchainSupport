"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Zap, ArrowRight, UserPlus, ShieldAlert, ClipboardList, Sparkles, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ActionCenterProps {
  actions: {
    id: string;
    title: string;
    type: 'assign' | 'escalate' | 'task';
  }[];
}

const ActionCenter = ({ actions }: ActionCenterProps) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'assign': return UserPlus;
      case 'escalate': return ShieldAlert;
      default: return ClipboardList;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left: Recommendations List (8 cols) */}
      <div className="lg:col-span-8 space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Recommended Actions</h3>
          </div>
          <Badge variant="outline" className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-200/50 font-bold text-[9px] uppercase tracking-widest">
            <Sparkles className="h-2.5 w-2.5 mr-1" /> Decision Layer Active
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {actions.map((action, i) => {
            const Icon = getIcon(action.type);
            return (
              <Card key={action.id} className="group relative overflow-hidden border-none bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all rounded-[20px]">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={cn(
                      "p-2.5 rounded-xl shadow-sm transition-colors",
                      action.type === 'escalate' ? "bg-rose-50 text-rose-600" : "bg-indigo-50 text-indigo-600"
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Rec {i + 1}</span>
                      <h4 className="text-sm font-black tracking-tight text-foreground">{action.title}</h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" className="rounded-lg font-bold text-[9px] uppercase tracking-widest h-8 px-3">
                      Dismiss
                    </Button>
                    <Button size="sm" className={cn(
                      "rounded-lg font-black text-[9px] uppercase tracking-widest h-8 px-4 gap-2 shadow-md transition-all active:scale-95",
                      action.type === 'escalate' ? "bg-rose-600 hover:bg-rose-700" : "bg-indigo-600 hover:bg-indigo-700"
                    )}>
                      Execute <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Right: Impact Preview (4 cols) */}
      <div className="lg:col-span-4 space-y-4">
        <div className="flex items-center gap-3 px-2">
          <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
            <Target className="h-4 w-4 text-amber-600" />
          </div>
          <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Impact Preview</h3>
        </div>
        
        <Card className="border-none shadow-glass rounded-[24px] bg-white dark:bg-gray-800 p-6 h-[calc(100%-40px)] flex flex-col justify-center space-y-6">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Predicted Outcome</p>
            <p className="text-2xl font-black tracking-tighter text-indigo-600">+18% Efficiency</p>
          </div>
          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50">
            <p className="text-[11px] font-medium leading-relaxed text-indigo-900 dark:text-indigo-200">
              Executing these recommendations will likely clear <span className="font-bold">12 pending tickets</span> and stabilize the <span className="font-bold">Invoice module</span> trend.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ActionCenter;