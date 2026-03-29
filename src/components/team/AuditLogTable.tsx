"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AuditLog } from '@/types';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  History, User, Shield, Zap, 
  Settings, Mail, Loader2, Clock,
  Download, Filter
} from 'lucide-react';
import { formatDistanceToNowStrict, format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const AuditLogTable = ({ searchTerm }: { searchTerm: string }) => {
  const { data: logs = [], isLoading } = useQuery<AuditLog[]>({
    queryKey: ['orgAuditLogs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as AuditLog[];
    }
  });

  const filtered = logs.filter(l => 
    l.actor_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.target_email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionIcon = (action: string) => {
    if (action.includes('invited')) return <Mail className="h-3.5 w-3.5 text-indigo-600" />;
    if (action.includes('role')) return <Shield className="h-3.5 w-3.5 text-amber-600" />;
    if (action.includes('deactivated')) return <XCircle className="h-3.5 w-3.5 text-rose-600" />;
    if (action.includes('settings')) return <Settings className="h-3.5 w-3.5 text-blue-600" />;
    return <Zap className="h-3.5 w-3.5 text-gray-600" />;
  };

  if (isLoading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center bg-white dark:bg-gray-900 rounded-[32px] border border-dashed">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-2" />
        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Loading Audit Logs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="rounded-xl font-bold text-[10px] uppercase tracking-widest gap-2">
            <Filter className="h-3.5 w-3.5" /> Filter Logs
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl font-bold text-[10px] uppercase tracking-widest gap-2">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="rounded-[28px] border border-border bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-gray-800">
            <TableRow>
              <TableHead className="pl-8 font-black text-[10px] uppercase tracking-widest">When</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest">Who</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest">Action</TableHead>
              <TableHead className="pr-8 font-black text-[10px] uppercase tracking-widest">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground italic text-sm">
                  No audit logs found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((log) => (
                <TableRow key={log.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <TableCell className="pl-8 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-foreground">{formatDistanceToNowStrict(new Date(log.created_at), { addSuffix: true })}</span>
                      <span className="text-[9px] font-bold text-muted-foreground uppercase">{format(new Date(log.created_at), 'HH:mm:ss')}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-7 w-7 border border-border shadow-sm">
                        <AvatarFallback className="bg-gray-100 text-gray-600 text-[10px] font-black">
                          {log.actor_email.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-bold text-foreground">{log.actor_email}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-800">
                        {getActionIcon(log.action)}
                      </div>
                      <span className="text-xs font-black text-foreground capitalize">{log.action.replace('.', ' ')}</span>
                    </div>
                  </TableCell>

                  <TableCell className="pr-8">
                    <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                      {log.action === 'user.invited' && `Invited ${log.target_email} as ${log.new_value?.role}`}
                      {log.action === 'user.role_changed' && `Changed ${log.target_email}'s role from ${log.old_value?.role} to ${log.new_value?.role}`}
                      {log.action === 'user.deactivated' && `Deactivated ${log.target_email}`}
                      {log.action === 'user.invitation_revoked' && `Revoked invitation for ${log.target_email}`}
                      {!['user.invited', 'user.role_changed', 'user.deactivated', 'user.invitation_revoked'].includes(log.action) && log.action}
                    </p>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

import { XCircle } from 'lucide-react';
export default AuditLogTable;