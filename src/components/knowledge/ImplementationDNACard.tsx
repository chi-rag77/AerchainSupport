"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { 
  Dna, Database, GitFork, Zap, ShieldAlert, 
  CheckCircle2, Info, Sparkles 
} from 'lucide-react';
import { ImplementationDNA } from '@/features/knowledge/types';

interface ImplementationDNACardProps {
  customerName: string;
  dna: ImplementationDNA;
  isLoading?: boolean;
}

const ImplementationDNACard = ({ customerName, dna, isLoading }: ImplementationDNACardProps) => {
  if (isLoading) {
    return (
      <Card className="h-full rounded-[32px] border-none bg-white dark:bg-gray-800 shadow-glass animate-pulse">
        <div className="p-8 space-y-6">
          <div className="h-8 w-48 bg-gray-100 dark:bg-gray-700 rounded-lg" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-gray-50 dark:bg-gray-900 rounded-2xl" />)}
          </div>
        </div>
      </Card>
    );
  }

  const items = [
    { label: "ERP System", value: dna.erp, icon: Database, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Approval Levels", value: `${dna.approval_levels} Levels`, icon: GitFork, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Integrations", value: `${dna.integrations_count} Active`, icon: Zap, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Custom Logic", value: dna.custom_validations ? "Enabled" : "Standard", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
  ];

  return (
    <Card className="relative overflow-hidden border-none bg-white dark:bg-gray-800 shadow-glass rounded-[32px] h-full">
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <Dna className="h-32 w-32" />
      </div>

      <CardHeader className="p-8 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
              <Dna className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-black tracking-tight">Implementation DNA</CardTitle>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{customerName}</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-indigo-50/50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-200/50 font-bold text-[10px] uppercase tracking-widest">
            <Sparkles className="h-3 w-3 mr-1.5" /> AI Synthesized
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-8 pt-0 space-y-8">
        <div className="grid grid-cols-2 gap-4">
          {items.map((item) => (
            <div key={item.label} className={cn("p-4 rounded-2xl border border-border/50 transition-all hover:border-indigo-200", item.bg, "dark:bg-gray-900/50")}>
              <div className="flex items-center gap-2 mb-2">
                <item.icon className={cn("h-3.5 w-3.5", item.color)} />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{item.label}</span>
              </div>
              <div className="text-lg font-black tracking-tight">{item.value}</div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <h5 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <ShieldAlert className="h-3.5 w-3.5 text-rose-500" /> High Risk Modules
          </h5>
          <div className="flex flex-wrap gap-2">
            {dna.high_risk_modules.map(m => (
              <Badge key={m} variant="secondary" className="bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400 border-none font-bold px-3 py-1">
                {m}
              </Badge>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-border flex items-start gap-3">
          <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-xs font-medium text-muted-foreground leading-relaxed">
            This DNA profile helps agents understand the customer's environment instantly, reducing discovery time by up to 40%.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImplementationDNACard;