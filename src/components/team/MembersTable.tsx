"use client";

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { OrgUser, UserRole } from '@/types';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MoreHorizontal, Mail, Shield, User, 
  CheckCircle2, XCircle, Clock, Copy,
  Trash2, UserMinus, UserCheck
} from 'lucide-react';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNowStrict, format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { usePermissions } from '@/hooks/use-permissions';
import RoleChangePicker from './RoleChangePicker';
import DeactivateDialog from './DeactivateDialog';

const MembersTable = ({ searchTerm }: { searchTerm: string }) => {
  const queryClient = useQueryClient();
  const { isAdmin } = usePermissions();
  const [deactivatingUser, setDeactivatingUser] = useState<OrgUser | null>(null);

  const { data: members = [], isLoading } = useQuery<OrgUser[]>({
    queryKey: ['orgMembers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('org_users')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as OrgUser[];
    }
  });

  const filtered = members.filter(m => 
    m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.display_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    toast.success("Email copied to clipboard");
  };

  const handleReactivate = async (user: OrgUser) => {
    const { error } = await supabase
      .from('org_users')
      .update({ is_active: true, deactivated_at: null, deactivated_by: null })
      .eq('id', user.id);

    if (error) {
      toast.error(`Failed to reactivate: ${error.message}`);
    } else {
      toast.success(`${user.display_name || user.email} reactivated.`);
      queryClient.invalidateQueries({ queryKey: ['orgMembers'] });
    }
  };

  if (isLoading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center bg-white dark:bg-gray-900 rounded-[32px] border border-dashed">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-2" />
        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Loading Members...</p>
      </div>
    );
  }

  return (
    <div className="rounded-[28px] border border-border bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50 dark:bg-gray-800">
          <TableRow>
            <TableHead className="pl-8 font-black text-[10px] uppercase tracking-widest">User</TableHead>
            <TableHead className="font-black text-[10px] uppercase tracking-widest">Role</TableHead>
            <TableHead className="font-black text-[10px] uppercase tracking-widest">Status</TableHead>
            <TableHead className="font-black text-[10px] uppercase tracking-widest">Last Active</TableHead>
            <TableHead className="font-black text-[10px] uppercase tracking-widest">Joined</TableHead>
            <TableHead className="pr-8 text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((member) => (
            <TableRow key={member.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
              <TableCell className="pl-8 py-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10 border-2 border-white dark:border-gray-800 shadow-sm">
                    <AvatarImage src={member.avatar_url} />
                    <AvatarFallback className={cn(
                      "font-black text-xs",
                      member.role === 'admin' ? "bg-indigo-600 text-white" : 
                      member.role === 'manager' ? "bg-amber-500 text-white" : "bg-gray-200 text-gray-600"
                    )}>
                      {(member.display_name || member.email).substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-foreground">{member.display_name || 'Pending Setup'}</span>
                    <span className="text-xs font-medium text-muted-foreground">{member.email}</span>
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                <RoleChangePicker 
                  user={member} 
                  disabled={!isAdmin || member.id === (supabase.auth.getUser() as any).data?.user?.id} 
                />
              </TableCell>

              <TableCell>
                <Badge className={cn(
                  "font-black uppercase tracking-widest text-[9px] border-none px-3 py-1 rounded-full",
                  member.is_active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                )}>
                  {member.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>

              <TableCell className="text-xs font-bold text-muted-foreground">
                {member.last_active_at ? formatDistanceToNowStrict(new Date(member.last_active_at), { addSuffix: true }) : 'Never'}
              </TableCell>

              <TableCell className="text-xs font-bold text-muted-foreground">
                {format(new Date(member.created_at), 'MMM dd, yyyy')}
              </TableCell>

              <TableCell className="pr-8 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl w-48">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleCopyEmail(member.email)} className="gap-2 cursor-pointer">
                      <Copy className="h-4 w-4" /> Copy Email
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {isAdmin && member.id !== (supabase.auth.getUser() as any).data?.user?.id && (
                      <>
                        {member.is_active ? (
                          <DropdownMenuItem 
                            onClick={() => setDeactivatingUser(member)}
                            className="gap-2 cursor-pointer text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          >
                            <UserMinus className="h-4 w-4" /> Deactivate
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem 
                            onClick={() => handleReactivate(member)}
                            className="gap-2 cursor-pointer text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <UserCheck className="h-4 w-4" /> Reactivate
                          </DropdownMenuItem>
                        )}
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <DeactivateDialog 
        user={deactivatingUser} 
        onClose={() => setDeactivatingUser(null)} 
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['orgMembers'] })}
      />
    </div>
  );
};

import { Loader2 } from 'lucide-react';
export default MembersTable;