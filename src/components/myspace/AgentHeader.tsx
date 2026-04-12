"use client";

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Settings, HelpCircle, BarChart3, Clock, Zap, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface AgentHeaderProps {
  name: string;
  title: string;
  team: string;
  status: 'online' | 'away' | 'offline';
  avatarUrl?: string;
  stats?: {
    todayTickets: number;
    handledToday: number;
    avgResTime: string;
  };
  backlogCount?: number;
}

const AgentHeader = ({ name, title, team, status, avatarUrl, stats, backlogCount }: AgentHeaderProps) => {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#4F46E5] via-[#6366F1] to-[#4338CA] text-white rounded-[24px] shadow-xl border border-white/10">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full blur-[100px]" 
        />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>

      <div className="relative z-10 p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Profile Section */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-14 w-14 border-2 border-white/30 shadow-2xl">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="bg-white/10 text-white font-black text-lg backdrop-blur-md">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-emerald-500 rounded-full border-2 border-[#4F46E5] shadow-sm" />
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight">{name}</h1>
                <Badge className="bg-emerald-400/20 text-emerald-300 border-emerald-400/30 font-black uppercase tracking-widest text-[8px] px-2 py-0 rounded-full">
                  Online
                </Badge>
              </div>
              <p className="text-xs font-bold text-indigo-100/80 uppercase tracking-wider">
                {title} • {team}
              </p>
              <div className="flex items-center gap-3 text-[9px] font-black text-indigo-200 uppercase tracking-[0.15em] pt-1">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 09:00 – 17:00</span>
                <span className="h-1 w-1 rounded-full bg-indigo-300/50" />
                <span className="flex items-center gap-1 text-amber-300"><Zap className="h-3 w-3 fill-amber-300" /> 12-day streak</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-9 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 font-black text-[9px] uppercase tracking-widest gap-2 transition-all">
              <Settings className="h-3.5 w-3.5" /> Preferences
            </Button>
            <Button variant="ghost" size="sm" className="h-9 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 font-black text-[9px] uppercase tracking-widest gap-2 transition-all">
              <HelpCircle className="h-3.5 w-3.5" /> Support
            </Button>
            <Button variant="ghost" size="sm" className="h-9 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-black text-[9px] uppercase tracking-widest gap-2 transition-all shadow-lg">
              <BarChart3 className="h-3.5 w-3.5" /> Analytics
            </Button>
          </div>
        </div>

        {/* Compact Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-5 border-t border-white/10">
          <div className="bg-white/5 rounded-2xl p-3 border border-white/5 hover:bg-white/10 transition-colors">
            <p className="text-[8px] font-black text-indigo-200 uppercase tracking-[0.2em] mb-1">Today's Tickets</p>
            <p className="text-2xl font-black tracking-tighter">{stats?.todayTickets || 0}</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 border border-white/5 hover:bg-white/10 transition-colors">
            <p className="text-[8px] font-black text-indigo-200 uppercase tracking-[0.2em] mb-1">Resolved Today</p>
            <p className="text-2xl font-black tracking-tighter">{stats?.handledToday || 0}</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 border border-white/5 hover:bg-white/10 transition-colors">
            <p className="text-[8px] font-black text-indigo-200 uppercase tracking-[0.2em] mb-1">Total Backlog</p>
            <p className="text-2xl font-black tracking-tighter">{backlogCount || 0}</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 border border-white/5 hover:bg-white/10 transition-colors">
            <p className="text-[8px] font-black text-indigo-200 uppercase tracking-[0.2em] mb-1">Avg Resolution</p>
            <p className="text-2xl font-black tracking-tighter">{stats?.avgResTime || '0h'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentHeader;