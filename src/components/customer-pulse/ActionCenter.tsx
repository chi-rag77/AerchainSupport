"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, ArrowRight, UserPlus, ShieldAlert, ClipboardList, Sparkles } from 'lucide-react';
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
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-xl font-black tracking-tight">What should we do?</h3>
        </div>
        <Badge variant="outline" className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-200/50 font-bold text-[10px] uppercase tracking-widest">
          <Sparkles className="h-3 w-3 mr-1.5" /> Decision Layer Active
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {actions.map((action, i) => {
          const Icon = getIcon(action.type);
          return (
            <Card key={action.id} className="group relative overflow-hidden border-none bg-white dark:bg-gray-800 shadow-glass hover:shadow-md transition-all rounded-[24px]">
              <CardContent className="p-6 flex items-center justify-between gap-6">
                <div className="flex items-center gap-5 flex-1">
                  <div className={cn(
                    "p-3 rounded-2xl shadow-sm transition-colors",
                    action.type === 'escalate' ? "bg-rose-50 text-rose-600" : "bg-indigo-50 text-indigo-600"
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Recommendation {i + 1}</span>
                    <h4 className="text-base font-black tracking-tight text-foreground">{action.title}</h4>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button variant="ghost" className="rounded-xl font-bold text-[10px] uppercase tracking-widest h-10 px-4">
                    Dismiss
                  </Button>
                  <Button className={cn(
                    "rounded-xl font-black text-[10px] uppercase tracking-widest h-10 px-6 gap-2 shadow-lg transition-all active:scale-95",
                    action.type === 'escalate' ? "bg-rose-600 hover:bg-rose-700 shadow-rose-500/20" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20"
                  )}>
                    {action.type === 'assign' ? 'Assign Now' : action.type === 'escalate' ? 'Escalate' : 'Create Task'}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ActionCenter;