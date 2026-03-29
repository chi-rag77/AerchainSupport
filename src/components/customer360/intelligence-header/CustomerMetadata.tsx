"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { Building2, DollarSign, Briefcase, Calendar, Clock } from 'lucide-react';
import { isBefore, addMonths, parse } from 'date-fns';

interface CustomerMetadataProps {
  metadata: {
    tier: string;
    arr: string;
    industry: string;
    since: string;
    renewal: string;
  };
}

const CustomerMetadata = ({ metadata }: CustomerMetadataProps) => {
  // Logic to check if renewal is within 3 months
  const isRenewalSoon = React.useMemo(() => {
    try {
      // Assuming format like "Oct 2026" or "Oct 2024"
      const renewalDate = parse(metadata.renewal, 'MMM yyyy', new Date());
      return isBefore(renewalDate, addMonths(new Date(), 3));
    } catch (e) {
      return false;
    }
  }, [metadata.renewal]);

  const items = [
    { label: "Tier", value: metadata.tier, icon: Building2 },
    { label: "ARR", value: metadata.arr, icon: DollarSign },
    { label: "Industry", value: metadata.industry, icon: Briefcase },
    { label: "Since", value: metadata.since, icon: Calendar },
    { 
      label: "Renewal", 
      value: metadata.renewal, 
      icon: Clock,
      isAlert: isRenewalSoon 
    },
  ];

  return (
    <div className="flex items-center gap-6 h-full">
      {items.map((item, index) => (
        <div key={item.label} className="flex items-center gap-2 whitespace-nowrap">
          <item.icon className={cn(
            "h-3.5 w-3.5",
            item.isAlert ? "text-amber-500" : "text-muted-foreground"
          )} />
          <div className="flex items-baseline gap-1.5">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
              {item.label}
            </span>
            <span className={cn(
              "text-xs font-medium",
              item.isAlert ? "text-amber-600 font-bold" : "text-foreground"
            )}>
              {item.value}
            </span>
          </div>
          {index < items.length - 1 && (
            <div className="w-1 h-1 rounded-full bg-muted-foreground/20 ml-4" />
          )}
        </div>
      ))}
    </div>
  );
};

export default CustomerMetadata;