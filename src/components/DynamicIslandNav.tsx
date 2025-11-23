"use client";

import React, { useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, BarChart, Shield, MessageSquare, Settings, LogOut, TrendingUp, BarChart3, Menu, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSupabase } from '@/components/SupabaseProvider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import Logo from '@/components/Logo';
import { supabase } from '@/integrations/supabase/client';
import { ThemeToggle } from './ThemeToggle';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';

const DynamicIslandNav = () => {
  const { session } = useSupabase();
  const user = session?.user;
  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(navRef, () => setIsOpen(false));

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsOpen(false); // Close the island after logout
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
    <div
      ref={navRef}
      className={cn(
        "fixed bottom-4 right-4 z-50 transition-all duration-300 ease-in-out",
        "bg-card border border-border shadow-lg",
        isOpen
          ? "w-64 h-auto rounded-xl p-4 flex flex-col space-y-4"
          : "w-14 h-14 rounded-full flex items-center justify-center"
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "absolute transition-all duration-300 ease-in-out",
          isOpen ? "top-4 right-4" : "inset-0 m-auto"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {isOpen && (
        <div className="flex flex-col space-y-4 opacity-100 transition-opacity duration-300 delay-150">
          {/* User Profile */}
          <div className="flex items-center space-x-3 pb-2 border-b border-border">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user?.user_metadata?.avatar_url || "https://github.com/shadcn.png"} alt={fullName} />
              <AvatarFallback className="text-xs bg-muted text-foreground">
                {fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <p className="text-sm font-medium leading-none">{fullName}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col space-y-1">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                className={cn(
                  "justify-start text-sm font-medium transition-colors",
                  location.pathname === item.path
                    ? "bg-muted text-foreground hover:bg-muted"
                    : "text-muted-foreground hover:bg-transparent hover:text-foreground"
                )}
                asChild
                onClick={() => setIsOpen(false)} // Close on navigation
              >
                <Link to={item.path}>
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Link>
              </Button>
            ))}
          </div>

          {/* Logout Button */}
          <Button
            variant="ghost"
            className="justify-start text-sm font-medium text-muted-foreground hover:bg-transparent hover:text-foreground"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </Button>

          {/* Theme Toggle */}
          <div className="pt-2 border-t border-border flex justify-center">
            <ThemeToggle />
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicIslandNav;