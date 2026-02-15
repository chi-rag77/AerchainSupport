"use client";

import React, { useEffect } from 'react';
import { useSupabase } from "@/components/SupabaseProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Settings, Loader2, AlertCircle, Users, KeyRound, Zap, Slack } from "lucide-react";
import HandWaveIcon from "@/components/HandWaveIcon";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrgData } from '@/hooks/use-org-user';
import FreshdeskSettings from '@/components/settings/FreshdeskSettings';
import UserManagement from '@/components/settings/UserManagement';
import AutomationRuleBuilder from '@/components/settings/AutomationRuleBuilder';
import SlackIntegration from '@/components/settings/SlackIntegration'; // New import
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const SettingsPage = () => {
  const { session } = useSupabase();
  const user = session?.user;
  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const { orgUser, isOrgLoading, orgError, orgId } = useOrgData();

  useEffect(() => {
    if (!isOrgLoading && orgId && user?.email && (!orgUser || orgUser.role === 'viewer')) {
      const setupInitialAdmin = async () => {
        try {
          const { count, error } = await supabase
            .from('org_users')
            .select('id', { count: 'exact', head: true });

          if (error && error.code !== 'PGRST116') throw error;

          if (count === 0) {
            const { error: insertError } = await supabase
              .from('org_users')
              .insert({
                org_id: orgId,
                email: user.email,
                role: 'admin',
                is_active: true,
              });

            if (insertError) {
              toast.error(`Failed to initialize admin user: ${insertError.message}`);
            } else {
              toast.success("Welcome! You have been set as the organization administrator.");
            }
          }
        } catch (err: any) {
          console.error("Initial admin setup failed:", err);
        }
      };
      setupInitialAdmin();
    }
  }, [isOrgLoading, orgId, orgUser, user?.email]);


  if (isOrgLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg font-medium">Loading organization data...</p>
      </div>
    );
  }

  if (orgError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950">
        <p className="text-red-500">Error loading settings: {orgError.message}</p>
      </div>
    );
  }

  const canViewSettings = orgUser && (orgUser.role === 'admin' || orgUser.role === 'manager');

  if (!canViewSettings) {
    return (
      <div className="flex-1 flex flex-col p-6 overflow-y-auto">
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground mt-2">You do not have the required permissions ({orgUser?.role}) to view this page. Only Admins and Managers can access Organization Settings.</p>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex-1 flex flex-col p-6 overflow-y-auto bg-background">
        <Card className="flex flex-col h-full p-0 overflow-hidden border-none shadow-xl">
          <div className="p-8 pb-6 bg-gradient-to-br from-blue-500/5 to-purple-500/5 border-b border-border shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="flex flex-col items-start">
                <p className="text-lg font-bold text-gray-700 dark:text-gray-300 flex items-center mb-2">
                  Hi {fullName} <HandWaveIcon className="ml-2 h-6 w-6 text-yellow-500" />
                </p>
                <div className="flex items-center space-x-4">
                  <Settings className="h-8 w-8 text-primary" />
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Organization Settings</h1>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Manage integrations, users, and organization preferences.
                </p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <Tabs defaultValue="freshdesk" className="w-full">
              <TabsList className="grid w-full grid-cols-4 max-w-3xl">
                <TabsTrigger value="freshdesk" className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4" /> Freshdesk
                </TabsTrigger>
                <TabsTrigger value="slack" className="flex items-center gap-2">
                  <Slack className="h-4 w-4" /> Slack
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center gap-2" disabled={!orgUser || orgUser.role !== 'admin'}>
                  <Users className="h-4 w-4" /> Users
                </TabsTrigger>
                <TabsTrigger value="automation" className="flex items-center gap-2" disabled={!orgUser || orgUser.role !== 'admin'}>
                  <Zap className="h-4 w-4" /> Automation
                </TabsTrigger>
              </TabsList>
              <TabsContent value="freshdesk" className="mt-6">
                <FreshdeskSettings />
              </TabsContent>
              <TabsContent value="slack" className="mt-6">
                <SlackIntegration />
              </TabsContent>
              <TabsContent value="users" className="mt-6">
                <UserManagement />
              </TabsContent>
              <TabsContent value="automation" className="mt-6">
                <AutomationRuleBuilder />
              </TabsContent>
            </Tabs>
          </div>
        </Card>
      </div>
    </TooltipProvider>
  );
};

export default SettingsPage;