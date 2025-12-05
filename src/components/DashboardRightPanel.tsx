"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket } from '@/types';
import { AlertTriangle, Clock, Repeat, Users, MessageSquare, ArrowRight, Lightbulb, BellRing, TrendingUp, CalendarX, Tag, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { format, differenceInHours, parseISO, isPast, subDays } from 'date-fns';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface DashboardRightPanelProps {
  tickets: Ticket[];
  onViewTicketDetails: (ticket: Ticket) => void;
  selectedCompanyForMap?: string; // For Customer Escalation Map
  onOpenFilteredTicketsModal: (title: string, description: string, tickets: Ticket[]) => void; // New prop
}

const DashboardRightPanel = ({ tickets, onViewTicketDetails, selectedCompanyForMap, onOpenFilteredTicketsModal }: DashboardRightPanelProps) => {
  const now = useMemo(() => new Date(), []);

  // --- Escalation Radar Logic ---
  const escalationRadar = useMemo(() => {
    const allAutoEscalationCandidates: Ticket[] = [];
    const allStuckTickets: Ticket[] = [];

    const autoEscalationThresholdHours = 2; // 2 hours before due_by for Urgent tickets
    const stuckTicketNoUpdateHours = 24; // 24 hours no update

    tickets.forEach(ticket => {
      const statusLower = ticket.status.toLowerCase();
      const isActive = statusLower !== 'resolved' && statusLower !== 'closed';

      if (isActive) {
        // Auto-Escalation Candidate
        if (ticket.priority.toLowerCase() === 'urgent' && ticket.due_by) {
          const dueDate = parseISO(ticket.due_by);
          const diffHours = differenceInHours(dueDate, now);
          if (diffHours <= autoEscalationThresholdHours) {
            allAutoEscalationCandidates.push(ticket);
          }
        }

        // Stuck Tickets
        const lastUpdate = parseISO(ticket.updated_at);
        const hoursSinceLastUpdate = differenceInHours(now, lastUpdate);
        if (hoursSinceLastUpdate > stuckTicketNoUpdateHours) {
          allStuckTickets.push(ticket);
        }
      }
    });

    return {
      totalAutoEscalationCandidates: allAutoEscalationCandidates.length,
      autoEscalationCandidates: allAutoEscalationCandidates.slice(0, 3), // Show top 3
      allAutoEscalationCandidates, // Keep all for modal
      totalStuckTickets: allStuckTickets.length,
      stuckTickets: allStuckTickets.slice(0, 3), // Show top 3
      allStuckTickets, // Keep all for modal
    };
  }, [tickets, now]);

  // --- Recurrence & Patterns View Logic ---
  const recurringIssues = useMemo(() => {
    const subjectCounts = new Map<string, { count: number; tickets: Ticket[] }>();
    tickets.forEach(ticket => {
      const subjectLower = ticket.subject.toLowerCase();
      if (!subjectCounts.has(subjectLower)) {
        subjectCounts.set(subjectLower, { count: 0, tickets: [] });
      }
      const entry = subjectCounts.get(subjectLower)!;
      entry.count++;
      entry.tickets.push(ticket);
    });

    const allRecurringIssues = Array.from(subjectCounts.values())
      .filter(entry => entry.count > 3) // Simple threshold for recurrence
      .sort((a, b) => b.count - a.count);

    // Flatten all tickets from recurring issues for the modal
    const allTicketsFromRecurringIssues = allRecurringIssues.flatMap(issue => issue.tickets);

    return {
      totalRecurringIssues: allRecurringIssues.length,
      recurringIssues: allRecurringIssues.slice(0, 3), // Show top 3
      allTicketsFromRecurringIssues, // Keep all for modal
    };
  }, [tickets]);

  // --- Customer Escalation Map Logic ---
  const customerEscalationMap = useMemo(() => {
    if (!selectedCompanyForMap) return null;

    const customerTickets = tickets.filter(t => t.cf_company === selectedCompanyForMap);
    const last30DaysStart = subDays(now, 30);
    const relevantTickets = customerTickets.filter(t => parseISO(t.created_at) >= last30DaysStart);

    const totalTickets = relevantTickets.length;
    const urgentTickets = relevantTickets.filter(t => t.priority.toLowerCase() === 'urgent').length;
    const breachedSLAs = relevantTickets.filter(t => t.due_by && isPast(parseISO(t.due_by)) && t.status.toLowerCase() !== 'resolved' && t.status.toLowerCase() !== 'closed').length;

    let totalResolutionMinutes = 0;
    const resolvedTickets = relevantTickets.filter(t => t.status.toLowerCase() === 'resolved' || t.status.toLowerCase() === 'closed');
    resolvedTickets.forEach(t => {
      totalResolutionMinutes += differenceInHours(parseISO(t.updated_at), parseISO(t.created_at));
    });
    const avgResolutionTime = resolvedTickets.length > 0 ? (totalResolutionMinutes / resolvedTickets.length).toFixed(1) + " hrs" : "N/A";

    return {
      company: selectedCompanyForMap,
      totalTickets,
      urgentTickets,
      breachedSLAs,
      avgResolutionTime,
    };
  }, [tickets, now, selectedCompanyForMap]);

  // --- Actionable Insights Logic ---
  const actionableInsights = useMemo(() => {
    const insights: { message: string; type: 'info' | 'warning' | 'critical'; link?: string }[] = [];

    // Example 1: Overdue tickets for a specific company (e.g., the one selected for map)
    if (selectedCompanyForMap) {
      const overdueForCompany = tickets.filter(t =>
        t.cf_company === selectedCompanyForMap &&
        t.due_by && isPast(parseISO(t.due_by)) &&
        t.status.toLowerCase() !== 'resolved' && t.status.toLowerCase() !== 'closed'
      );
      const urgentOverdueForCompany = overdueForCompany.filter(t => t.priority.toLowerCase() === 'urgent').length;

      if (overdueForCompany.length > 0) {
        insights.push({
          message: `${overdueForCompany.length} tickets are overdue for ${selectedCompanyForMap} (Urgent: ${urgentOverdueForCompany}).`,
          type: overdueForCompany.length > 5 || urgentOverdueForCompany > 0 ? 'critical' : 'warning',
          link: `/tickets?company=${encodeURIComponent(selectedCompanyForMap)}&status=overdue`, // Placeholder link
        });
      }
    }

    // Example 2: High open backlog for a company
    const companyOpenTickets = new Map<string, number>();
    tickets.forEach(ticket => {
      const company = ticket.cf_company || 'Unknown Company';
      const statusLower = ticket.status.toLowerCase();
      if (statusLower !== 'resolved' && statusLower !== 'closed') {
        companyOpenTickets.set(company, (companyOpenTickets.get(company) || 0) + 1);
      }
    });

    let highestBacklogCompany: string | null = null;
    let maxBacklog = 0;
    companyOpenTickets.forEach((count, company) => {
      if (count > maxBacklog) {
        maxBacklog = count;
        highestBacklogCompany = company;
      }
    });

    if (highestBacklogCompany && maxBacklog > 10) { // Threshold for "highest open backlog"
      insights.push({
        message: `${highestBacklogCompany} has the highest open backlog (${maxBacklog} tickets).`,
        type: maxBacklog > 20 ? 'critical' : 'warning',
        link: `/customer360?customer=${encodeURIComponent(highestBacklogCompany)}`,
      });
    }

    return insights;
  }, [tickets, selectedCompanyForMap, now]);


  return (
    <div className="w-full lg:w-80 flex flex-col space-y-6 p-4 bg-card border-l border-border shadow-lg overflow-y-auto">
      {/* Escalation Radar */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" /> Escalation Radar
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-3">
          <div>
            <h4 className="font-medium flex items-center gap-1 mb-1">
              <BellRing className="h-4 w-4 text-orange-500" /> Auto-Escalation Candidates ({escalationRadar.totalAutoEscalationCandidates}):
            </h4>
            {escalationRadar.autoEscalationCandidates.length > 0 ? (
              <ul className="space-y-1">
                {escalationRadar.autoEscalationCandidates.map(ticket => (
                  <li key={ticket.id} className="flex justify-between items-center text-muted-foreground">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="truncate text-foreground">{ticket.subject}</span>
                      </TooltipTrigger>
                      <TooltipContent>{ticket.subject}</TooltipContent>
                    </Tooltip>
                    <Button variant="link" size="sm" className="h-auto p-0 text-blue-600 dark:text-blue-400" onClick={() => onViewTicketDetails(ticket)}>
                      View <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">None currently.</p>
            )}
            {escalationRadar.totalAutoEscalationCandidates > escalationRadar.autoEscalationCandidates.length && (
              <Button
                variant="link"
                size="sm"
                className="mt-2 w-full justify-center text-blue-600 dark:text-blue-400"
                onClick={() => onOpenFilteredTicketsModal(
                  "Auto-Escalation Candidates",
                  "Tickets identified as potential auto-escalation candidates due to urgency and proximity to SLA breach.",
                  escalationRadar.allAutoEscalationCandidates
                )}
              >
                View All ({escalationRadar.totalAutoEscalationCandidates}) <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>
          <Separator />
          <div>
            <h4 className="font-medium flex items-center gap-1 mb-1">
              <Clock className="h-4 w-4 text-yellow-500" /> Stuck Tickets (No update &gt; 24h) ({escalationRadar.totalStuckTickets}):
            </h4>
            {escalationRadar.stuckTickets.length > 0 ? (
              <ul className="space-y-1">
                {escalationRadar.stuckTickets.map(ticket => (
                  <li key={ticket.id} className="flex justify-between items-center text-muted-foreground">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="truncate text-foreground">{ticket.subject}</span>
                      </TooltipTrigger>
                      <TooltipContent>{ticket.subject}</TooltipContent>
                    </Tooltip>
                    <Button variant="link" size="sm" className="h-auto p-0 text-blue-600 dark:text-blue-400" onClick={() => onViewTicketDetails(ticket)}>
                      View <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">None currently.</p>
            )}
            {escalationRadar.totalStuckTickets > escalationRadar.stuckTickets.length && (
              <Button
                variant="link"
                size="sm"
                className="mt-2 w-full justify-center text-blue-600 dark:text-blue-400"
                onClick={() => onOpenFilteredTicketsModal(
                  "Stuck Tickets",
                  "Tickets that have not been updated in over 24 hours, potentially indicating they are stuck.",
                  escalationRadar.allStuckTickets
                )}
              >
                View All ({escalationRadar.totalStuckTickets}) <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recurrence & Patterns View */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <Repeat className="h-5 w-5" /> Recurring Issues ({recurringIssues.totalRecurringIssues}):
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          {recurringIssues.recurringIssues.length > 0 ? (
            <ul className="space-y-2">
              {recurringIssues.recurringIssues.map((issue, index) => (
                <li key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="truncate text-foreground">{issue.tickets[0].subject}</span>
                    </TooltipTrigger>
                    <TooltipContent>{issue.tickets[0].subject}</TooltipContent>
                  </Tooltip>
                  <Badge variant="secondary" className="ml-2">{issue.count} times</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No significant recurring issues detected.</p>
          )}
          {recurringIssues.totalRecurringIssues > recurringIssues.recurringIssues.length && (
            <Button
              variant="link"
              size="sm"
              className="mt-2 w-full justify-center text-blue-600 dark:text-blue-400"
              onClick={() => onOpenFilteredTicketsModal(
                "Recurring Issues",
                "Tickets that share similar subjects, indicating recurring problems.",
                recurringIssues.allTicketsFromRecurringIssues
              )}
            >
              View All ({recurringIssues.totalRecurringIssues}) <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Customer Escalation Map */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2 text-purple-600 dark:text-purple-400">
            <Users className="h-5 w-5" /> Customer Escalation Map
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-3">
          {selectedCompanyForMap ? (
            customerEscalationMap ? (
              <div className="space-y-2">
                <p className="text-base font-semibold text-foreground">{customerEscalationMap.company}</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">Tickets (30D):</span>
                    <span className="font-bold text-foreground">{customerEscalationMap.totalTickets}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">Urgent:</span>
                    <span className="font-bold text-red-500">{customerEscalationMap.urgentTickets}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">Breached SLAs:</span>
                    <span className="font-bold text-orange-500">{customerEscalationMap.breachedSLAs}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">Avg. Res. Time:</span>
                    <span className="font-bold text-foreground">{customerEscalationMap.avgResolutionTime}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No data for selected company in the last 30 days.</p>
            )
          ) : (
            <p className="text-muted-foreground">Select a company in the main filters to view its escalation map.</p>
          )}
        </CardContent>
      </Card>

      {/* Actionable Insights Panel */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2 text-green-600 dark:text-green-400">
            <Lightbulb className="h-5 w-5" /> Actionable Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-3">
          {actionableInsights.length > 0 ? (
            <ul className="space-y-2">
              {actionableInsights.map((insight, index) => (
                <li key={index} className={cn(
                  "p-3 rounded-md border",
                  insight.type === 'critical' && "bg-red-50/50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200",
                  insight.type === 'warning' && "bg-yellow-50/50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200",
                  insight.type === 'info' && "bg-blue-50/50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200",
                )}>
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <p className="flex-grow">{insight.message}</p>
                    {insight.link && (
                      <Button variant="link" size="sm" className="h-auto p-0 text-blue-600 dark:text-blue-400" onClick={() => window.open(insight.link, '_blank')}>
                        Go <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No actionable insights currently.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardRightPanel;