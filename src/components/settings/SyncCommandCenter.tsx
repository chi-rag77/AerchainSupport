"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';
import { useSyncStatus } from '@/features/sync/hooks/useSyncStatus';
import { 
  RefreshCw, Database, ShieldCheck, AlertTriangle, 
  Clock, Zap, History, ArrowRight, Loader2, Info,
  CheckCircle2, XCircle, Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNowStrict } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const SyncCommandCenter = () => {
  const { history, stats, triggerSync, isTriggering } = useSyncStatus();

  if (!stats) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 1. Real-time Status Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-white dark:bg-gray-800 rounded-[24px] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Activity className="h-5 w-5" />
            </div>
            <Badge className={cn(
              "font-black uppercase tracking-widest text-[9px] border-none px-3 py-1",
              stats.healthStatus === 'Live' ? "bg-green-500 text-white" : 
              stats.healthStatus === 'Stale' ? "bg-amber-500 text-white" : "bg-rose-500 text-white"
            )}>
              {stats.healthStatus}
            </Badge>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sync Status</p>
            <p className="text-2xl font-black tracking-tighter">
              {stats.lastSyncAt ? formatDistanceToNowStrict(new Date(stats.lastSyncAt), { addSuffix: true }) : 'Never'}
            </p>
            <p className="text-xs font-medium text-muted-foreground">Last successful update</p>
          </div>
        </Card>

        <Card className="border-none shadow-sm bg-white dark:bg-gray-800 rounded-[24px] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Database className="h-5 w-5" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Data Volume</span>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Indexed Tickets</p>
            <p className="text-3xl font-black tracking-tighter">{stats.totalTickets}</p>
            <p className="text-xs font-medium text-muted-foreground">Total records in Support Brain</p>
          </div>
        </Card>

        <Card className="border-none shadow-sm bg-indigo-600 text-white rounded-[24px] p-6 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-100">Manual Override</span>
            </div>
            <h4 className="text-lg font-bold leading-tight">Force Refresh</h4>
            <p className="text-xs font-medium text-indigo-100 opacity-80">Manually trigger an incremental sync now.</p>
          </div>
          <Button 
            onClick={() => triggerSync()}
            disabled={stats.isSyncing || isTriggering}
            className="w-full mt-4 bg-white text-indigo-600 hover:bg-indigo-50 font-black uppercase tracking-widest text-[10px] h-10 rounded-xl shadow-lg"
          >
            {stats.isSyncing ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : <RefreshCw className="h-3.5 w-3.5 mr-2" />}
            Sync Now
          </Button>
        </Card>
      </div>

      {/* 2. Sync History Table */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-2">
          <History className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Recent Sync Activity</h3>
        </div>
        
        <div className="rounded-xl border border-border bg-white dark:bg-gray-900 overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-800">
              <TableRow>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Trigger</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Status</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Tickets</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Started</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-right">Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground italic text-sm">
                    No sync history found.
                  </TableCell>
                </TableRow>
              ) : (
                history.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell>
                      <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter">
                        {job.trigger}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {job.status === 'success' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                        {job.status === 'failed' && <XCircle className="h-4 w-4 text-rose-500" />}
                        {job.status === 'running' && <Loader2 className="h-4 w-4 text-indigo-500 animate-spin" />}
                        <span className={cn(
                          "text-xs font-bold capitalize",
                          job.status === 'success' ? "text-green-600" : job.status === 'failed' ? "text-rose-600" : "text-indigo-600"
                        )}>
                          {job.status}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-xs">
                      {job.tickets_synced}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDistanceToNowStrict(new Date(job.started_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-right text-[10px] font-bold text-muted-foreground">
                      {job.completed_at 
                        ? `${Math.round((new Date(job.completed_at).getTime() - new Date(job.started_at).getTime()) / 1000)}s`
                        : '--'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* 3. Configuration Note */}
      <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 flex items-start gap-3">
        <Info className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
        <p className="text-xs font-medium text-indigo-900 dark:text-indigo-200 leading-relaxed">
          <strong>Autonomous Sync:</strong> Aerchain automatically performs an incremental sync every 15 minutes. Real-time updates are pushed via webhooks for immediate visibility of new tickets and escalations.
        </p>
      </div>
    </div>
  );
};

export default SyncCommandCenter;