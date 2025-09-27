"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Users, BarChart, Shield, MessageSquare, Settings, LifeBuoy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSupabase } from '@/components/SupabaseProvider';
import { supabase } from '@/integrations/supabase/client';

const Sidebar = () => {
  const { session } = useSupabase();

  // No logout button in this sidebar design, so handleLogout is not needed here for now.

  return (
    <div className="flex flex-col h-screen w-64 bg-white dark:bg-gray-800 p-6 shadow-lg rounded-r-xl border-r border-gray-200 dark:border-gray-700">
      <div className="mb-10 flex items-center space-x-2">
        <div className="w-8 h-8 bg-gray-900 dark:bg-gray-100 rounded-md flex items-center justify-center text-white dark:text-gray-900 font-bold text-sm">
          SA
        </div>
        <span className="text-xl font-bold text-gray-900 dark:text-white">Super Admin</span>
      </div>

      <nav className="flex-grow space-y-2">
        <Button variant="ghost" className="w-full justify-start text-base h-10 px-4">
          <LayoutDashboard className="mr-3 h-5 w-5" />
          Dashboard
        </Button>
        <Button variant="ghost" className="w-full justify-start text-base h-10 px-4">
          <Users className="mr-3 h-5 w-5" />
          Users
        </Button>
        <Button variant="ghost" className="w-full justify-start text-base h-10 px-4">
          <BarChart className="mr-3 h-5 w-5" />
          Analytics
        </Button>
        <Button variant="ghost" className="w-full justify-start text-base h-10 px-4">
          <Shield className="mr-3 h-5 w-5" />
          Security
        </Button>
        <Button variant="secondary" className="w-full justify-start text-base h-10 px-4">
          <MessageSquare className="mr-3 h-5 w-5" />
          Support & Ticketing
        </Button>
        <Button variant="ghost" className="w-full justify-start text-base h-10 px-4">
          <Settings className="mr-3 h-5 w-5" />
          Settings
        </Button>
      </nav>

      <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button variant="ghost" className="w-full justify-start text-base h-10 px-4 text-gray-600 dark:text-gray-300">
          <LifeBuoy className="mr-3 h-5 w-5" />
          Help & Support
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;