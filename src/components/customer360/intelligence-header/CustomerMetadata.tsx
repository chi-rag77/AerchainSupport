"use client";

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

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
  const items = [
    { label: "Tier", value: metadata.tier },
    { label: "ARR", value: metadata.arr },
    { label: "Industry", value: metadata.industry },
    { label: "Account Since", value: metadata.since },
    { label: "Renewal", value: metadata.renewal },
  ];

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
      {items.map((item, index) => (
        <React.Fragment key={item.label}>
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{item.label}:</span>
            <span className="font-semibold text-foreground">{item.value}</span>
          </div>
          {index < items.length - 1 && <Separator orientation="vertical" className="h-4" />}
        </React.Fragment>
      ))}
    </div>
  );
};

export default CustomerMetadata;