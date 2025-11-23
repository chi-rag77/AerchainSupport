"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket } from '@/types';
import { cn } from '@/lib/utils';
import { Sparkles, XCircle, CheckCircle } from 'lucide-react';

interface CustomerCleanlinessScoreProps {
  tickets: Ticket[];
}

const CustomerCleanlinessScore = ({ tickets }: CustomerCleanlinessScoreProps) => {
  const { score, message, cleanTicketsCount, totalTicketsCount } = useMemo(() => {
    if (!tickets || tickets.length === 0) {
      return { score: 0, message: "No tickets to analyze.", cleanTicketsCount: 0, totalTicketsCount: 0 };
    }

    let cleanTickets = 0;
    const totalTickets = tickets.length;

    tickets.forEach(ticket => {
      const isSubjectGood = ticket.subject && ticket.subject.length >= 10;
      const isDescriptionGood = (ticket.description_text && ticket.description_text.length >= 20) || (ticket.description_html && ticket.description_html.length >= 20);
      const isTypeCategorized = ticket.type && ticket.type !== 'Unknown Type';
      const isModuleCategorized = ticket.cf_module && ticket.cf_module !== 'N/A';

      if (isSubjectGood && isDescriptionGood && isTypeCategorized && isModuleCategorized) {
        cleanTickets++;
      }
    });

    const calculatedScore = Math.round((cleanTickets / totalTickets) * 100);
    let statusMessage = "";
    if (calculatedScore >= 80) {
      statusMessage = "Excellent clarity!";
    } else if (calculatedScore >= 50) {
      statusMessage = "Good clarity, some room for improvement.";
    } else {
      statusMessage = "Needs better ticket clarity.";
    }

    return {
      score: calculatedScore,
      message: `${calculatedScore}/100 – ${statusMessage}`,
      cleanTicketsCount: cleanTickets,
      totalTicketsCount: totalTickets,
    };
  }, [tickets]);

  const scoreColorClass = score >= 80 ? "text-green-600 dark:text-green-400" : score >= 50 ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400";
  const IconComponent = score >= 80 ? CheckCircle : XCircle;

  return (
    <Card className="relative overflow-hidden group transition-all duration-300 hover:shadow-lg hover:scale-[1.02] h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" /> Customer Cleanliness Score
        </CardTitle>
        <IconComponent className={cn("h-5 w-5", scoreColorClass)} />
      </CardHeader>
      <CardContent className="text-sm space-y-2">
        <div className="text-4xl font-bold text-foreground">
          {score}<span className="text-xl text-muted-foreground">/100</span>
        </div>
        <p className={cn("text-lg font-medium", scoreColorClass)}>{message}</p>
        <p className="text-muted-foreground">
          {cleanTicketsCount} out of {totalTicketsCount} tickets meet clarity standards.
        </p>
        <ul className="text-xs text-muted-foreground list-disc pl-4 mt-2">
          <li>Subject length &gt;= 10 characters</li>
          <li>Description length &gt;= 20 characters</li>
          <li>Ticket Type is categorized</li>
          <li>Module (`cf_module`) is categorized</li>
        </ul>
      </CardContent>
    </Card>
  );
};

export default CustomerCleanlinessScore;