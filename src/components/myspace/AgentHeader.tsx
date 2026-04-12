"use client";

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Settings, HelpCircle, BarChart3, ChevronDown, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgentHeaderProps {
  name: string;
  title: string;
  team: string;
  status: 'online' | 'away' | 'offline';
  avatarUrl?: string;
}

const AgentHeader = ({ name, title, team, status, avatarUrl }: AgentHeaderProps) => {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-white dark:bg-gray-900 rounded-[20px] shadow-sm border border-border/50">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="h-14 w-14 border-2 border-white dark:border-gray-800 shadow-md">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="bg-indigo-600 text-white font-black text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className={cn(
            "absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white dark:border-gray-800 shadow-sm",
            status === 'online' ? "bg-green-500" : status === 'away' ? "bg-amber-500" : "bg-gray-400"
          )} />
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black tracking-tight text-foreground">{name}</h1>
            <Badge variant="outline" className={cn(
              "font-black uppercase tracking-widest text-[8px] border-none px-2 py-0.5 rounded-full",
              status === 'online' ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
            )}>
              {status === 'online' ? 'Online' : 'Away'}
            </Badge>
          </div>
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
            {title} <span className="mx-1 opacity-30">•</span> <span className="text-indigo-600">{team}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="rounded-xl font-bold text-[9px] uppercase tracking-widest gap-2 h-9 px-3 hover:bg-gray-50">
          <Settings className="h-3.5 w-3.5 text-muted-foreground" />
          Preferences
        </Button>
        <Button variant="ghost" size="sm" className="rounded-xl font-bold text-[9px] uppercase tracking-widest gap-2 h-9 px-3 hover:bg-gray-50">
          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
          Help
        </Button>
        <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[9px] uppercase tracking-widest gap-2 h-9 px-5 shadow-lg shadow-indigo-500/20 transition-all active:scale-95">
          <Activity className="h-3.5 w-3.5" />
          My Stats
        </Button>
      </div>
    </div>
  );
};

export default AgentHeader;