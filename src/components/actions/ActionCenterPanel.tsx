"use client";

import React, { useState, useMemo } from 'react';
import { useActions } from '@/features/actions/hooks/useActions';
import ActionCard from './ActionCard';
import ActionDetailDrawer from './ActionDetailDrawer';
import { 
  Zap, Filter, ArrowUpDown, Loader2, 
  Inbox, Sparkles, ShieldAlert, Brain,
  ChevronRight, ListFilter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePermissions } from '@/hooks/use-permissions';
import { Action, ActionStatus } from '@/features/actions/types';
import { cn } from '@/lib/utils';

const ActionCenterPanel = () => {
  const { actions, isLoading, updateAction } = useActions();
  const { isAdmin, isManager } = usePermissions();
  const canManage = isAdmin || isManager;

  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [statusFilter, setStatusFilter] = useState<ActionStatus>('open');

  const filteredActions = useMemo(() => {
    return actions.filter(a => a.status === statusFilter);
  }, [actions, statusFilter]);

  const counts = useMemo(() => ({
    open: actions.filter(a => a.status === 'open').length,
    in_progress: actions.filter(a => a.status === 'in_progress').length,
    resolved: actions.filter(a => a.status === 'resolved').length,
  }), [actions]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-l border-border shadow-2xl animate-in slide-in-from-right duration-500">
      {/* Header */}
      <div className="p-6 border-b border-border space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-xl font-black tracking-tight">Action Center</h3>
          </div>
          <Badge variant="outline" className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-200/50 font-bold text-[10px] uppercase tracking-widest">
            <Sparkles className="h-3 w-3 mr-1.5" /> Intelligence Active
          </Badge>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center p-1 bg-gray-100 dark:bg-gray-800 rounded-xl border border-border">
          {(['open', 'in_progress', 'resolved'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 h-9 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                statusFilter === status 
                  ? "bg-white dark:bg-gray-700 text-indigo-600 shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {status.replace('_', ' ')}
              {counts[status] > 0 && (
                <span className={cn(
                  "h-4 px-1.5 rounded-full flex items-center justify-center text-[8px]",
                  statusFilter === status ? "bg-indigo-600 text-white" : "bg-gray-200 dark:bg-gray-900"
                )}>
                  {counts[status]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Action List */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              <p className="text-[10px] font-black uppercase tracking-widest">Prioritizing Tasks...</p>
            </div>
          ) : filteredActions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-40">
              <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800">
                <Inbox className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold">All clear!</p>
                <p className="text-xs font-medium">No {statusFilter.replace('_', ' ')} actions found.</p>
              </div>
            </div>
          ) : (
            filteredActions.map((action) => (
              <ActionCard 
                key={action.id} 
                action={action} 
                canManage={canManage}
                onClick={() => setSelectedAction(action)}
                onStatusChange={(status) => updateAction({ id: action.id, updates: { status } })}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer Summary */}
      <div className="p-6 border-t border-border bg-gray-50/50 dark:bg-gray-900/50">
        <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-border shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-indigo-600">
            <Brain className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Operational Health</span>
          </div>
          <p className="text-xs font-bold text-foreground/80 leading-relaxed">
            {counts.open > 5 
              ? "High volume of open actions. Recommend prioritizing critical escalations." 
              : "Operational load is balanced. Focus on resolving pending tasks."}
          </p>
        </div>
      </div>

      <ActionDetailDrawer 
        action={selectedAction}
        isOpen={!!selectedAction}
        onClose={() => setSelectedAction(null)}
        canManage={canManage}
        onUpdate={(updates) => {
          if (selectedAction) {
            updateAction({ id: selectedAction.id, updates });
            setSelectedAction({ ...selectedAction, ...updates });
          }
        }}
      />
    </div>
  );
};

export default ActionCenterPanel;