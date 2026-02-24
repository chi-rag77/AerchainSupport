"use client";

import React, { useMemo } from 'react';
import { Ticket } from '@/features/tickets/types';
import CompactTicketCard from './CompactTicketCard';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';

interface KanbanBoardProps {
  tickets: Ticket[];
  onTicketClick: (ticket: Ticket) => void;
}

const COLUMNS = [
  { id: 'Open (Being Processed)', label: 'Open', color: 'bg-blue-500' },
  { id: 'On Tech', label: 'On Tech', color: 'bg-purple-500' },
  { id: 'Pending (Awaiting your Reply)', label: 'In Progress', color: 'bg-amber-500' },
  { id: 'Escalated', label: 'Escalated', color: 'bg-red-500' },
  { id: 'Resolved', label: 'Resolved', color: 'bg-green-500' },
];

const KanbanBoard = ({ tickets, onTicketClick }: KanbanBoardProps) => {
  const groupedTickets = useMemo(() => {
    const groups: Record<string, Ticket[]> = {};
    COLUMNS.forEach(col => groups[col.id] = []);
    
    tickets.forEach(ticket => {
      if (groups[ticket.status]) {
        groups[ticket.status].push(ticket);
      } else {
        // Fallback for statuses not in our main columns
        if (!groups['Other']) groups['Other'] = [];
        groups['Other'].push(ticket);
      }
    });
    return groups;
  }, [tickets]);

  return (
    <div className="flex gap-6 h-[calc(100vh-350px)] min-h-[500px] overflow-x-auto pb-4">
      {COLUMNS.map((column) => (
        <div key={column.id} className="flex-shrink-0 w-80 flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${column.color}`} />
              <h3 className="font-black text-xs uppercase tracking-widest text-muted-foreground">
                {column.label}
              </h3>
            </div>
            <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-800 text-[10px] font-bold">
              {groupedTickets[column.id]?.length || 0}
            </Badge>
          </div>

          <ScrollArea className="flex-1 bg-gray-100/30 dark:bg-gray-900/30 rounded-[24px] p-3 border border-dashed border-gray-200 dark:border-gray-800">
            <div className="space-y-3">
              {groupedTickets[column.id]?.map((ticket, idx) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <CompactTicketCard 
                    ticket={ticket} 
                    onClick={() => onTicketClick(ticket)} 
                  />
                </motion.div>
              ))}
              {(!groupedTickets[column.id] || groupedTickets[column.id].length === 0) && (
                <div className="py-12 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-30">
                  Empty
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      ))}
    </div>
  );
};

export default KanbanBoard;