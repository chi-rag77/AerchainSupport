"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket } from '@/types';
import { cn } from '@/lib/utils';
import { History, BarChart2, Users, MessageSquare, XCircle, Clock } from 'lucide-react'; // Added Clock
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface CustomerHistoricalBehaviourCardProps {
  customerName: string;
  tickets: Ticket[]; // Tickets are passed, though not directly used for these placeholders
}

const CustomerHistoricalBehaviourCard = ({ customerName, tickets }: CustomerHistoricalBehaviourCardProps) => {
  return (
    <Card className="relative overflow-hidden group transition-all duration-300 hover:shadow-lg hover:scale-[1.02] h-full bg-card border border-border shadow-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <History className="h-5 w-5 text-orange-500" /> Historical Behaviour
        </CardTitle>
        <Badge variant="secondary" className="text-sm font-semibold bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
          {customerName}
        </Badge>
      </CardHeader>
      <CardContent className="text-sm space-y-5">
        <div className="grid grid-cols-1 gap-4">
          {/* Placeholder for Activity Heatmap */}
          <div className="flex flex-col p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-border shadow-inner">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-muted-foreground" /> Activity Heatmap
            </h4>
            <p className="text-muted-foreground text-xs">
              Visual representation of ticket creation/resolution patterns over time.
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 mt-2">
              <li><XCircle className="h-3 w-3 inline-block mr-1 text-red-500" /> Requires detailed time-series data for ticket events.</li>
            </ul>
          </div>

          {/* Placeholder for Most Active Customer Contacts */}
          <div className="flex flex-col p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-border shadow-inner">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" /> Most Active Customer Contacts
            </h4>
            <p className="text-muted-foreground text-xs">
              Identifies key individuals from the customer's team who frequently open tickets.
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 mt-2">
              <li><XCircle className="h-3 w-3 inline-block mr-1 text-red-500" /> Requires contact-level data from Freshdesk (e.g., requester name/ID).</li>
            </ul>
          </div>

          {/* Placeholder for Contact-Based Ticket Summary */}
          <div className="flex flex-col p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-border shadow-inner">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" /> Contact-Based Ticket Summary
            </h4>
            <p className="text-muted-foreground text-xs">
              Summary of tickets opened by specific contacts within the customer's organization.
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 mt-2">
              <li><XCircle className="h-3 w-3 inline-block mr-1 text-red-500" /> Requires contact-level data and filtering capabilities.</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerHistoricalBehaviourCard;