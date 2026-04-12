"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ArrowRight, Clock, Building2, Tag } from 'lucide-react';
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
    <div className="space-y-4">
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-2">Attention Needed</h3>
      
      <div className="grid grid-cols-1 gap-3">
        {tickets.map((ticket) => (
          <Card 
            key={ticket.id} 
            className="group relative overflow-hidden border-none bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all rounded-[24px] cursor-pointer"
            onClick={() => onView(ticket.id)}
          >
            <div className="absolute left-0 top-0 h-full w-1.5 bg-rose-500" />
            
            <CardContent className="p-5 flex items-center justify-between gap-6">
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">#{ticket.id}</span>
                  <Badge variant="outline" className="bg-rose-50 text-rose-700 border-none font-bold text-[8px] uppercase tracking-widest">
                    <Clock className="h-2.5 w-2.5 mr-1" /> {ticket.hoursOpen}h Old
                  </Badge>
                </div>
                
                <h4 className="text-sm font-black tracking-tight text-foreground truncate group-hover:text-indigo-600 transition-colors">
                  {ticket.subject}
                </h4>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase">
                    <Building2 className="h-3 w-3" />
                    {ticket.customer}
                  </div>
                  <div className="h-3 w-px bg-border" />
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase">
                    <Tag className="h-3 w-3" />
                    {ticket.category}
                  </div>
                </div>
              </div>

              <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 bg-gray-50 dark:bg-gray-800 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}

        {tickets.length === 0 && (
          <div className="py-12 text-center bg-white dark:bg-gray-900 rounded-[24px] border border-dashed border-border/50">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No urgent tickets</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UrgentTickets;