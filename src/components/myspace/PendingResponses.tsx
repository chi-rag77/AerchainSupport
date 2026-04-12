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
    <Card className="border-none shadow-glass rounded-[28px] bg-white dark:bg-gray-900 overflow-hidden">
      <CardHeader className="p-6 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Users className="h-4 w-4" />
            </div>
            <CardTitle className="text-base font-black tracking-tight">Pending Responses</CardTitle>
          </div>
          <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-none font-bold text-[9px] uppercase tracking-widest">
            Waiting on Customers
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {tickets.map((ticket) => (
            <div 
              key={ticket.id}
              onClick={() => onView(ticket.id)}
              className={cn(
                "p-4 rounded-[20px] border transition-all duration-300 cursor-pointer group",
                ticket.needsFollowUp ? "bg-amber-50/30 dark:bg-amber-950/10 border-amber-100 dark:border-amber-900/50" : "bg-white dark:bg-gray-800 border-border/50 hover:border-indigo-200"
              )}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">#{ticket.id}</span>
                  <Badge variant="outline" className="text-[8px] font-black uppercase tracking-tighter border-none bg-gray-100 dark:bg-gray-700 px-1.5 py-0">
                    {ticket.priority}
                  </Badge>
                </div>

                <h4 className="text-xs font-bold leading-tight text-foreground line-clamp-2 group-hover:text-indigo-600 transition-colors">
                  {ticket.subject}
                </h4>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground uppercase">
                    <Clock className="h-3 w-3" />
                    Waiting {ticket.waitDuration}
                  </div>
                  {ticket.needsFollowUp && (
                    <div className="flex items-center gap-1 text-amber-600 animate-pulse">
                      <Bell className="h-3 w-3" />
                      <span className="text-[8px] font-black uppercase tracking-widest">Follow up</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {tickets.length === 0 && (
            <div className="col-span-full py-10 text-center opacity-30">
              <MessageSquare className="h-10 w-10 mx-auto mb-2" />
              <p className="text-[10px] font-bold uppercase tracking-widest">No pending responses</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PendingResponses;