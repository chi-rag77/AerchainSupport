"use client";

import React from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LayoutDashboard } from "lucide-react";
import HandWaveIcon from "@/components/HandWaveIcon";

const DashboardV2 = () => {
  const { session } = useSupabase();
  const user = session?.user;
  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <TooltipProvider>
      <div className="flex-1 flex flex-col p-6 overflow-y-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg flex flex-col h-full">
          {/* Title Bar */}
          <div className="p-8 pb-6 border-b border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="flex flex-col items-start">
                <p className="text-lg font-bold text-gray-700 dark:text-gray-300 flex items-center mb-2">
                  Hi {fullName} <HandWaveIcon className="ml-2 h-6 w-6 text-yellow-500" />
                </p>
                <div className="flex items-center space-x-4">
                  <LayoutDashboard className="h-8 w-8 text-primary" />
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Revamped Dashboard</h1>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  This is your new dashboard, ready for a fresh design!
                </p>
              </div>
            </div>
          </div>

          {/* Empty content area for your new design */}
          <div className="flex-grow p-8 text-center text-muted-foreground flex items-center justify-center">
            <p className="text-xl mb-4">Your new dashboard starts here!</p>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default DashboardV2;