"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Calendar, Book, BarChart, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSupabase } from '@/components/SupabaseProvider';
import { supabase } from '@/integrations/supabase/client';

const Sidebar = () => {
  const { session } = useSupabase();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="flex flex-col h-screen w-64 bg-white dark:bg-gray-800 p-6 shadow-lg rounded-r-xl">
      <div className="mb-10 flex items-center space-x-2">
        {/* Placeholder for logo */}
        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
          <LayoutDashboard size={18} className="text-gray-600 dark:text-gray-300" />
        </div>
        <span className="text-xl font-bold text-gray-900 dark:text-white">MATAVERSE</span>
      </div>

      <nav className="flex-grow space-y-2">
        <Button variant="ghost" className="w-full justify-start text-lg h-12">
          <LayoutDashboard className="mr-3 h-5 w-5" />
          Overview
        </Button>
        <Button variant="ghost" className="w-full justify-start text-lg h-12">
          <Calendar className="mr-3 h-5 w-5" />
          Schedule
        </Button>
        <Button variant="ghost" className="w-full justify-start text-lg h-12">
          <Book className="mr-3 h-5 w-5" />
          Courses
        </Button>
        <Button variant="ghost" className="w-full justify-start text-lg h-12">
          <BarChart className="mr-3 h-5 w-5" />
          Statistic
        </Button>
        <Button variant="ghost" className="w-full justify-start text-lg h-12">
          <Settings className="mr-3 h-5 w-5" />
          Settings
        </Button>
      </nav>

      <div className="mt-auto">
        {session && (
          <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-lg h-12 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300">
            <LogOut className="mr-3 h-5 w-5" />
            Log out
          </Button>
        )}
      </div>
    </div>
  );
};

export default Sidebar;