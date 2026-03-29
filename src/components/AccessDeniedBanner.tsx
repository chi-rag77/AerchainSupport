"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ShieldAlert, Lock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '@/hooks/use-permissions';

const AccessDeniedBanner = () => {
  const navigate = useNavigate();
  const { role } = usePermissions();

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <Card className="max-w-md w-full border-none shadow-2xl rounded-[32px] overflow-hidden bg-white dark:bg-gray-900">
        <div className="p-8 text-center space-y-6">
          <div className="relative flex justify-center">
            <div className="absolute inset-0 bg-rose-500/20 rounded-full blur-2xl animate-pulse" />
            <div className="relative p-5 rounded-2xl bg-rose-50 dark:bg-rose-900/30 text-rose-600">
              <Lock className="h-10 w-10" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tight">Access Restricted</h2>
            <p className="text-sm font-medium text-muted-foreground leading-relaxed">
              This page requires elevated permissions. You are currently signed in as a <span className="font-bold text-foreground capitalize">{role}</span>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-border/50 text-xs font-medium text-muted-foreground">
            Contact your organization administrator to request a role change if you believe this is an error.
          </div>

          <Button 
            onClick={() => navigate(-1)}
            className="w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2 shadow-lg shadow-indigo-500/20"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AccessDeniedBanner;