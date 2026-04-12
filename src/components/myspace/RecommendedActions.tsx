"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Target, Info, Layers, ArrowUpRight, 
  MessageSquare, Zap, Clock, RefreshCw 
} from 'lucide-react';

interface Action {
  id: string;
  action: string;
  why: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  impactMinutes: number;
  done: boolean;
}

interface RecommendedActionsProps {
  actions: Action[];
  onToggle: (id: string) => void;
}

const RecommendedActions = ({ actions, onToggle }: RecommendedActionsProps) => {
  const getIcon = (idx: number) => {
    switch (idx) {
      case 0: return Info;
      case 1: return Layers;
      case 2: return ArrowUpRight;
      case 3: return MessageSquare;
      case 4: return Zap;
      default: return Info;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent': return "text-rose-600 bg-rose-50";
      case 'high': return "text-orange-600 bg-orange-50";
      case 'medium': return "text-blue-600 bg-blue-50";
      case 'low': return "text-emerald-600 bg-emerald-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <Card className="border border-border/50 bg-white dark:bg-gray-900 rounded-[16px] shadow-sm overflow-hidden">
      <CardHeader className="p-5 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-500 text-white shadow-sm">
              <Target className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-bold">Recommended Actions</CardTitle>
              <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-none font-bold text-[9px] uppercase tracking-widest px-2 py-0.5">
                AI-prioritized
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Updated 15m ago</span>
          </div>
        </div>
        <div className="px-1 mt-1">
          <p className="text-[11px] font-medium text-muted-foreground">0/5 completed • ~70min remaining</p>
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-4 space-y-1">
        {actions.map((action, idx) => {
          const Icon = getIcon(idx);
          return (
            <div 
              key={action.id}
              className="group flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all cursor-pointer"
            >
              <div className="h-5 w-5 rounded-full border-2 border-indigo-200 flex items-center justify-center shrink-0 group-hover:border-indigo-500 transition-colors" />
              
              <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 text-muted-foreground shrink-0">
                <Icon className="h-3.5 w-3.5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-foreground truncate">{action.action}</h4>
                  <Badge className={cn(
                    "text-[8px] font-black uppercase tracking-widest border-none px-1.5 py-0 rounded-sm",
                    getPriorityColor(action.priority)
                  )}>
                    {action.priority}
                  </Badge>
                </div>
                <p className="text-[11px] font-medium text-muted-foreground truncate">{action.why}</p>
              </div>

              <div className="text-[10px] font-bold text-muted-foreground whitespace-nowrap">
                ~{action.impactMinutes}m
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default RecommendedActions;