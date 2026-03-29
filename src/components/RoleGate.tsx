"use client";

import React from 'react';
import { usePermissions } from '@/hooks/use-permissions';
import { UserRole } from '@/types';

interface RoleGateProps {
  allow: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const RoleGate = ({ allow, children, fallback = null }: RoleGateProps) => {
  const { role } = usePermissions();

  if (!allow.includes(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default RoleGate;