"use client";

import React from 'react';
import { useSupabase } from './SupabaseProvider';
import { Navigate, useLocation } from 'react-router-dom';
import { useOrgData } from '@/hooks/use-org-user';
import AccessDeniedBanner from './AccessDeniedBanner';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { session } = useSupabase();
  const { orgUser, isOrgLoading } = useOrgData();
  const location = useLocation();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (isOrgLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] dark:bg-gray-950">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
        <p className="text-lg font-black uppercase tracking-widest text-muted-foreground">Verifying Access...</p>
      </div>
    );
  }

  // 1. Check if user is active
  if (orgUser && !orgUser.is_active) {
    return <AccessDeniedBanner />;
  }

  // 2. Page-specific role gating
  const role = orgUser?.role ?? 'viewer';
  
  const restrictedPages = {
    '/settings': ['admin'],
    '/team': ['admin'],
  };

  const allowedRoles = restrictedPages[location.pathname as keyof typeof restrictedPages];
  
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <AccessDeniedBanner />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;