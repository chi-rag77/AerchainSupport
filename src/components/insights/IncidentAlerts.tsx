"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const alerts = [
  { id: 1, title: "Login failures increased 240%", time: "15 minutes ago", severity: "critical" },
  { id: 2, title: "Payment gateway failures detected", time: "1 hour ago", severity: "warning" },
];

const IncidentAlerts = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-xl font-black tracking-tight">Live Incident Alerts</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {alerts.map(alert => (
          <Card key={alert.id} className="border-none shadow-sm rounded-[24px] bg-white dark:bg-gray-800 group">
            <CardContent className="p-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-900/20">
                  <Zap className="h-6 w-6 text-red-500" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-lg">{alert.title}</h4>
                  <p className="text-xs font-medium text-muted-foreground">{alert.time}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default IncidentAlerts;