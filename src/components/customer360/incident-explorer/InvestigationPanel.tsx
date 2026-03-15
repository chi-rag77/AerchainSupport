"use client";

import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Search, Ticket, AlertCircle, ArrowRight, Sparkles, List } from 'lucide-react';
import { IssueCluster } from '@/features/customer360/types';

interface InvestigationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  cluster: IssueCluster | null;
}

const InvestigationPanel = ({ isOpen, onClose, cluster }: InvestigationPanelProps) => {
  if (!cluster) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0 border-none shadow-2xl">
        <SheetHeader className="p-8 pb-6 bg-indigo-600 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md">
              <Search className="h-6 w-6 text-white" />
            </div>
            <Badge className="bg-white/20 text-white border-none font-black uppercase tracking-widest text-[10px]">
              Investigation Mode
            </Badge>
          </div>
          <SheetTitle className="text-3xl font-black tracking-tight text-white">
            {cluster.name}
          </SheetTitle>
          <SheetDescription className="text-indigo-100 font-medium">
            Deep-dive analysis of {cluster.ticketCount} related incidents.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 p-8 space-y-10">
          {/* Top Errors */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" /> Top Error Patterns
            </h4>
            <div className="space-y-3">
              {cluster.topErrors.map((error, i) => (
                <div key={i} className="p-4 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                  <span className="text-sm font-bold text-red-900 dark:text-red-200">{error}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Related Tickets */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <List className="h-4 w-4 text-indigo-600" /> Related Tickets
            </h4>
            <div className="space-y-3">
              {cluster.relatedTicketIds.map((id) => (
                <div key={id} className="group p-4 rounded-2xl bg-white dark:bg-gray-800 border border-border hover:border-indigo-200 transition-all flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Ticket className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-black text-foreground">#{id}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="font-bold text-xs gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    View <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommendation */}
          <div className="p-6 rounded-[24px] bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h5 className="text-xs font-black uppercase tracking-widest text-indigo-600">AI Investigation Insight</h5>
                <p className="text-sm font-bold leading-relaxed text-indigo-900 dark:text-indigo-200">
                  This cluster shows a high correlation with recent API version updates. 
                  Recommend checking the integration logs for {cluster.name.split(' ')[0]} specifically.
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="p-8 bg-gray-50 dark:bg-gray-900 border-t border-border">
          <Button onClick={onClose} className="w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-500/20">
            Close Investigation
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default InvestigationPanel;