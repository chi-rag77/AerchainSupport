"use client";

import React from 'react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { AlertCircle, ShieldAlert, Info, MessageSquare } from 'lucide-react';
import { IncidentEvent } from '@/features/customer360/types';

interface IncidentTimelineProps {
  events: IncidentEvent[];
}

const IncidentTimeline = ({ events }: IncidentTimelineProps) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'critical': return <ShieldAlert className="h-4 w-4 text-red-600" />;
      case 'high': return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case 'medium': return <MessageSquare className="h-4 w-4 text-amber-600" />;
      default: return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getBg = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-red-50 dark:bg-red-900/20';
      case 'high': return 'bg-orange-50 dark:bg-orange-900/20';
      case 'medium': return 'bg-amber-50 dark:bg-amber-900/20';
      default: return 'bg-blue-50 dark:bg-blue-900/20';
    }
  };

  return (
    <div className="space-y-6">
      <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Incident Timeline</h4>
      
      <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent dark:before:via-gray-800">
        {events.map((event) => (
          <div key={event.id} className="relative flex items-start gap-6 group">
            <div className={cn(
              "flex items-center justify-center w-10 h-10 rounded-full shadow-sm shrink-0 z-10 transition-transform group-hover:scale-110",
              getBg(event.type)
            )}>
              {getIcon(event.type)}
            </div>
            
            <div className="flex-1 pt-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                <h5 className="text-sm font-black text-foreground">{event.title}</h5>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  {format(parseISO(event.date), 'MMM dd, yyyy')}
                </span>
              </div>
              <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                {event.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IncidentTimeline;