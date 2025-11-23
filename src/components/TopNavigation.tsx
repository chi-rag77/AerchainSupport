"use client";

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, BarChart, Shield, MessageSquare, Settings, LifeBuoy, LogOut, TrendingUp, BarChart3 } from 'lucide-react';
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
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import Logo from '@/components/Logo';
import { supabase } from '@/integrations/supabase/client';
import { ThemeToggle } from './ThemeToggle';

const TopNavigation = () => {
  const { session } = useSupabase();
  const user = session?.user;
  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const userRole = user?.user_metadata?.role || 'Admin';
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: TrendingUp, label: "Daily Dashboard", path: "/dashboard-v2" },
    { icon: BarChart3, label: "Analytics", path: "/analytics" },
    { icon: Users, label: "Users", path: "/users" },
    { icon: Shield, label: "Security", path: "/security" },
    { icon: MessageSquare, label: "Support & Ticketing", path: "/tickets" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-background border-b border-border shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center space-x-2">
            <Logo className="h-8 w-8" />
            <span className="text-xl font-bold text-foreground">Super Admin</span>
          </Link>
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                className={cn(
                  "text-sm font-medium transition-colors",
                  location.pathname === item.path
                    ? "bg-muted text-foreground hover:bg-muted"
                    : "text-muted-foreground hover:bg-transparent hover:text-foreground"
                )}
                asChild
              >
                <Link to={item.path}>
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Link>
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url || "https://github.com/shadcn.png"} alt={fullName} />
                  <AvatarFallback className="text-xs bg-muted text-foreground">
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