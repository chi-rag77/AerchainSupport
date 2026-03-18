"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, MessageSquare, Smile, Zap, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface MessageAIActionProps {
  content: string;
  onResult: (result: string) => void;
}

const MessageAIAction = ({ content, onResult }: MessageAIActionProps) => {
  const [loading, setLoading] = useState<string | null>(null);

  const runAction = async (type: 'summarize' | 'sentiment' | 'action') => {
    setLoading(type);
    // Simulate AI call for now - in production this calls an edge function
    setTimeout(() => {
      const results = {
        summarize: "The customer is reporting a recurring timeout in the RFQ module.",
        sentiment: "Frustrated but professional. High urgency detected.",
        action: "Verify API logs for the timestamp mentioned."
      };
      onResult(results[type]);
      setLoading(null);
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} complete`);
    }, 800);
  };

  return (
    <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => runAction('summarize')}
        className="h-7 px-2 text-[10px] font-bold uppercase tracking-tighter gap-1 hover:bg-indigo-50 hover:text-indigo-600"
      >
        {loading === 'summarize' ? <Loader2 className="h-3 w-3 animate-spin" /> : <MessageSquare className="h-3 w-3" />}
        Summarize
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => runAction('sentiment')}
        className="h-7 px-2 text-[10px] font-bold uppercase tracking-tighter gap-1 hover:bg-indigo-50 hover:text-indigo-600"
      >
        {loading === 'sentiment' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Smile className="h-3 w-3" />}
        Sentiment
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => runAction('action')}
        className="h-7 px-2 text-[10px] font-bold uppercase tracking-tighter gap-1 hover:bg-indigo-50 hover:text-indigo-600"
      >
        {loading === 'action' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
        Extract Action
      </Button>
    </div>
  );
};

export default MessageAIAction;