"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ExecutiveSummary } from '@/features/dashboard/types';
import { Brain, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface DetailedReasoningModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: ExecutiveSummary | null;
}

const DetailedReasoningModal = ({ isOpen, onClose, summary }: DetailedReasoningModalProps) => {
  if (!summary) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border-none">
        <DialogHeader className="p-6 pb-4 text-left">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
              <Brain className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black tracking-tight">AI Detailed Reasoning</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                A comprehensive breakdown of the AI's analysis.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="px-6 pb-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="p-6 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50">
            <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-2">Executive Summary</h3>
            <p className="text-base font-medium leading-relaxed text-foreground/90">
              {summary.summary}
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> Key Risk Drivers
            </h3>
            <div className="space-y-3">
              {summary.keyDrivers && summary.keyDrivers.length > 0 ? (
                summary.keyDrivers.map((driver, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-border">
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span className="text-sm font-semibold">{driver}</span>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-border">
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  <span className="text-sm font-semibold">No significant risk drivers were identified in the data.</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" /> Suggested Executive Action
            </h3>
            <div className="p-4 rounded-lg bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/50">
              <p className="text-sm font-bold leading-relaxed text-purple-900 dark:text-purple-200">
                {summary.executiveAction || "Continue monitoring current operational trends."}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DetailedReasoningModal;