"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket } from '@/types';
import { cn } from '@/lib/utils';
import { Clock, Users, MessageSquare, User, TrendingUp, BarChart } from 'lucide-react'; // Added BarChart
import { differenceInDays, parseISO } from 'date-fns';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface CustomerOperationalLoadCardProps {
  customerName: string;
  tickets: Ticket[];
}

const CustomerOperationalLoadCard = ({ customerName, tickets }: CustomerOperationalLoadCardProps) => {
  const metrics = useMemo(() => {
    if (!tickets || tickets.length === 0) {
      return {
        avgOpenTicketAge: "N/A",
        agentTicketCounts: {},
        totalOpenTickets: 0,
      };
    }

    const now = new Date();
    const openTickets = tickets.filter(t => t.status.toLowerCase() !== 'resolved' && t.status.toLowerCase() !== 'closed');

    let totalOpenTicketAgeDays = 0;
    openTickets.forEach(ticket => {
      totalOpenTicketAgeDays += differenceInDays(now, parseISO(ticket.created_at));
    });
    const avgOpenTicketAge = openTickets.length > 0 ? (totalOpenTicketAgeDays / openTickets.length).toFixed(1) : "0";

    const agentTicketCounts: { [key: string]: number } = {};
    openTickets.forEach(ticket => {
      const assignee = ticket.assignee || 'Unassigned';
      agentTicketCounts[assignee] = (agentTicketCounts[assignee] || 0) + 1;
    });

    return {
      avgOpenTicketAge,
      agentTicketCounts,
      totalOpenTickets: openTickets.length,
    };
  }, [tickets]);

  return (
    <Card className="relative overflow-hidden group transition-all duration-300 hover:shadow-lg hover:scale-[1.02] h-full bg-card border border-border shadow-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-purple-500" /> Operational Load & Efficiency
        </CardTitle>
        <Badge variant="secondary" className="text-sm font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
          {customerName}
        </Badge>
      </CardHeader>
      <CardContent className="text-sm space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Average Open Ticket Age */}
          <div className="flex flex-col p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-border shadow-inner">
            <span className="text-muted-foreground flex items-center gap-1 mb-2 font-medium">
              <Clock className="h-4 w-4 text-blue-500" /> Avg. Open Ticket Age:
            </span>
            <span className="text-3xl font-bold text-foreground">{metrics.avgOpenTicketAge} days</span>
          </div>

          {/* Total Open Tickets */}
          <div className="flex flex-col p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-border shadow-inner">
            <span className="text-muted-foreground flex items-center gap-1 mb-2 font-medium">
              <Users className="h-4 w-4 text-green-500" /> Total Open Tickets:
            </span>
            <span className="text-3xl font-bold text-foreground">{metrics.totalOpenTickets}</span>
          </div>
        </div>

        {/* Tickets per Agent */}
        {Object.keys(metrics.agentTicketCounts).length > 0 && (
          <>
            <Separator />
            <div className="mt-4 pt-3">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" /> Tickets per Agent (Open):
              </h4>
              <ul className="space-y-3">
                {Object.entries(metrics.agentTicketCounts)
                  .sort(([, countA], [, countB]) => countB - countA)
                  .map(([agent, count]) => (
                    <li key={agent} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-border shadow-sm">
                      <span className="text-foreground font-medium text-base">{agent}</span>
                      <Badge variant="outline" className="text-xs px-2 py-1">
                        {count} tickets
                      </Badge>
                    </li>
                  ))}
              </ul>
            </div>
          </>
        )}

        {/* Placeholder for Average Messages per Ticket */}
        <div className="mt-4 pt-4 border-t border-border">
          <h4 className="font-semibold text-muted-foreground text-sm mb-2">Advanced Metrics (Requires more data):</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li><XCircle className="h-3 w-3 inline-block mr-1 text-red-500" /> Average Messages per Ticket: Requires fetching conversation data for all tickets.</li>
            <li><XCircle className="h-3 w-3 inline-block mr-1 text-red-500" /> Ticket Handoffs Count: Requires historical assignee data.</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerOperationalLoadCard;