"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';
import { 
  Mail, Sparkles, FileText, Send, 
  Download, Edit3, CheckCircle2, AlertTriangle,
  TrendingUp, TrendingDown, Zap, Clock, ShieldAlert
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { invokeEdgeFunction } from '@/lib/apiClient';
import { CustomerDigest } from '@/features/customer-pulse/types';
import { motion } from 'framer-motion';
import { Textarea } from '@/components/ui/textarea';

interface WeeklyDigestSectionProps {
  customerName: string;
}

const WeeklyDigestSection = ({ customerName }: WeeklyDigestSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSummary, setEditedSummary] = useState("");

  const { data: digest, isLoading, refetch } = useQuery<CustomerDigest, Error>({
    queryKey: ['customerDigest', customerName],
    queryFn: () => invokeEdgeFunction('generate-customer-digest', {
      method: 'POST',
      body: { customerName },
    }),
    enabled: !!customerName,
  });

  if (isLoading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center bg-white dark:bg-gray-900 rounded-[32px] border border-dashed border-indigo-200">
        <Sparkles className="h-8 w-8 text-indigo-600 animate-pulse mb-4" />
        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Synthesizing Weekly Digest...</p>
      </div>
    );
  }

  if (!digest) return null;

  const metrics = digest.metrics;
  const isVolumeUp = metrics.volume.wow > 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
            <Mail className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight">Weekly Customer Digest</h3>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{digest.weekLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl font-bold text-xs gap-2 h-10">
            <Download className="h-4 w-4" /> PDF
          </Button>
          <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-2 h-10 shadow-lg shadow-indigo-500/20">
            <Send className="h-4 w-4" /> Send to Customer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: AI Summary & Metrics (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-none shadow-glass rounded-[28px] bg-white dark:bg-gray-900 overflow-hidden">
            <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">AI-Generated Summary</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  if (!isEditing) setEditedSummary(digest.aiSummary);
                  setIsEditing(!isEditing);
                }}
                className="h-8 rounded-lg font-bold text-[10px] uppercase tracking-widest gap-2"
              >
                {isEditing ? "Cancel" : <><Edit3 className="h-3 w-3" /> Edit Summary</>}
              </Button>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              {isEditing ? (
                <div className="space-y-4">
                  <Textarea 
                    value={editedSummary}
                    onChange={(e) => setEditedSummary(e.target.value)}
                    className="min-h-[120px] rounded-2xl border-indigo-100 bg-indigo-50/30 font-medium text-sm leading-relaxed"
                  />
                  <Button size="sm" className="rounded-xl bg-indigo-600 font-bold" onClick={() => setIsEditing(false)}>Save Changes</Button>
                </div>
              ) : (
                <p className="text-lg font-medium leading-relaxed text-foreground/90 italic">
                  "{digest.aiSummary}"
                </p>
              )}

              <Separator className="opacity-50" />

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Total Tickets</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black">{metrics.volume.total}</span>
                    <span className={cn("text-[10px] font-bold", isVolumeUp ? "text-rose-600" : "text-green-600")}>
                      {isVolumeUp ? '↑' : '↓'}{Math.abs(metrics.volume.wow)}%
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Resolution Rate</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black">{Math.round((metrics.status.closed / metrics.volume.total) * 100)}%</span>
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">SLA Adherence</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black">{metrics.sla.adherence}%</span>
                    <ShieldAlert className={cn("h-3 w-3", metrics.sla.adherence > 85 ? "text-green-500" : "text-amber-500")} />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Active Backlog</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black">{metrics.status.backlog}</span>
                    <Clock className="h-3 w-3 text-amber-500" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Classification Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm rounded-[24px] bg-white dark:bg-gray-900 p-6 space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ticket Classification</h4>
              <div className="space-y-3">
                {[
                  { label: 'Bugs', count: metrics.classification.bugs, color: 'bg-rose-500' },
                  { label: 'Queries', count: metrics.classification.queries, color: 'bg-indigo-500' },
                  { label: 'Tasks', count: metrics.classification.tasks, color: 'bg-amber-500' },
                  { label: 'Features', count: metrics.classification.features, color: 'bg-emerald-500' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn("h-2 w-2 rounded-full", item.color)} />
                      <span className="text-xs font-bold text-foreground/80">{item.label}</span>
                    </div>
                    <span className="text-xs font-black">{item.count}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="border-none shadow-sm rounded-[24px] bg-white dark:bg-gray-900 p-6 space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Critical Alerts</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/50">
                  <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
                    <ShieldAlert className="h-4 w-4" />
                    <span className="text-xs font-bold">Urgent Priority</span>
                  </div>
                  <span className="text-sm font-black text-rose-700 dark:text-rose-400">{metrics.critical.urgent}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-xs font-bold">Escalated Tickets</span>
                  </div>
                  <span className="text-sm font-black text-amber-700 dark:text-amber-400">{metrics.critical.escalated}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Right: Settings & Recipients (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-glass rounded-[28px] bg-white dark:bg-gray-900 p-8 space-y-8">
            <div className="space-y-1">
              <h4 className="text-lg font-black tracking-tight">Digest Settings</h4>
              <p className="text-xs font-medium text-muted-foreground">Manage delivery and recipients.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Recipients</label>
                <div className="space-y-2">
                  {['ops-lead@customer.com', 'csm@aerchain.io'].map(email => (
                    <div key={email} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-border/50">
                      <span className="text-xs font-bold truncate max-w-[180px]">{email}</span>
                      <Badge variant="outline" className="text-[8px] font-black uppercase border-none bg-white dark:bg-gray-700">Active</Badge>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" size="sm" className="w-full rounded-xl font-bold text-[10px] uppercase tracking-widest mt-2 border border-dashed">
                  + Add Recipient
                </Button>
              </div>

              <Separator className="opacity-50" />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">Auto-Send Weekly</span>
                  <Badge className="bg-green-500">Enabled</Badge>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Digests are automatically generated every Monday at 9:00 AM and sent to the active recipient list.
                </p>
              </div>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default WeeklyDigestSection;