"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Bell, LogOut, Home, Layers, 
  Settings, Users, KeyRound, Brain, Activity,
  Search, Command, ShieldCheck, Zap, Clock, Target,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useSupabase } from '@/components/SupabaseProvider';
import { supabase } from '@/integrations/supabase/client';
import { ThemeToggle } from './ThemeToggle';
import Logo from './Logo';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';
import NavPill from './NavPill';
import NotificationsSheet from './NotificationsSheet';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useOrgData } from '@/hooks/use-org-user';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

const fetchUnreadNotificationsCount = async (userId: string | undefined): Promise<number> => {
  if (!userId) return 0;
  const { count, error } = await supabase
    .from('user_notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) throw error;
  return count || 0;
};

const TopNavigation = () => {
  const { session } = useSupabase();
  const { orgUser } = useOrgData();
  const user = session?.user;
  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const location = useLocation();
  const [isNotificationsSheetOpen, setIsNotificationsSheetOpen] = useState(false);

  const { scrollY } = useScroll();
  const navHeight = useTransform(scrollY, [0, 50], [80, 64]);
  const navShadow = useTransform(scrollY, [0, 50], ["0px 0px 0px rgba(0,0,0,0)", "0px 4px 20px rgba(0,0,0,0.05)"]);

  const { data: unreadCount = 0 } = useQuery<number, Error>({
    queryKey: ["unreadNotificationsCount", user?.id],
    queryFn: () => fetchUnreadNotificationsCount(user?.id),
    enabled: !!user?.id,
    refetchInterval: 30000,
  } as UseQueryOptions<number, Error>);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  if (isAuthPage) return null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Layers, label: "Queue", path: "/tickets" },
    { icon: Users, label: "Customer 360", path: "/customer360" },
    { icon: Activity, label: "Pulse", path: "/pulse" },
    { icon: BarChart3, label: "Reports", path: "/reports" },
    { icon: Brain, label: "Knowledge Hub", path: "/knowledge" },
  ];

  const canViewSettings = orgUser && (orgUser.role === 'admin' || orgUser.role === 'manager');

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Solid Background Layer */}
      <motion.div 
        style={{ height: navHeight, boxShadow: navShadow }}
        className="absolute inset-0 bg-white dark:bg-gray-950 border-b border-white/20 dark:border-gray-800/30 transition-colors duration-500"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
          <motion.div 
            animate={{ 
              x: [0, 100, 0],
              y: [0, 50, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-200/40 dark:bg-indigo-900/20 rounded-full blur-[100px]" 
          />
          <motion.div 
            animate={{ 
              x: [0, -100, 0],
              y: [0, -50, 0],
              scale: [1, 1.3, 1]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-200/40 dark:bg-purple-900/20 rounded-full blur-[100px]" 
          />
        </div>
      </motion.div>

      <div className="container mx-auto relative z-10">
        {/* Main Nav Row */}
        <div className="flex h-16 items-center justify-between px-4">
          {/* Left: Logo */}
          <div className="flex-1 flex justify-start">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <Logo className="h-6 w-auto text-primary fill-current relative z-10 transition-transform group-hover:scale-110" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground hidden sm:block">Aerchain</span>
            </Link>
          </div>

          {/* Center: Navigation */}
          <div className="hidden md:block flex-shrink-0">
            <NavPill items={navItems} activePath={location.pathname} />
          </div>

          {/* Right: Actions */}
          <div className="flex-1 flex items-center justify-end gap-3">
            {/* Command Hint */}
            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100/50 dark:bg-gray-800/50 border border-border/50 text-[10px] font-black text-muted-foreground">
              <Command className="h-3 w-3" />
              <span>K</span>
            </div>

            <div className="flex items-center gap-1">
              {canViewSettings && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors" asChild>
                      <Link to="/settings">
                        <Settings className="h-5 w-5 text-muted-foreground" />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Settings</TooltipContent>
                </Tooltip>
              )}

              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full relative hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors" 
                onClick={() => setIsNotificationsSheetOpen(true)}
              >
                <Bell className="h-5 w-5 text-muted-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-white dark:border-gray-950"></span>
                  </span>
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative h-9 w-9 rounded-full overflow-hidden border-2 border-transparent hover:border-indigo-500 transition-all ml-2"
                  >
                    <Avatar className="h-full w-full">
                      <AvatarImage src={user?.user_metadata?.avatar_url} alt={fullName} />
                      <AvatarFallback className="bg-indigo-600 text-white font-black text-xs">
                        {fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 rounded-2xl shadow-2xl border-none p-2" align="end">
                  <DropdownMenuLabel className="p-4">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-black leading-none">{fullName}</p>
                      <p className="text-xs font-medium text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800" />
                  <DropdownMenuItem asChild className="rounded-xl cursor-pointer p-3">
                    <Link to="/settings" className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800"><Settings className="h-4 w-4" /></div>
                      <span className="font-bold text-sm">Workspace Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-xl p-3">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800"><Zap className="h-4 w-4" /></div>
                        <span className="font-bold text-sm">Theme</span>
                      </div>
                      <ThemeToggle />
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800" />
                  <DropdownMenuItem onClick={handleLogout} className="rounded-xl cursor-pointer p-3 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/30"><LogOut className="h-4 w-4" /></div>
                      <span className="font-bold text-sm">Sign Out</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <NotificationsSheet
        isOpen={isNotificationsSheetOpen}
        onClose={() => setIsNotificationsSheetOpen(false)}
      />
    </header>
  );
};

export default TopNavigation;