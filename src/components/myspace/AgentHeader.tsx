"use client";

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Settings, HelpCircle, BarChart3, ChevronDown } from 'lucide-react';
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
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 bg-white dark:bg-gray-900 rounded-[24px] shadow-sm border border-border/50">
      <div className="flex items-center gap-5">
        <div className="relative">
          <Avatar className="h-16 w-16 border-4 border-white dark:border-gray-800 shadow-xl">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="bg-indigo-600 text-white font-black text-xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className={cn(
            "absolute bottom-0 right-0 h-5 w-5 rounded-full border-4 border-white dark:border-gray-800 shadow-sm",
            status === 'online' ? "bg-green-500" : status === 'away' ? "bg-amber-500" : "bg-gray-400"
          )} />
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-tight text-foreground">{name}</h1>
            <Badge variant="outline" className={cn(
              "font-black uppercase tracking-widest text-[9px] border-none px-3 py-1 rounded-full",
              status === 'online' ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
            )}>
              {status === 'online' ? 'Online Now' : 'Away'}
            </Badge>
          </div>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
            {title} • <span className="text-indigo-600">{team}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" className="rounded-xl font-bold text-[10px] uppercase tracking-widest gap-2 h-10 px-4">
          <Settings className="h-4 w-4 text-muted-foreground" />
          Preferences
        </Button>
        <Button variant="outline" size="sm" className="rounded-xl font-bold text-[10px] uppercase tracking-widest gap-2 h-10 px-4">
          <HelpCircle className="h-4 w-4 text-muted-foreground" />
          Request Help
        </Button>
        <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-widest gap-2 h-10 px-6 shadow-lg shadow-indigo-500/20">
          <BarChart3 className="h-4 w-4" />
          My Stats
        </Button>
      </div>
    </div>
  );
};

export default AgentHeader;