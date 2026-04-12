"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, ArrowRight, Clock, MessageSquare, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PendingTicket {
  id: string;
  subject: string;
  waitDuration: string;
  priority: string;
  needsFollowUp: boolean;
}

interface PendingResponsesProps {
  tickets: PendingTicket[];
  onView: (id: string) => void;
}

const PendingResponses = ({ tickets, onView }: PendingResponsesProps) => {
  return (
    <Card className="border-none shadow-glass rounded-[32px] bg-white dark:bg-gray-900 overflow-hidden">
      <CardHeader className="p-8 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Users className="h-5 w-5" />
            </div>
            <CardTitle className="text-xl font-black tracking-tight">Pending Responses</CardTitle>
          </div>
          <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-none font-bold text-[10px] uppercase tracking-widest">
            Waiting on Customers
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-8 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tickets.map((ticket) => (
            <div 
              key={ticket.id}
              onClick={() => onView(ticket.id)}
              className={cn(
                "p-5 rounded-[24px] border-2 transition-all duration-300 cursor-pointer group",
                ticket.needsFollowUp ? "bg-amber-50/30 dark:bg-amber-950/10 border-amber-100 dark:border-amber-900/50" : "bg-white dark:bg-gray-800 border-border/50 hover:border-indigo-200"
              )}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">#{ticket.id}</span>
                  <Badge variant="outline" className="text-[8px] font-black uppercase tracking-tighter border-none bg-gray-100 dark:bg-gray-700">
                    {ticket.priority}
                  </Badge>
                </div>

                <h4 className="text-sm font-bold leading-tight text-foreground line-clamp-2 group-hover:text-indigo-600 transition-colors">
                  {ticket.subject}
                </h4>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase">
                    <Clock className="h-3 w-3" />
                    Waiting {ticket.waitDuration}
                  </div>
                  {ticket.needsFollowUp && (
                    <div className="flex items-center gap-1 text-amber-600 animate-pulse">
                      <Bell className="h-3 w-3" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Follow up</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {tickets.length === 0 && (
            <div className="col-span-full py-12 text-center opacity-30">
              <MessageSquare className="h-12 w-12 mx-auto mb-2" />
              <p className="text-xs font-bold uppercase tracking-widest">No pending responses</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PendingResponses;