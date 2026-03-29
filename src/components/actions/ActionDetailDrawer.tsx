"use client";

import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, Zap, ShieldAlert, Target, 
  Clock, CheckCircle2, User, ArrowRight,
  Sparkles, ListChecks, History, ExternalLink
} from 'lucide-react';
import { Action } from '@/features/actions/types';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

interface ActionDetailDrawerProps {
  action: Action | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updates: Partial<Action>) => void;
  canManage: boolean;
}

const ActionDetailDrawer = ({ action, isOpen, onClose, onUpdate, canManage }: ActionDetailDrawerProps) => {
  if (!action) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0 border-none shadow-2xl">
        {/* Header */}
        <div className={cn(
          "p-8 pb-6 text-white",
          action.priority === 'critical' ? "bg-rose-600" : "bg-indigo-600"
        )}>
          <SheetHeader>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md">
                {action.type === 'ai' ? <Brain className="h-6 w-6" /> : <Zap className="h-6 w-6" />}
              </div>
              <Badge className="bg-white/20 text-white border-none font-black uppercase tracking-widest text-[10px]">
                {action.type} Action
              </Badge>
            </div>
            <SheetTitle className="text-3xl font-black tracking-tight text-white">
              {action.title}
            </SheetTitle>
            <SheetDescription className="text-white/80 font-medium text-base mt-2">
              {action.description}
            </SheetDescription>
          </SheetHeader>
        </div>

        <ScrollArea className="flex-1 p-8 space-y-10">
          {/* Scoring Matrix */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-border/50 space-y-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Impact Score</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black">{action.impact_score}</span>
                <span className="text-[10px] font-bold text-muted-foreground">/ 100</span>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-border/50 space-y-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Urgency Score</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black">{action.urgency_score}</span>
                <span className="text-[10px] font-bold text-muted-foreground">/ 100</span>
              </div>
            </div>
          </div>

          {/* AI Root Cause */}
          {action.type === 'ai' && (
            <div className="p-6 rounded-[24px] bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">AI Root Cause Analysis</span>
              </div>
              <p className="text-sm font-bold leading-relaxed text-indigo-900 dark:text-indigo-200">
                {action.metadata?.root_cause || "Pattern analysis suggests a regression in the latest API deployment affecting specific enterprise modules."}
              </p>
            </div>
          )}

          {/* Suggested Steps */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-indigo-600" /> Suggested Next Steps
            </h4>
            <div className="space-y-3">
              {action.suggested_actions.map((step, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-white dark:bg-gray-800 border border-border group hover:border-indigo-200 transition-all">
                  <div className="h-5 w-5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-[10px] font-black text-indigo-600 shrink-0">
                    {i + 1}
                  </div>
                  <span className="text-sm font-bold text-foreground/90">{step}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Timeline */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <History className="h-4 w-4 text-muted-foreground" /> Action Timeline
            </h4>
            <div className="space-y-4 pl-2">
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-indigo-600" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold">Action Detected</span>
                  <span className="text-[10px] text-muted-foreground">{format(parseISO(action.created_at), 'MMM dd, HH:mm')}</span>
                </div>
              </div>
              {action.status !== 'open' && (
                <div className="flex items-center gap-4">
                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold">Status changed to {action.status}</span>
                    <span className="text-[10px] text-muted-foreground">{format(parseISO(action.updated_at), 'MMM dd, HH:mm')}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="p-8 bg-gray-50 dark:bg-gray-900 border-t border-border">
          {canManage ? (
            <div className="flex gap-3">
              {action.status === 'open' && (
                <Button 
                  onClick={() => onUpdate({ status: 'in_progress' })}
                  className="flex-1 h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-500/20"
                >
                  Start Action
                </Button>
              )}
              {action.status !== 'resolved' && (
                <Button 
                  onClick={() => onUpdate({ status: 'resolved' })}
                  className="flex-1 h-12 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-500/20"
                >
                  Mark Resolved
                </Button>
              )}
              <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold">Close</Button>
            </div>
          ) : (
            <Button onClick={onClose} className="w-full h-12 rounded-2xl bg-gray-200 dark:bg-gray-800 font-bold">Close View</Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ActionDetailDrawer;