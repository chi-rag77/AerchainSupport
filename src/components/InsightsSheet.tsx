"use client";

import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import InsightsFilter from './InsightsFilter'; // Import the new InsightsFilter component
import { Insight } from '@/types';

interface InsightsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  insights: Insight[];
}

const InsightsSheet = ({ isOpen, onClose, insights }: InsightsSheetProps) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold">Dashboard Insights</SheetTitle>
          <SheetDescription>
            Proactive notifications and key observations about your support tickets.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-grow overflow-y-auto py-4">
          <InsightsFilter insights={insights} /> {/* Use InsightsFilter here */}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default InsightsSheet;