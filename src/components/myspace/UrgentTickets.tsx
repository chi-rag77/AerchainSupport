"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UrgentTicket {
  id: string;
  subject: string;
  customer: string;
  hoursOpen: number;
  category: string;
}

interface UrgentTicketsProps {
  tickets: UrgentTicket[];
  onView: (id: string) => void;
}

const UrgentTickets = ({ tickets, onView }: UrgentTicketsProps) => {
  return (
    <Card className="border border-border/50 bg-white dark:bg-gray-900 rounded-[16px] shadow-sm overflow-hidden">
      <CardHeader className="p-5 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold">Urgent Tickets</CardTitle>
              <p className="text-[10px] font-medium text-muted-foreground">Needs immediate attention</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-rose-50 text-rose-600 border-none font-black text-[10px] h-6 w-6 flex items-center justify-center p-0 rounded-full">
            3
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
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">#{ticket.id}</span>
                  <h4 className="text-sm font-bold text-foreground truncate group-hover:text-indigo-600 transition-colors">
                    {ticket.subject}
                  </h4>
                </div>
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-tighter">
                  {ticket.customer} • {ticket.category}
                </p>
              </div>

              <Badge variant="outline" className="bg-rose-50 text-rose-600 border-rose-100 font-bold text-[10px] gap-1.5 px-2 py-0.5 rounded-lg">
                <Clock className="h-3 w-3" />
                {ticket.hoursOpen}h
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UrgentTickets;