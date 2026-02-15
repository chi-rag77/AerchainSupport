"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExecutiveAction } from '@/features/dashboard/types';
import { Zap, ArrowRight, ShieldAlert, Target, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const ExecutiveActionCenter = ({ actions }: { actions: ExecutiveAction[] }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-xl font-bold tracking-tight">Executive Action Center</h3>
        </div>
        <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 border-none font-bold">
          {actions.length} Recommendations
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {actions.map((action) => (
          <Card key={action.id} className="group relative overflow-hidden border-none bg-white dark:bg-gray-800 shadow-glass hover:shadow-glass-glow transition-all duration-500 rounded-[24px]">
            <div className={cn(
              "absolute left-0 top-0 h-full w-1.5",
              action.priority === 'high' ? "bg-red-500" : "bg-amber-500"
            )} />
            
            <CardContent className="p-8 flex items-center justify-between gap-6">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn(
                    "text-[10px] font-black uppercase tracking-widest",
                    action.priority === 'high' ? "text-red-600 border-red-200" : "text-amber-600 border-amber-200"
                  )}>
                    {action.priority} Priority
                  </Badge>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Impact: {action.impact}
                  </span>
                </div>

                <h4 className="text-lg font-bold leading-tight group-hover:text-indigo-600 transition-colors">
                  {action.title}
                </h4>

                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Addresses: {action.riskAddressed}
                </div>
              </div>

              <Button className="rounded-full h-12 w-12 p-0 bg-gray-50 dark:bg-gray-700 text-foreground hover:bg-indigo-600 hover:text-white transition-all duration-300 shadow-sm">
                <ArrowRight className="h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ExecutiveActionCenter;