"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Smile, Paperclip, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TicketActionBarProps {
  onClose: () => void;
  freshdeskTicketUrl: string;
}

const TicketActionBar = ({ onClose, freshdeskTicketUrl }: TicketActionBarProps) => {
  return (
    <div className="sticky bottom-0 bg-white/80 backdrop-blur-md border-t border-gray-200/50 p-4 flex flex-col gap-3 z-10">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Quick reply..."
          className="flex-grow rounded-full bg-gray-100 dark:bg-gray-700 border-none focus-visible:ring-offset-0 focus-visible:ring-transparent"
        />
        <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary">
          <Smile className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary">
          <Paperclip className="h-5 w-5" />
        </Button>
        <Button size="icon" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
          <Send className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex justify-between gap-2">
        <Button asChild variant="outline" className="flex-grow rounded-full border-gray-300 dark:border-gray-600 bg-white/70 hover:bg-white dark:bg-gray-800/70 dark:hover:bg-gray-800">
          <a href={freshdeskTicketUrl} target="_blank" rel="noopener noreferrer">
            View in Freshdesk
          </a>
        </Button>
        <Button onClick={onClose} className="flex-grow rounded-full bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
          Close
        </Button>
      </div>
    </div>
  );
};

export default TicketActionBar;