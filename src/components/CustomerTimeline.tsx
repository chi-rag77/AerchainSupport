"use client";

import React, { useMemo } from 'react';
import { Ticket } from '@/types';
import { format, parseISO } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Clock, PlusCircle, AlertCircle, MessageSquare, XCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomerTimelineProps {
  tickets: Ticket[];
}

interface TimelineEvent {
  date: Date;
  type: 'created' | 'resolved' | 'updated' | 'other';
  description: string;
  ticketId: string;
  status: string;
  priority: string;
}

const eventIconMap = {
  created: PlusCircle,
  resolved: CheckCircle,
  updated: Clock,
  other: MessageSquare,
};

const eventColorMap = {
  created: "text-blue-500",
  resolved: "text-green-500",
  updated: "text-yellow-500",
  other: "text-gray-500",
};

const CustomerTimeline = ({ tickets }: CustomerTimelineProps) => {
  const timelineEvents = useMemo(() => {
    const events: TimelineEvent[] = [];

    tickets.forEach(ticket => {
      // Ticket Created event
      events.push({
        date: parseISO(ticket.created_at),
        type: 'created',
        description: `Ticket created: ${ticket.subject}`,
        ticketId: ticket.id,
        status: ticket.status,
        priority: ticket.priority,
      });

      // Ticket Resolved/Closed event
      const statusLower = ticket.status.toLowerCase();
      if (statusLower === 'resolved' || statusLower === 'closed') {
        events.push({
          date: parseISO(ticket.updated_at), // Assuming updated_at is when it was resolved/closed
          type: 'resolved',
          description: `Ticket ${ticket.status.toLowerCase()}: ${ticket.subject}`,
          ticketId: ticket.id,
          status: ticket.status,
          priority: ticket.priority,
        });
      } else {
        // Generic updated event for other status changes (if not resolved/closed)
        // Only add if updated_at is significantly different from created_at
        if (parseISO(ticket.updated_at).getTime() !== parseISO(ticket.created_at).getTime()) {
          events.push({
            date: parseISO(ticket.updated_at),
            type: 'updated',
            description: `Ticket status changed to '${ticket.status}': ${ticket.subject}`,
            ticketId: ticket.id,
            status: ticket.status,
            priority: ticket.priority,
          });
        }
      }
      // You could add more event types here, e.g., 'SLA breached', 'Assigned to agent', etc.
    });

    // Sort events by date
    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [tickets]);

  if (timelineEvents.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No timeline events available for this customer.
      </div>
    );
  }

  return (
    <div className="relative pl-8">
      <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200 dark:bg-gray-700" />
      {timelineEvents.map((event, index) => {
        const IconComponent = eventIconMap[event.type] || Info;
        const colorClass = eventColorMap[event.type] || "text-gray-500";

        return (
          <div key={index} className="mb-6 flex items-start relative">
            <div className={cn("absolute -left-4 top-0.5 h-3 w-3 rounded-full bg-current", colorClass)} />
            <div className="flex-shrink-0 mr-4 mt-0.5">
              <IconComponent className={cn("h-5 w-5", colorClass)} />
            </div>
            <Card className="flex-grow shadow-sm">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-1">
                  <p className="font-semibold text-sm text-foreground">{event.description}</p>
                  <span className="text-xs text-muted-foreground">{format(event.date, 'MMM dd, yyyy HH:mm')}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  <p>Ticket ID: <span className="font-medium text-foreground">{event.ticketId}</span></p>
                  <p>Status: <span className="font-medium text-foreground">{event.status}</span></p>
                  <p>Priority: <span className="font-medium text-foreground">{event.priority}</span></p>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
};

export default CustomerTimeline;