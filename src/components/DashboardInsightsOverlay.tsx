"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket } from '@/types';
import { AlertTriangle, Clock, Repeat, Users, MessageSquare, ArrowRight, Lightbulb, BellRing, TrendingUp, CalendarX, Tag, Info, Zap, User, GitFork, LayoutDashboard, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { format, differenceInHours, parseISO, isPast, subDays } from 'date-fns';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DashboardInsightsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  tickets: Ticket[];
  onViewTicketDetails: (ticket: Ticket) => void;
  selectedCompanyForMap?: string;
  onOpenFilteredTicketsModal: (title: string, description: string, tickets: Ticket[]) => void;
}

const DashboardInsightsOverlay = ({
  isOpen,
  onClose,
  tickets,
  onViewTicketDetails,
  selectedCompanyForMap,
  onOpenFilteredTicketsModal,
}: DashboardInsightsOverlayProps) => {
  const now = useMemo(() => new Date(), []);

  // --- Escalation Radar Logic (Combines Auto-Escalation and Stuck Tickets) ---
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
      autoEscalationCandidates: allAutoEscalationCandidates.slice(0, 3), // Show top 3 for preview
      allAutoEscalationCandidates, // Keep all for modal
      totalStuckTickets: allStuckTickets.length,
      stuckTickets: allStuckTickets.slice(0, 3), // Show top 3 for preview
      allStuckTickets, // Keep all for modal
    };
  }, [tickets, now]);

  // --- Top SLA Breaches (Live) ---
  const topSlaBreaches = useMemo(() => {
    const breachedTickets = tickets.filter(t =>
      t.due_by && isPast(parseISO(t.due_by)) &&
      t.status.toLowerCase() !== 'resolved' && t.status.toLowerCase() !== 'closed'
    ).sort((a, b) => parseISO(a.due_by!).getTime() - parseISO(b.due_by!).getTime()); // Sort by oldest breach first

    return {
      totalBreaches: breachedTickets.length,
      breachesPreview: breachedTickets.slice(0, 5), // Show top 5
      allBreachedTickets: breachedTickets, // Keep all for modal
    };
  }, [tickets]);

  // --- Real-time Escalations ---
  const realTimeEscalations = useMemo(() => {
    const recentlyEscalated = tickets.filter(t => {
      const statusLower = t.status.toLowerCase();
      const isEscalatedOrUrgent = statusLower === 'escalated' || t.priority.toLowerCase() === 'urgent';
      const updatedRecently = differenceInHours(now, parseISO(t.updated_at)) <= 24; // Updated in last 24 hours

      return isEscalatedOrUrgent && updatedRecently;
    }).sort((a, b) => parseISO(b.updated_at).getTime() - parseISO(a.updated_at).getTime()); // Most recent first

    return {
      totalEscalations: recentlyEscalated.length,
      escalationsPreview: recentlyEscalated.slice(0, 5), // Show top 5
      allEscalatedTickets: recentlyEscalated, // Keep all for modal
    };
  }, [tickets, now]);

  // --- Recurring Issues Logic ---
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
      recurringIssuesPreview: allRecurringIssues.slice(0, 3), // Show top 3 for preview
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

  // --- Actionable Insights Logic (Renamed to Insights) ---
  const insights = useMemo(() => {
    const generatedInsights: { message: string; type: 'info' | 'warning' | 'critical'; link?: string }[] = [];

    // Example 1: Overdue tickets for a specific company (e.g., the one selected for map)
    if (selectedCompanyForMap) {
      const overdueForCompany = tickets.filter(t =>
        t.cf_company === selectedCompanyForMap &&
        t.due_by && isPast(parseISO(t.due_by)) &&
        t.status.toLowerCase() !== 'resolved' && t.status.toLowerCase() !== 'closed'
      );
      const urgentOverdueForCompany = overdueForCompany.filter(t => t.priority.toLowerCase() === 'urgent').length;

      if (overdueForCompany.length > 0) {
        generatedInsights.push({
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
      generatedInsights.push({
        message: `${highestBacklogCompany} has the highest open backlog (${maxBacklog} tickets).`,
        type: maxBacklog > 20 ? 'critical' : 'warning',
        link: `/customer360?customer=${encodeURIComponent(highestBacklogCompany)}`,
      });
    }

    return generatedInsights;
  }, [tickets, selectedCompanyForMap, now]);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="p-6 pb-4 bg-background border-b border-border shadow-sm">
          <SheetTitle className="text-2xl font-bold flex items-center gap-2">
            <SlidersHorizontal className="h-6 w-6 text-primary" /> Dashboard Insights
          </SheetTitle>
          <SheetDescription>
            Quick overview of critical metrics, escalations, and recurring issues.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-grow p-4 space-y-6">
          {/* Escalation Radar Card */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-4 w-4" /> Escalation Radar
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <div>
                <h4 className="font-medium flex items-center gap-1 mb-1">
                  <BellRing className="h-3 w-3 text-orange-500" /> Auto-Escalation Candidates ({escalationRadar.totalAutoEscalationCandidates}):
                </h4>
                {escalationRadar.autoEscalationCandidates.length > 0 ? (
                  <ul className="space-y-0.5">
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
                    className="mt-1 w-full justify-center text-blue-600 dark:text-blue-400"
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
                  <Clock className="h-3 w-3 text-yellow-500" /> Stuck Tickets (No update &gt; 24h) ({escalationRadar.totalStuckTickets}):
                </h4>
                {escalationRadar.stuckTickets.length > 0 ? (
                  <ul className="space-y-0.5">
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
                    className="mt-1 w-full justify-center text-blue-600 dark:text-blue-400"
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

          {/* Top SLA Breaches Card */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-red-600 dark:text-red-400">
                <CalendarX className="h-4 w-4" /> Top SLA Breaches ({topSlaBreaches.totalBreaches}):
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              {topSlaBreaches.breachesPreview.length > 0 ? (
                <ul className="space-y-0.5">
                  {topSlaBreaches.breachesPreview.map(ticket => (
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
                <p className="text-muted-foreground">No SLA breaches currently.</p>
              )}
              {topSlaBreaches.totalBreaches > topSlaBreaches.breachesPreview.length && (
                <Button
                  variant="link"
                  size="sm"
                  className="mt-1 w-full justify-center text-blue-600 dark:text-blue-400"
                  onClick={() => onOpenFilteredTicketsModal(
                    "Top SLA Breaches",
                    "Tickets that have breached their Service Level Agreement, sorted by the oldest breach.",
                    topSlaBreaches.allBreachedTickets
                  )}
                >
                  View All ({topSlaBreaches.totalBreaches}) <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Real-time Escalations Card */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-orange-600 dark:text-orange-400">
                <Zap className="h-4 w-4" /> Real-time Escalations ({realTimeEscalations.totalEscalations}):
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              {realTimeEscalations.escalationsPreview.length > 0 ? (
                <ul className="space-y-0.5">
                  {realTimeEscalations.escalationsPreview.map(ticket => (
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
                <p className="text-muted-foreground">No recent escalations.</p>
              )}
              {realTimeEscalations.totalEscalations > realTimeEscalations.escalationsPreview.length && (
                <Button
                  variant="link"
                  size="sm"
                  className="mt-1 w-full justify-center text-blue-600 dark:text-blue-400"
                  onClick={() => onOpenFilteredTicketsModal(
                    "Real-time Escalations",
                    "Tickets that have recently been escalated or marked as urgent.",
                    realTimeEscalations.allEscalatedTickets
                  )}
                >
                  View All ({realTimeEscalations.totalEscalations}) <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Recurring Issues Card */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Repeat className="h-4 w-4" /> Recurring Issues ({recurringIssues.totalRecurringIssues}):
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              {recurringIssues.recurringIssuesPreview.length > 0 ? (
                <ul className="space-y-0.5">
                  {recurringIssues.recurringIssuesPreview.map((issue, index) => (
                    <li key={index} className="flex justify-between items-center p-1 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="truncate text-foreground">{issue.tickets[0].subject}</span>
                        </TooltipTrigger>
                        <TooltipContent>{issue.tickets[0].subject}</TooltipContent>
                      </Tooltip>
                      <Badge variant="secondary" className="ml-2 text-xs">{issue.count} times</Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No significant recurring issues detected.</p>
              )}
              {recurringIssues.totalRecurringIssues > recurringIssues.recurringIssuesPreview.length && (
                <Button
                  variant="link"
                  size="sm"
                  className="mt-1 w-full justify-center text-blue-600 dark:text-blue-400"
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

          {/* Insights Card (formerly Actionable Insights) */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-green-600 dark:text-green-400">
                <Lightbulb className="h-4 w-4" /> Insights ({insights.length}):
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              {insights.length > 0 ? (
                <ul className="space-y-1">
                  {insights.slice(0, 3).map((insight, index) => ( // Show top 3 insights
                    <li key={index} className={cn(
                      "p-2 rounded-md border",
                      insight.type === 'critical' && "bg-red-50/50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200",
                      insight.type === 'warning' && "bg-yellow-50/50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200",
                      insight.type === 'info' && "bg-blue-50/50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200",
                    )}>
                      <div className="flex items-start gap-1">
                        <Info className="h-3 w-3 flex-shrink-0 mt-0.5" />
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
              {insights.length > 3 && (
                <Button
                  variant="link"
                  size="sm"
                  className="mt-1 w-full justify-center text-blue-600 dark:text-blue-400"
                  onClick={() => onOpenFilteredTicketsModal(
                    "Actionable Insights",
                    "Key observations and recommendations based on your support data.",
                    // For insights, we'd need a way to convert insights back to tickets or have a generic insight modal.
                    // For now, I'll pass an empty array or a placeholder.
                    []
                  )}
                >
                  View All ({insights.length}) <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Assignment Changes Feed (Placeholder) */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-purple-600 dark:text-purple-400">
                <GitFork className="h-4 w-4" /> Assignment Changes Feed
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <p className="text-muted-foreground">
                This feed would show recent changes in ticket assignments (e.g., "Ticket #123 assigned to John Doe").
                Full implementation requires a dedicated historical log of assignment changes, which is not available in the current `freshdesk_tickets` table.
              </p>
              <Button variant="link" size="sm" className="mt-1 w-full justify-center text-blue-600 dark:text-blue-400" disabled>
                Learn More <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </CardContent>
          </Card>

          {/* Customer Escalation Map (Kept as is, but adjusted styling for consistency) */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-purple-600 dark:text-purple-400">
                <Users className="h-4 w-4" /> Customer Escalation Map
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              {selectedCompanyForMap ? (
                customerEscalationMap ? (
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">{customerEscalationMap.company}</p>
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
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default DashboardInsightsOverlay;