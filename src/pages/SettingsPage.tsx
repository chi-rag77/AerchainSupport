"use client";

import React, { useState } from 'react';
import { useSupabase } from "@/components/SupabaseProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { 
  Settings, Loader2, AlertCircle, Brain, 
  ShieldCheck, Zap, Activity, LayoutGrid,
  History, Users, MessageSquare, Sparkles
} from "lucide-react";
import { useOrgData } from '@/hooks/use-org-user';
import ControlHubHeader from '@/components/settings/ControlHubHeader';
import SystemHealthDashboard from '@/components/settings/SystemHealthDashboard';
import IntegrationModules from '@/components/settings/IntegrationModules';
import SyncControlCenter from '@/components/settings/SyncControlCenter';
import ActivityTimeline from '@/components/settings/ActivityTimeline';
import AIOpsAssistant from '@/components/settings/AIOpsAssistant';
import UserManagement from '@/components/settings/UserManagement';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

const SettingsPage = () => {
  const { session } = useSupabase();
  const { orgUser, isOrgLoading, orgError, orgId } = useOrgData();
  const [isUserPanelOpen, setIsUserPanelOpen] = useState(false);

  if (isOrgLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] dark:bg-gray-950">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
        <p className="text-lg font-black uppercase tracking-widest text-muted-foreground">Initializing Control Hub...</p>
      </div>
    );
  }

  if (orgError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-gray-950">
        <div className="p-8 bg-white dark:bg-gray-900 rounded-[32px] shadow-xl border border-rose-100 text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
          <p className="text-rose-600 font-bold">Error loading Control Hub: {orgError.message}</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex-1 flex flex-col bg-[#F8FAFC] dark:bg-gray-950 min-h-screen overflow-y-auto pb-20">
        
        {/* 1. Smart Header */}
        <ControlHubHeader 
          orgName="Aerchain Enterprise" 
          onOpenUsers={() => setIsUserPanelOpen(true)}
        />

        <div className="container mx-auto px-8 space-y-10 mt-8">
          
          {/* 2. System Health Dashboard (Hero) */}
          <SystemHealthDashboard />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left Column: Integrations & Controls (8 cols) */}
            <div className="lg:col-span-8 space-y-10">
              <IntegrationModules />
              <SyncControlCenter />
            </div>

            {/* Right Column: Activity & Audit (4 cols) */}
            <div className="lg:col-span-4 space-y-10">
              <ActivityTimeline />
            </div>
          </div>
        </div>

        {/* 3. AI Ops Assistant (Floating) */}
        <AIOpsAssistant />

        {/* 4. Users & Access (Slide-over) */}
        <Sheet open={isUserPanelOpen} onOpenChange={setIsUserPanelOpen}>
          <SheetContent side="right" className="sm:max-w-xl p-0 border-none shadow-2xl">
            <div className="h-full flex flex-col bg-white dark:bg-gray-950">
              <div className="p-8 bg-indigo-600 text-white">
                <SheetHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-100">Access Control</span>
                  </div>
                  <SheetTitle className="text-3xl font-black tracking-tight text-white">User Management</SheetTitle>
                  <SheetDescription className="text-indigo-100 font-medium">
                    Manage active users, roles, and API usage permissions.
                  </SheetDescription>
                </SheetHeader>
              </div>
              <div className="flex-1 overflow-y-auto p-8">
                <UserManagement />
              </div>
            </div>
          </SheetContent>
        </Sheet>

      </div>
    </TooltipProvider>
  );
};

export default SettingsPage;