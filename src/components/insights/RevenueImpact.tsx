"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, Building } from 'lucide-react';

const RevenueImpact = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
          <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-xl font-black tracking-tight">Revenue Impact</h3>
      </div>
      <Card className="border-none shadow-sm rounded-[24px] bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-base font-bold">Incident: Payment Gateway Failure</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-6">
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50">
            <span className="text-xs font-bold uppercase text-muted-foreground">Revenue at Risk</span>
            <p className="text-3xl font-black text-red-500">$84,000</p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50">
            <span className="text-xs font-bold uppercase text-muted-foreground">Affected Customers</span>
            <p className="text-3xl font-black">320</p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50">
            <span className="text-xs font-bold uppercase text-muted-foreground">Enterprise Accounts</span>
            <p className="text-3xl font-black">4</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RevenueImpact;