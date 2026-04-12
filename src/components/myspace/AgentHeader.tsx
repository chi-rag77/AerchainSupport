"use client";

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Settings, HelpCircle, BarChart3, Clock, Zap } from 'lucide-react';
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
    <div className="relative overflow-hidden bg-gradient-to-r from-[#4F46E5] to-[#6366F1] text-white rounded-[24px] shadow-lg">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-300 rounded-full blur-3xl -ml-24 -mb-24" />
      </div>

      <div className="relative z-10 p-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <Avatar className="h-16 w-16 border-2 border-white/30 shadow-xl">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="bg-white/20 text-white font-black text-xl backdrop-blur-sm">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black tracking-tight">{name}</h1>
                <Badge className="bg-emerald-400 text-emerald-950 border-none font-black uppercase tracking-widest text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-950" />
                  Online
                </Badge>
              </div>
              <p className="text-sm font-medium text-indigo-100">
                {title} • {team}
              </p>
              <div className="flex items-center gap-4 text-[10px] font-bold text-indigo-200 uppercase tracking-widest pt-1">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  9:00 AM – 5:00 PM
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="h-3 w-3" />
                  12-day streak
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" className="text-white hover:bg-white/10 rounded-xl font-bold text-[10px] uppercase tracking-widest gap-2 h-10 px-4">
              <Settings className="h-4 w-4" />
              Preferences
            </Button>
            <Button variant="ghost" className="text-white hover:bg-white/10 rounded-xl font-bold text-[10px] uppercase tracking-widest gap-2 h-10 px-4">
              <HelpCircle className="h-4 w-4" />
              Request Help
            </Button>
            <Button variant="ghost" className="text-white hover:bg-white/10 rounded-xl font-bold text-[10px] uppercase tracking-widest gap-2 h-10 px-4">
              <BarChart3 className="h-4 w-4" />
              My Stats
            </Button>
          </div>
        </div>

        {/* Header Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-6 border-t border-white/10">
          <div className="space-y-1">
            <p className="text-2xl font-black tracking-tighter">8</p>
            <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest">Resolved Today</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-black tracking-tighter">2.3h</p>
            <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest">Avg Response</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-black tracking-tighter">94%</p>
            <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest">CSAT Score</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-black tracking-tighter">100%</p>
            <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest">SLA Rate</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentHeader;