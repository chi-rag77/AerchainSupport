"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Users, BarChart, Shield, MessageSquare, Settings, LifeBuoy, PanelLeftOpen, PanelRightOpen, LogOut } from 'lucide-react'; // Added LogOut icon
import { Button } from '@/components/ui/button';
import { useSupabase } from '@/components/SupabaseProvider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Imported DropdownMenu components
import { cn } from '@/lib/utils';
import Logo from '@/components/Logo';
import { supabase } from '@/integrations/supabase/client'; // Import supabase client for logout

interface SidebarProps {
  showSidebar: boolean;
  toggleSidebar: () => void;
}

const Sidebar = ({ showSidebar, toggleSidebar }: SidebarProps) => {
  const { session } = useSupabase();
  const user = session?.user;
  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const userRole = user?.user_metadata?.role || 'Admin'; // Default role if not set

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" }, // Points to the new Dashboard
    { icon: Users, label: "Users", path: "/users" }, // Placeholder path
    { icon: BarChart, label: "Analytics", path: "/analytics" }, // Placeholder path
    { icon: Shield, label: "Security", path: "/security" }, // Placeholder path
    { icon: MessageSquare, label: "Support & Ticketing", path: "/tickets" }, // Points to the TicketsPage
    { icon: Settings, label: "Settings", path: "/settings" }, // Placeholder path
  ];

  return (
    <div className={cn(
      "flex flex-col h-screen p-6 shadow-lg rounded-r-xl border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out",
      showSidebar ? "w-64 bg-white dark:bg-gray-800" : "w-20 bg-white dark:bg-gray-800 items-center"
    )}>
      <div className={cn("mb-10 flex items-center", showSidebar ? "space-x-2" : "justify-center")}>
        <Logo className="h-8 w-8" />
        {showSidebar && <span className="text-xl font-bold text-gray-900 dark:text-white">Super Admin</span>}
      </div>

      <nav className="flex-grow space-y-2">
        {navItems.map((item, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <Button
                variant={item.path === window.location.pathname ? "secondary" : "ghost"} // Active state based on current path
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className={cn(
                "flex items-center p-0 h-auto",
                !showSidebar && "justify-center w-full"
              )}>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url || "https://github.com/shadcn.png"} alt={fullName} />
                  <AvatarFallback className="text-xs bg-gray-200 dark:bg-gray-700">
                    {fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {showSidebar && (
                  <div className="flex flex-col items-start ml-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{fullName}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{userRole}</span>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuLabel>{fullName}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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