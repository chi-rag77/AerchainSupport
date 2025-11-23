"use client";

import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Event } from '@/types';
import { format } from 'date-fns';
import {
  TicketIcon, Package, Globe, Phone, Mail, Users, CalendarDays, TrendingUp, TrendingDown, Minus,
  Tag, Link as LinkIcon, Paperclip, ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface EventCardProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}

const iconMap: { [key: string]: React.ElementType } = {
  ticket: TicketIcon,
  product: Package,
  visit: Globe,
  call: Phone,
  email: Mail,
  meeting: Users,
};

const EventCard = ({ event, isOpen, onClose }: EventCardProps) => {
  if (!event) return null;

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
      case 'positive': return <TrendingUp className="h-4 w-4" />;
      case 'negative': return <TrendingDown className="h-4 w-4" />;
      default: return <Minus className="h-4 w-4" />;
    }
  };

  const handleViewTicket = (ticketId: string) => {
    // In a real app, this would navigate to the ticket detail page or open a modal
    toast.info(`Viewing ticket ${ticketId}`);
    console.log(`Navigate to /tickets/${ticketId}`);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col bg-midnight-glass backdrop-blur-xl border-l border-white/10 text-white">
        <SheetHeader className="p-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center border-2 border-neon-blue shadow-lg",
              getSentimentColor(event.sentiment)
            )}>
              <IconComponent className="h-5 w-5" />
            </div>
            <SheetTitle className="text-2xl font-bold text-white">{event.title}</SheetTitle>
          </div>
          <SheetDescription className="text-sm text-gray-300 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-gray-400" />
              <span>{format(new Date(event.date), 'MMM dd, yyyy HH:mm')}</span>
            </div>
            <div className={cn("flex items-center gap-1 text-sm font-medium", getSentimentColor(event.sentiment))}>
              {getSentimentIcon(event.sentiment)}
              <span>{event.sentiment.charAt(0).toUpperCase() + event.sentiment.slice(1)}</span>
            </div>
          </SheetDescription>
        </SheetHeader>

        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Summary</h3>
            <p className="text-gray-200 text-sm">{event.summary}</p>
          </div>

          {event.fullContext && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Full Context</h3>
              <p className="text-gray-200 text-sm">{event.fullContext}</p>
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Channels</h3>
            <div className="flex flex-wrap gap-2">
              {event.channels.map(channel => (
                <Badge key={channel} variant="secondary" className="bg-electric-purple/30 text-electric-purple border border-electric-purple/50">
                  <Tag className="h-3 w-3 mr-1" /> {channel}
                </Badge>
              ))}
            </div>
          </div>

          {event.attachments && event.attachments.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Attachments</h3>
              <div className="space-y-2">
                {event.attachments.map((attachment, index) => (
                  <a
                    key={index}
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-neon-blue hover:underline"
                  >
                    <Paperclip className="h-4 w-4" /> {attachment.name} <ExternalLink className="h-3 w-3" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {event.ticketId && (
            <div className="mt-6">
              <Button onClick={() => handleViewTicket(event.ticketId!)} className="w-full bg-neon-blue text-black hover:bg-neon-blue/80">
                <TicketIcon className="h-4 w-4 mr-2" /> View Related Ticket
              </Button>
            </div>
          )}
        </div>

        <Separator className="bg-white/10" />
        <div className="p-6 flex justify-end">
          <Button onClick={onClose} variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">Close</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default EventCard;