"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Settings2, History as HistoryIcon, Pause, Play, 
  CheckCircle2, AlertCircle, RefreshCw,
  ExternalLink, ShieldCheck, Zap, Slack, KeyRound,
  LayoutGrid
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const IntegrationModules = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 px-2">
        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
          <LayoutGrid className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h3 className="text-xl font-black tracking-tight">Integration Modules</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Freshdesk Module */}
        <Card className="border-none shadow-glass rounded-[32px] bg-white dark:bg-gray-900 overflow-hidden group">
          <CardHeader className="p-8 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 shadow-sm">
                  <KeyRound className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-lg font-black tracking-tight">Freshdesk</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Connected</span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 hover:bg-gray-50">
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-8 pt-4 space-y-8">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-border/50">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Last Sync</p>
                <p className="text-sm font-black">2 sec ago</p>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-border/50">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">API Health</p>
                <p className="text-sm font-black text-green-600">Excellent</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" className="flex-1 rounded-xl font-bold text-[10px] uppercase tracking-widest h-11 gap-2">
                <Settings2 className="h-4 w-4" /> Configure
              </Button>
              <Button variant="outline" className="flex-1 rounded-xl font-bold text-[10px] uppercase tracking-widest h-11 gap-2">
                <HistoryIcon className="h-4 w-4" /> View Logs
              </Button>
              <Button variant="ghost" size="icon" className="rounded-xl h-11 w-11 text-rose-600 hover:bg-rose-50">
                <Pause className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Slack Module */}
        <Card className="border-none shadow-glass rounded-[32px] bg-white dark:bg-gray-900 overflow-hidden group">
          <CardHeader className="p-8 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-[#4A154B] text-white shadow-sm">
                  <Slack className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-lg font-black tracking-tight">Slack</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Partial Connection</span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 hover:bg-gray-50">
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-8 pt-4 space-y-8">
            <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 space-y-3">
              <div className="flex items-center gap-2 text-amber-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">AI Suggestion</span>
              </div>
              <p className="text-xs font-bold text-amber-900 dark:text-amber-200 leading-relaxed">
                Webhook delay detected. Recommend retrying webhook auth or rotating the integration token.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] uppercase tracking-widest h-11 gap-2">
                <RefreshCw className="h-4 w-4" /> Reconnect
              </Button>
              <Button variant="outline" className="flex-1 rounded-xl font-bold text-[10px] uppercase tracking-widest h-11 gap-2">
                <Settings2 className="h-4 w-4" /> Settings
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default IntegrationModules;