"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PendingTicket {
  id: string;
  subject: string;
  customer: string;
  waitDuration: string;
  priority: string;
  needsFollowUp: boolean;
  autoRemind?: boolean;
}

interface PendingResponsesProps {
  tickets: PendingTicket[];
  onView: (id: string) => void;
}

const PendingResponses = ({ tickets, onView }: PendingResponsesProps) => {
  return (
    <Card className="border border-border/50 bg-white dark:bg-gray-900 rounded-[16px] shadow-sm overflow-hidden">
      <CardHeader className="p-5 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold">Pending Responses</CardTitle>
              <p className="text-[10px] font-medium text-muted-foreground">Waiting on customer replies</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-amber-50 text-amber-600 border-none font-black text-[10px] px-3 py-0.5 rounded-full">
            3 waiting
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y divide-border/50">
          {tickets.map((ticket) => (
            <div 
              key={ticket.id} 
              className="group flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all cursor-pointer"
              onClick={() => onView(ticket.id)}
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">#{ticket.id}</span>
                  <h4 className="text-sm font-bold text-foreground truncate group-hover:text-indigo-600 transition-colors">
                    {ticket.subject}
                  </h4>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-tighter">
                    {ticket.customer}
                  </p>
                  {ticket.autoRemind && (
                    <div className="flex items-center gap-1 text-[9px] font-bold text-rose-600 uppercase tracking-tighter">
                      <AlertCircle className="h-2.5 w-2.5" />
                      Auto-remind suggested
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Badge variant="outline" className="bg-gray-50 text-muted-foreground border-none font-bold text-[10px] gap-1.5 px-2 py-0.5 rounded-lg">
                  <Clock className="h-3 w-3" />
                  {ticket.waitDuration}
                </Badge>
                {ticket.needsFollowUp && (
                  <Button size="sm" variant="outline" className="h-8 rounded-lg border-indigo-200 text-indigo-600 font-bold text-[10px] uppercase tracking-widest gap-2 hover:bg-indigo-50">
                    <MessageSquare className="h-3.5 w-3.5" />
                    Follow up
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PendingResponses;