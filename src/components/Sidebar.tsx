"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Users, BarChart, Shield, MessageSquare, Settings, LifeBuoy, PanelLeftOpen, PanelRightOpen, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSupabase } from '@/components/SupabaseProvider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils'; // Import cn for conditional class names

interface SidebarProps {
  showSidebar: boolean;
  toggleSidebar: () => void;
}

const Sidebar = ({ showSidebar, toggleSidebar }: SidebarProps) => {
  const { session } = useSupabase();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: Users, label: "Users", path: "/users" }, // Placeholder path
    { icon: BarChart, label: "Analytics", path: "/analytics" }, // Placeholder path
    { icon: Shield, label: "Security", path: "/security" }, // Placeholder path
    { icon: MessageSquare, label: "Support & Ticketing", path: "/" }, // Current active page
    { icon: Settings, label: "Settings", path: "/settings" }, // Placeholder path
  ];

  return (
    <div className={cn(
      "flex flex-col h-screen p-6 shadow-lg rounded-r-xl border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out",
      showSidebar ? "w-64 bg-white dark:bg-gray-800" : "w-20 bg-white dark:bg-gray-800 items-center"
    )}>
      <div className={cn("mb-10 flex items-center", showSidebar ? "space-x-2" : "justify-center")}>
        <div className="w-8 h-8 bg-gray-900 dark:bg-gray-100 rounded-md flex items-center justify-center text-white dark:text-gray-900 font-bold text-sm">
          SA
        </div>
        {showSidebar && <span className="text-xl font-bold text-gray-900 dark:text-white">Super Admin</span>}
      </div>

      <nav className="flex-grow space-y-2">
        {navItems.map((item, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <Button
                variant={item.label === "Support & Ticketing" ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start text-base h-10 px-4",
                  !showSidebar && "justify-center px-0"
                )}
                asChild
              >
                <Link to={item.path}>
                  <item.icon className={cn("h-5 w-5", showSidebar && "mr-3")} />
                  {showSidebar && item.label}
                </Link>
              </Button>
            </TooltipTrigger>
            {!showSidebar && <TooltipContent side="right">{item.label}</TooltipContent>}
          </Tooltip>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" className={cn(
              "w-full justify-start text-base h-10 px-4 text-gray-600 dark:text-gray-300",
              !showSidebar && "justify-center px-0"
            )}>
              <LifeBuoy className={cn("h-5 w-5", showSidebar && "mr-3")} />
              {showSidebar && "Help & Support"}
            </Button>
          </TooltipTrigger>
          {!showSidebar && <TooltipContent side="right">Help & Support</TooltipContent>}
        </Tooltip>

        {/* User Profile / Toggle Button Section */}
        <div className={cn("flex items-center", showSidebar ? "justify-between" : "justify-center flex-col space-y-2")}>
          {showSidebar && (
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" /> {/* Placeholder image */}
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900 dark:text-white">John Doe</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Admin</span>
              </div>
            </div>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className={cn(
                  "rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600",
                  showSidebar ? "h-10 w-10" : "h-8 w-8"
                )}
              >
                {showSidebar ? <PanelLeftOpen className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {showSidebar ? "Collapse sidebar" : "Expand sidebar"}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;