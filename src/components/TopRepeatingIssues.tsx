"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket } from '@/types';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Tag } from 'lucide-react';

interface TopRepeatingIssuesProps {
  tickets: Ticket[];
  limit?: number;
}

const TopRepeatingIssues = ({ tickets, limit = 5 }: TopRepeatingIssuesProps) => {
  const topIssues = useMemo(() => {
    if (!tickets || tickets.length === 0) return [];

    const issueCounts = new Map<string, number>();

    tickets.forEach(ticket => {
      // Prioritize tags if available, otherwise use subject
      if (ticket.tags && ticket.tags.length > 0) {
        ticket.tags.forEach(tag => {
          const normalizedTag = tag.toLowerCase();
          issueCounts.set(normalizedTag, (issueCounts.get(normalizedTag) || 0) + 1);
        });
      } else {
        // Fallback to subject if no tags, or if tags are not specific enough
        const normalizedSubject = ticket.subject.toLowerCase();
        issueCounts.set(normalizedSubject, (issueCounts.get(normalizedSubject) || 0) + 1);
      }
    });

    return Array.from(issueCounts.entries())
      .map(([issue, count]) => ({ issue, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }, [tickets, limit]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-primary" /> Top {limit} Repeating Issues
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto">
        {topIssues.length > 0 ? (
          <ul className="space-y-3">
            {topIssues.map((item, index) => (
              <li key={item.issue} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center">
                  <Badge variant="secondary" className="mr-3 text-sm font-bold">{index + 1}</Badge>
                  <span className="text-sm font-medium text-foreground capitalize">{item.issue}</span>
                </div>
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {item.count} tickets
                </Badge>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-muted-foreground text-sm mt-4">No repeating issues found.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default TopRepeatingIssues;