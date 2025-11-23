"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActionItem } from "@/types";
import { Phone, Mail, MessageSquare, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionDrawerProps {
  actions: ActionItem[];
}

const ActionDrawer = ({ actions }: ActionDrawerProps) => {
  return (
    <Card className="bg-midnight-glass backdrop-blur-xl border border-white/10 shadow-glass text-white h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
          <PlusCircle className="h-5 w-5 text-electric-purple" /> Agent Action Center
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map(action => {
          const IconComponent = action.icon;
          return (
            <Button
              key={action.id}
              onClick={action.onClick}
              variant={action.variant || "default"}
              className={cn(
                "w-full justify-start text-left py-3 px-4 text-base font-semibold",
                action.variant === "outline" && "bg-white/10 text-white border-white/20 hover:bg-white/20",
                action.variant === "ghost" && "hover:bg-white/10 text-white",
                action.variant === "default" && "bg-neon-blue text-black hover:bg-neon-blue/80"
              )}
            >
              <IconComponent className="h-5 w-5 mr-3" />
              {action.label}
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default ActionDrawer;