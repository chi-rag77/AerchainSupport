"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { 
  Brain, Zap, Settings, ShieldAlert, 
  Clock, CheckCircle2, X, UserPlus, 
  ArrowRight, MoreHorizontal, Target
} from 'lucide-react';
import { Action } from '@/features/actions/types';
import { formatDistanceToNowStrict, parseISO } from 'date-fns';

interface ActionCardProps {
  action: Action;
  onClick: () => void;
  onStatusChange: (status: any) => void;
  canManage: boolean;
}

const ActionCard = ({ action, onClick, onStatusChange, canManage }: ActionCardProps) => {
  const typeIcons = {
    ai: Brain,
    rule: Zap,
    system: Settings
  };
  const Icon = typeIcons[action.type];

  const priorityStyles = {
    critical: "border-rose-200 bg-rose-50/50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400",
    high: "border-amber-200 bg-amber-50/50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
    medium: "border-blue-200 bg-blue-50/50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
    low: "border-gray-200 bg-gray-50/50 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400",
  };

  const priorityDots = {
    critical: "bg-rose-500",
    high: "bg-amber-500",
    medium: "bg-blue-500",
    low: "bg-gray-400",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="relative group"
    >
      <Card 
        className={cn(
          "border-none shadow-sm hover:shadow-md transition-all duration-300 rounded-[20px] cursor-pointer overflow-hidden",
          action.status === 'resolved' ? "opacity-60 grayscale" : "bg-white dark:bg-gray-900"
        )}
        onClick={onClick}
      >
        {/* Priority Indicator Strip */}
        <div className={cn("absolute left-0 top-0 h-full w-1", priorityDots[action.priority])} />

        <CardContent className="p-5 space-y-4">
          <div className="flex justify-between items-start gap-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-xl shadow-sm",
                action.type === 'ai' ? "bg-indigo-50 text-indigo-600" : "bg-gray-50 text-gray-600"
              )}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-black tracking-tight leading-tight group-hover:text-indigo-600 transition-colors">
                  {action.title}
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                    {action.entity_type}: {action.entity_id || 'System'}
                  </span>
                  <span className="text-[9px] font-bold text-muted-foreground/40">•</span>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase">
                    {formatDistanceToNowStrict(parseISO(action.created_at))} ago
                  </span>
                </div>
              </div>
            </div>

            <Badge variant="outline" className={cn(
              "text-[8px] font-black uppercase tracking-widest border-none px-2 py-0.5 rounded-full",
              priorityStyles[action.priority]
            )}>
              {action.priority}
            </Badge>
          </div>

          <p className="text-xs font-medium text-muted-foreground line-clamp-2 leading-relaxed">
            {action.description}
          </p>

          {canManage && action.status === 'open' && (
            <div className="flex items-center gap-2 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest gap-1.5 hover:bg-indigo-50 text-indigo-600"
                onClick={(e) => { e.stopPropagation(); onStatusChange('in_progress'); }}
              >
                <UserPlus className="h-3 w-3" /> Assign
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest gap-1.5 hover:bg-green-50 text-green-600"
                onClick={(e) => { e.stopPropagation(); onStatusChange('resolved'); }}
              >
                <CheckCircle2 className="h-3 w-3" /> Resolve
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest gap-1.5 hover:bg-rose-50 text-rose-600 ml-auto"
                onClick={(e) => { e.stopPropagation(); onStatusChange('dismissed'); }}
              >
                <X className="h-3 w-3" /> Dismiss
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ActionCard;