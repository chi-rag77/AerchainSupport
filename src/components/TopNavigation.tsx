"use client";

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Bell, LogOut, Home, Layers, BarChart2, Settings, MessageSquare, TrendingUp, BarChart3, Users } from 'lucide-react'; // Import Users icon
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useSupabase } from '@/components/SupabaseProvider';
import { supabase } from '@/integrations/supabase/client';
import { ThemeToggle } from './ThemeToggle';
import Logo from './Logo';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';
import NavPill from './NavPill'; // Import the new NavPill component

const TopNavigation = () => {
  const { session } = useSupabase();
  const user = session?.user;
  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Layers, label: "Queue", path: "/tickets" }, // Assuming 'Queue' maps to '/tickets'
    { icon: BarChart2, label: "Insights", path: "/analytics" }, // Assuming 'Insights' maps to '/analytics'
    { icon: Users, label: "Customer 360", path: "/customer360" }, // New Customer 360 item
  ];

  return (
    <nav className="sticky top-0 z-40 w-full bg-background border-b border-border shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Left Section: Logo and Version */}
        <div className="flex items-center space-x-2">
          <Link to="/" className="flex items-center space-x-2">
            <Logo className="h-6 w-auto text-primary fill-current" />
            <Badge variant="secondary" className="text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              v2.0
            </Badge>
          </Link>
        </div>

        {/* Middle Section: Navigation Links (using NavPill) */}
        <NavPill items={navItems} activePath={location.pathname} />

        {/* Right Section: Notifications and User Profile */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5 text-muted-foreground" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.user_metadata?.avatar_url || "https://github.com/shadcn.png"} alt={fullName} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{fullName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ThemeToggle />
                <span className="ml-2">Toggle Theme</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

export default TopNavigation;