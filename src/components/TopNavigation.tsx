"use client";

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Bell, LogOut, Home, Layers, 
  Settings, Users, Brain, Activity,
  Zap, Command, ShieldCheck, BarChart3, User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useSupabase } from '@/components/SupabaseProvider';
import { supabase } from '@/integrations/supabase/client';
import { ThemeToggle } from './ThemeToggle';
import Logo from './Logo';
import { cn } from '@/lib/utils';
import NavPill from './NavPill';
import NotificationsSheet from './NotificationsSheet';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useOrgData } from '@/hooks/use-org-user';
import { usePermissions } from '@/hooks/use-permissions';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';

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
  const { isAdmin } = usePermissions();
  const user = session?.user;
  const fullName = orgUser?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const location = useLocation();
  const [isNotificationsSheetOpen, setIsNotificationsSheetOpen] = useState(false);

  const { data: unreadCount = 0 } = useQuery<number, Error>({
    queryKey: ["unreadNotificationsCount", user?.id],
    queryFn: () => fetchUnreadNotificationsCount(user?.id),
    enabled: !!user?.id,
    refetchInterval: 30000,
  } as UseQueryOptions<number, Error>);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/accept-invite';
  if (isAuthPage) return null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: User, label: "My Space", path: "/myspace" },
    { icon: Layers, label: "Queue", path: "/tickets" },
    { icon: Users, label: "Customer 360", path: "/customer360" },
    { icon: Activity, label: "Pulse", path: "/pulse" },
    { icon: BarChart3, label: "Reports", path: "/reports" },
    { icon: Brain, label: "Knowledge Hub", path: "/knowledge" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full h-16 bg-white dark:bg-gray-950 border-b border-border flex items-center">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex-1 flex justify-start">
          <Link to="/" className="flex items-center gap-2 group">
            <Logo className="h-6 w-auto text-primary fill-current transition-transform group-hover:scale-110" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground hidden sm:block">Aerchain</span>
          </Link>
        </div>

        <div className="hidden md:block flex-shrink-0">
          <NavPill items={navItems} activePath={location.pathname} />
        </div>

        <div className="flex-1 flex items-center justify-end gap-3">
          <div className="flex items-center gap-1">
            {isAdmin && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors" asChild>
                    <Link to="/team">
                      <Users className="h-5 w-5 text-muted-foreground" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Team Management</TooltipContent>
              </Tooltip>
            )}

            {isAdmin && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors" asChild>
                    <Link to="/settings">
                      <Settings className="h-5 w-5 text-muted-foreground" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Workspace Settings</TooltipContent>
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
                    <AvatarImage src={orgUser?.avatar_url || user?.user_metadata?.avatar_url} alt={fullName} />
                    <AvatarFallback className="bg-indigo-600 text-white font-black text-xs">
                      {fullName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </motion.button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 rounded-2xl shadow-2xl border-none p-2" align="end">
                <DropdownMenuLabel className="p-4">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-black leading-none">{fullName}</p>
                    <p className="text-xs font-medium text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800" />
                <DropdownMenuItem asChild className="rounded-xl cursor-pointer p-3">
                  <Link to="/myspace" className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800"><User className="h-4 w-4" /></div>
                    <span className="font-bold text-sm">My Space</span>
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild className="rounded-xl cursor-pointer p-3">
                    <Link to="/team" className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800"><Users className="h-4 w-4" /></div>
                      <span className="font-bold text-sm">Team Management</span>
                    </Link>
                  </DropdownMenuItem>
                )}
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

      <NotificationsSheet
        isOpen={isNotificationsSheetOpen}
        onClose={() => setIsNotificationsSheetOpen(false)}
      />
    </header>
  );
};

export default TopNavigation;