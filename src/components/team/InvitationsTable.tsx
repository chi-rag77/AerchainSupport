"use client";

import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Invitation } from '@/types';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Mail, RefreshCw, XCircle, Link as LinkIcon, 
  Loader2, Clock, User, Shield
} from 'lucide-react';
import { formatDistanceToNowStrict, isPast } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { usePermissions } from '@/hooks/use-permissions';

const InvitationsTable = ({ searchTerm }: { searchTerm: string }) => {
  const queryClient = useQueryClient();
  const { isAdmin } = usePermissions();

  const { data: invitations = [], isLoading } = useQuery<Invitation[]>({
    queryKey: ['orgInvitations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Invitation[];
    }
  });

  const filtered = invitations.filter(i => 
    i.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRevoke = async (id: string) => {
    const { error } = await supabase.functions.invoke('revoke-invitation', {
      body: { invitation_id: id }
    });

    if (error) {
      toast.error(`Failed to revoke: ${error.message}`);
    } else {
      toast.success("Invitation revoked.");
      queryClient.invalidateQueries({ queryKey: ['orgInvitations'] });
    }
  };

  const handleCopyLink = (token: string) => {
    const link = `${window.location.origin}/accept-invite?token=${token}`;
    navigator.clipboard.writeText(link);
    toast.success("Invite link copied to clipboard");
  };

  if (isLoading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center bg-white dark:bg-gray-900 rounded-[32px] border border-dashed">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-2" />
        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Loading Invitations...</p>
      </div>
    );
  }

  return (
    <div className="rounded-[28px] border border-border bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50 dark:bg-gray-800">
          <TableRow>
            <TableHead className="pl-8 font-black text-[10px] uppercase tracking-widest">Invited Email</TableHead>
            <TableHead className="font-black text-[10px] uppercase tracking-widest">Role</TableHead>
            <TableHead className="font-black text-[10px] uppercase tracking-widest">Status</TableHead>
            <TableHead className="font-black text-[10px] uppercase tracking-widest">Expires</TableHead>
            <TableHead className="pr-8 text-right font-black text-[10px] uppercase tracking-widest">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic text-sm">
                No invitations found.
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((invite) => {
              const expired = isPast(new Date(invite.expires_at)) && invite.status === 'pending';
              return (
                <TableRow key={invite.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <TableCell className="pl-8 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                        <Mail className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-bold text-foreground">{invite.email}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant="outline" className="font-black uppercase tracking-widest text-[9px] border-indigo-100 text-indigo-600">
                      {invite.role}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge className={cn(
                      "font-black uppercase tracking-widest text-[9px] border-none px-3 py-1 rounded-full",
                      invite.status === 'pending' ? "bg-amber-50 text-amber-700" : 
                      invite.status === 'accepted' ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                    )}>
                      {expired ? 'Expired' : invite.status}
                    </Badge>
                  </TableCell>

                  <TableCell className={cn(
                    "text-xs font-bold",
                    expired ? "text-rose-600" : "text-muted-foreground"
                  )}>
                    {invite.status === 'pending' ? (
                      expired ? `Expired ${formatDistanceToNowStrict(new Date(invite.expires_at))} ago` : `In ${formatDistanceToNowStrict(new Date(invite.expires_at))}`
                    ) : '--'}
                  </TableCell>

                  <TableCell className="pr-8 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {invite.status === 'pending' && !expired && (
                        <>
                          <Button 
                            variant="ghost" size="sm" 
                            onClick={() => handleCopyLink(invite.token)}
                            className="rounded-lg font-black text-[9px] uppercase tracking-widest h-8 px-3 gap-2"
                          >
                            <LinkIcon className="h-3 w-3" /> Copy Link
                          </Button>
                          {isAdmin && (
                            <Button 
                              variant="ghost" size="sm" 
                              onClick={() => handleRevoke(invite.id)}
                              className="rounded-lg font-black text-[9px] uppercase tracking-widest h-8 px-3 gap-2 text-rose-600 hover:bg-rose-50"
                            >
                              <XCircle className="h-3 w-3" /> Revoke
                            </Button>
                          )}
                        </>
                      )}
                      {expired && isAdmin && (
                        <Button 
                          variant="ghost" size="sm" 
                          className="rounded-lg font-black text-[9px] uppercase tracking-widest h-8 px-3 gap-2 text-indigo-600 hover:bg-indigo-50"
                        >
                          <RefreshCw className="h-3 w-3" /> Resend
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default InvitationsTable;