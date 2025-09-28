"use client";

import React, { useState } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import Sidebar from "@/components/Sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import Logo from "@/components/Logo";
import HandWaveIcon from "@/components/HandWaveIcon"; // Keep HandWaveIcon for potential future use or other greetings

const Index = () => {
  const { session } = useSupabase();
  const user = session?.user;
  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  const [showSidebar, setShowSidebar] = useState(true);

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <div className="h-screen flex bg-gray-100 dark:bg-gray-900">
      <Sidebar showSidebar={showSidebar} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col p-4 overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-4">
            <Logo className="h-8 w-auto" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">SupportIQ Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            {/* Global Search Bar removed as per request for empty dashboard */}
            <ThemeToggle />
          </div>
        </div>

        {/* Greeting removed from dashboard as it's more relevant to tickets page */}
        {/* Metrics Overview Section removed as per request */}
        {/* Ticket Table Section removed as per request */}

        <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400 text-xl">
          <p>Dashboard content coming soon!</p>
        </div>
      </div>
    </div>
  );
};

export default Index;