"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';
import { ArrowRight, List, Sparkles, Ticket } from 'lucide-react';

interface InvestigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: { module: string; month: string; count: number } | null;
}

const InvestigationModal = ({ isOpen, onClose, data }: InvestigationModalProps) => {
  if (!data) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900 rounded-[28px] shadow-2xl border-none">
        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
              <List className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black tracking-tight">{data.module} Investigation</DialogTitle>
              <DialogDescription className="text-sm font-medium text-muted-foreground">
                {data.month} • {data.count} Tickets Detected
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="px-6 pb-8 space-y-6">
          <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-3 flex items-center gap-2">
              <Sparkles className="h-3 w-3" /> AI Top Issue Detection
            </h4>
            <ul className="space-y-3">
              {['Supplier negotiation failure', 'RFQ approval delay', 'Invoice sync error'].map((issue, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                  <span className="text-sm font-bold text-foreground/90">{issue}</span>
                </li>
              ))}
            </ul>
          </div>

          <Button className="w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2 shadow-lg shadow-indigo-500/20">
            <Ticket className="h-4 w-4" />
            Jump to Tickets
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvestigationModal;