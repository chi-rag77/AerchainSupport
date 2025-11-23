"use client";

import React from 'react';
import { Event } from "@/types";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TicketIcon, Package, Globe, Phone, Mail, Users, CalendarDays, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { format } from 'date-fns';

interface EventNodeProps {
  event: Event;
  onClick: (event: Event) => void;
  isMobile?: boolean;
}

const iconMap: { [key: string]: React.ElementType } = {
  ticket: TicketIcon,
  product: Package,
  visit: Globe,
  call: Phone,
  email: Mail,
  meeting: Users,
};

const EventNode = ({ event, onClick, isMobile = false }: EventNodeProps) => {
  const IconComponent = iconMap[event.type] || Globe;

  const getSentimentColor = (sentiment: 'positive' | 'neutral' | 'negative') => {
    switch (sentiment) {
      case 'positive': return "bg-lime-green text-black";
      case 'negative': return "bg-hot-pink text-white";
      default: return "bg-gray-400 text-white";
    }
  };

  const getSentimentIcon = (sentiment: 'positive' | 'neutral' | 'negative') => {
    switch (sentiment) {
      case 'positive': return <TrendingUp className="h-3 w-3" />;
      case 'negative': return <TrendingDown className="h-3 w-3" />;
      default: return <Minus className="h-3 w-3" />;
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "relative flex flex-col items-center cursor-pointer group transition-all duration-150 ease-out",
            "hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neon-blue",
            isMobile ? "flex-row space-x-3 py-2" : "space-y-1 w-24 flex-shrink-0"
          )}
          onClick={() => onClick(event)}
          tabIndex={0}
          role="button"
          aria-label={`Event: ${event.title} on ${format(new Date(event.date), 'MMM dd, yyyy')}`}
        >
          {/* Timeline dot/line for mobile */}
          {isMobile && (
            <div className="relative flex-shrink-0">
              <div className="absolute left-1/2 -translate-x-1/2 top-0 h-full w-0.5 bg-gray-600 dark:bg-gray-700"></div>
              <div className={cn("relative z-10 h-4 w-4 rounded-full flex items-center justify-center", getSentimentColor(event.sentiment))}>
                <IconComponent className="h-2.5 w-2.5" />
              </div>
            </div>
          )}

          {/* Event Icon */}
          {!isMobile && (
            <div className={cn(
              "relative z-10 h-8 w-8 rounded-full flex items-center justify-center border-2",
              "bg-midnight-glass/80 border-white/20 shadow-lg",
              "group-hover:scale-110 group-hover:border-neon-blue group-hover:shadow-neon-blue/30",
              "transition-all duration-200 ease-out"
            )}>
              <IconComponent className={cn("h-4 w-4", getSentimentColor(event.sentiment).includes("bg-lime-green") ? "text-black" : "text-white")} />
            </div>
          )}

          {/* Event Details */}
          <div className={cn(
            "text-center",
            isMobile ? "text-left flex-grow" : ""
          )}>
            <p className={cn(
              "text-xs font-semibold",
              isMobile ? "text-foreground" : "text-gray-300 group-hover:text-white"
            )}>
              {format(new Date(event.date), isMobile ? 'MMM dd, yyyy HH:mm' : 'MMM dd')}
            </p>
            <p className={cn(
              "text-sm font-medium mt-0.5",
              isMobile ? "text-foreground" : "text-white group-hover:text-neon-blue"
            )}>
              {event.title}
            </p>
            {isMobile && (
              <div className={cn("flex items-center gap-1 text-xs mt-1", getSentimentColor(event.sentiment))}>
                {getSentimentIcon(event.sentiment)}
                <span>{event.sentiment.charAt(0).toUpperCase() + event.sentiment.slice(1)}</span>
              </div>
            )}
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent className="bg-midnight-glass backdrop-blur-md border border-white/20 text-white shadow-glass">
        <p className="font-semibold">{event.title}</p>
        <p className="text-xs text-gray-300">{format(new Date(event.date), 'MMM dd, yyyy HH:mm')}</p>
        <div className={cn("flex items-center gap-1 text-xs mt-1", getSentimentColor(event.sentiment))}>
          {getSentimentIcon(event.sentiment)}
          <span>{event.sentiment.charAt(0).toUpperCase() + event.sentiment.slice(1)}</span>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export default EventNode;