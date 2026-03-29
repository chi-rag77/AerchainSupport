"use client";

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Mail, History, UserPlus, Search, Filter, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { usePermissions } from '@/hooks/use-permissions';
import MembersTable from '@/components/team/MembersTable';
import InvitationsTable from '@/components/team/InvitationsTable';
import AuditLogTable from '@/components/team/AuditLogTable';
import InviteMemberModal from '@/components/team/InviteMemberModal';
import AccessDeniedBanner from '@/components/AccessDeniedBanner';
import RoleGate from '@/components/RoleGate';

const TeamPage = () => {
  const { isAdmin, canViewAuditLog } = usePermissions();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="flex-1 flex flex-col p-8 space-y-10 bg-[#F6F8FB] dark:bg-gray-950 min-h-screen overflow-y-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-foreground">Team Management</h1>
          </div>
          <p className="text-sm font-medium text-muted-foreground">Manage members, invitations, and access control.</p>
        </div>

        <RoleGate allow={['admin']}>
          <Button 
            onClick={() => setIsInviteModalOpen(true)}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-widest h-12 px-8 gap-3 shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <UserPlus className="h-4 w-4" />
            Invite Member
          </Button>
        </RoleGate>
      </div>

      <Tabs defaultValue="members" className="w-full space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <TabsList className="bg-gray-200/50 dark:bg-gray-800/50 p-1 rounded-full border border-white/20 w-fit">
            <TabsTrigger value="members" className="rounded-full px-6 py-2 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <Users className="h-3.5 w-3.5 mr-2" /> Members
            </TabsTrigger>
            <TabsTrigger value="invitations" className="rounded-full px-6 py-2 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <Mail className="h-3.5 w-3.5 mr-2" /> Invitations
            </TabsTrigger>
            {canViewAuditLog && (
              <TabsTrigger value="audit" className="rounded-full px-6 py-2 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                <History className="h-3.5 w-3.5 mr-2" /> Audit Log
              </TabsTrigger>
            )}
          </TabsList>

          <div className="relative group w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-indigo-600 transition-colors" />
            <Input 
              placeholder="Search team..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-11 bg-white dark:bg-gray-900 border-none rounded-2xl shadow-sm focus-visible:ring-2 focus-visible:ring-indigo-500/50 font-medium"
            />
          </div>
        </div>

        <TabsContent value="members" className="mt-0">
          <MembersTable searchTerm={searchTerm} />
        </TabsContent>

        <TabsContent value="invitations" className="mt-0">
          <InvitationsTable searchTerm={searchTerm} />
        </TabsContent>

        {canViewAuditLog && (
          <TabsContent value="audit" className="mt-0">
            <AuditLogTable searchTerm={searchTerm} />
          </TabsContent>
        )}
      </Tabs>

      <InviteMemberModal 
        isOpen={isInviteModalOpen} 
        onClose={() => setIsInviteModalOpen(false)} 
      />
    </div>
  );
};

export default TeamPage;