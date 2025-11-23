"use client";

import React from 'react';
import { TicketTimelineEvent } from '@/types';
import { format } from 'date-fns';
import { Circle, MessageSquare, UserPlus, Tag, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TicketTimelineProps {
  events: TicketTimelineEvent[];
}

const iconMap: { [key: string]: React.ElementType } = {
  created: Clock,
  message: MessageSquare,
  assigned: UserPlus,
  priority_changed: AlertCircle,
  status_changed: Tag,
};

const TicketTimeline = ({ events }: TicketTimelineProps) => {
  if (events.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground text-sm">
        No timeline events available.
      </div>
    );
  }

  return (
    <div className="p-6 pt-4">
      <h3 className="text-lg font-semibold text-foreground mb-4">Activity Timeline</h3>
      <div className="relative pl-4">
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700 rounded-full" />
        {events.map((event, index) => {
          const IconComponent = iconMap[event.type] || Circle;
          return (
            <div key={event.id} className="relative mb-6 last:mb-0">
              <div className="absolute -left-0.5 top-0 flex items-center justify-center w-8 h-8 bg-background rounded-full z-10">
                <IconComponent className="h-4 w-4 text-primary" />
              </div>
              <div className="ml-8">
                <p className="text-sm font-medium text-foreground">{event.description}</p>
                <p className="text-xs text-muted-foreground">{format(new Date(event.timestamp), 'MMM dd, yyyy hh:mm a')}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TicketTimeline;