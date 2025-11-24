"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket } from '@/types';
import { cn } from '@/lib/utils';
import { MessageSquare, FileText, Users, User, Clock, XCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface CustomerConversationActivityCardProps {
  customerName: string;
  tickets: Ticket[];
}

const CustomerConversationActivityCard = ({ customerName, tickets }: CustomerConversationActivityCardProps) => {
  const metrics = useMemo(() => {
    if (!tickets || tickets.length === 0) {
      return {
        totalTickets: 0,
        ticketsWithDescription: 0,
      };
    }

    const totalTickets = tickets.length;
    const ticketsWithDescription = tickets.filter(t => 
      (t.description_text && t.description_text.length > 0) || 
      (t.description_html && t.description_html.length > 0)
    ).length;

    return {
      totalTickets,
      ticketsWithDescription,
    };
  }, [tickets]);

  return (
    <Card className="relative overflow-hidden group transition-all duration-300 hover:shadow-lg hover:scale-[1.02] h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-500" /> Conversation Depth & Activity
        </CardTitle>
        <Badge variant="secondary" className="text-sm font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {customerName}
        </Badge>
      </CardHeader>
      <CardContent className="text-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Total Tickets */}
          <div className="flex flex-col p-3 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
            <span className="text-muted-foreground flex items-center gap-1 mb-1">
              <Users className="h-4 w-4 text-purple-500" /> Total Tickets:
            </span>
            <span className="text-2xl font-bold text-foreground">{metrics.totalTickets}</span>
          </div>

          {/* Tickets with Detailed Descriptions */}
          <div className="flex flex-col p-3 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
            <span className="text-muted-foreground flex items-center gap-1 mb-1">
              <FileText className="h-4 w-4 text-green-500" /> Tickets with Descriptions:
            </span>
            <span className="text-2xl font-bold text-foreground">{metrics.ticketsWithDescription}</span>
          </div>
        </div>

        {/* Placeholder for Average Messages per Ticket */}
        <div className="mt-4 pt-3 border-t border-border">
          <h4 className="font-semibold text-muted-foreground text-sm mb-2">Advanced Conversation Metrics (Requires more data):</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li><XCircle className="h-3 w-3 inline-block mr-1 text-red-500" /> Average Messages per Ticket: Requires fetching all conversation messages for tickets.</li>
            <li><XCircle className="h-3 w-3 inline-block mr-1 text-red-500" /> Agent vs. Customer Replies: Requires fetching conversation messages and distinguishing sender types.</li>
            <li><XCircle className="h-3 w-3 inline-block mr-1 text-red-500" /> Average First Response Time: Requires specific 'first_response_at' timestamps or parsing conversation data.</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerConversationActivityCard;