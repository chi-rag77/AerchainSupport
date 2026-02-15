"use client";

import React, { useState, useEffect } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import { useTickets } from "@/features/tickets/hooks/useTickets";
import { useQueueState } from "@/features/queue/hooks/useQueueState";
import QueueCommandBar from "@/features/queue/components/QueueCommandBar";
import AIPriorityStrip from "@/features/queue/components/AIPriorityStrip";
import TicketRow from "@/features/queue/components/TicketRow";
import BulkActionBar from "@/features/queue/components/BulkActionBar";
import TicketDetailModal from "@/components/TicketDetailModal";
import DashboardMetricCardV2 from "@/components/DashboardMetricCardV2";
import { 
  Table, TableBody, TableHead, TableHeader, TableRow, TableCell
} from "@/components/ui/table";
import { 
  TicketIcon, Hourglass, Bug, Clock, ShieldAlert, 
  Loader2, LayoutDashboard, SlidersHorizontal, ChevronLeft, ChevronRight,
  ArrowUpDown, Activity, AlertTriangle, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const TicketsPage = () => {
  const { session } = useSupabase();
  const user = session?.user;
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const queueState = useQueueState();
  
  const { 
    tickets, 
    isLoading, 
    isFetching, 
    metrics, 
    queryKey 
  } = useTickets({
    searchTerm,
    status: "All",
    priority: "All",
    assignees: [],
    companies: [],
    types: [],
    dependencies: [],
    myTickets: false,
    highPriority: false,
    slaBreached: false,
    dateField: 'created_at',
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleSync = async () => {
    toast.loading("Syncing Freshdesk...", { id: "sync-queue" });
    try {
      const { error } = await supabase.functions.invoke('fetch-freshdesk-tickets', {
        method: 'POST',
        body: { action: 'syncTickets', user_id: user?.id },
      });
      if (error) throw error;
      toast.success("Queue updated!", { id: "sync-queue" });
      queryClient.invalidateQueries({ queryKey });
    } catch (err: any) {
      toast.error(`Sync failed: ${err.message}`, { id: "sync-queue" });
    }
  };

  const criticalTickets = tickets.filter(t => t.priority.toLowerCase() === 'urgent' || t.status.toLowerCase() === 'escalated');
  const nearBreachCount = tickets.filter(t => t.riskScore > 70).length;
  
  const totalPages = Math.ceil(tickets.length / itemsPerPage);
  const paginatedTickets = tickets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex-1 flex flex-col p-8 space-y-6 bg-[#F6F8FB] dark:bg-gray-950 min-h-screen overflow-hidden">
      {/* Section 1: Command Bar */}
      <QueueCommandBar 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        viewMode={queueState.viewMode}
        onViewModeChange={queueState.setViewMode}
        onOpenFilters={() => setIsFilterOpen(true)}
        activeFilterCount={0}
        isSyncing={isFetching}
        onSync={handleSync}
      />

      {/* Section 2: Intelligence Snapshot (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardMetricCardV2 
          title="Active Queue"
          value={metrics.totalActiveTickets}
          icon={TicketIcon}
          archetype="volume"
          subtext="Total tickets in progress"
          onClick={() => {}}
        />
        <DashboardMetricCardV2 
          title="SLA Risk"
          value={criticalTickets.length}
          icon={ShieldAlert}
          archetype="attention"
          subtext="Tickets near breach"
          onClick={() => {}}
        />
        <DashboardMetricCardV2 
          title="Open Backlog"
          value={metrics.openTicketsSpecific}
          icon={Clock}
          archetype="health"
          subtext="Awaiting initial response"
          onClick={() => {}}
        />
        <DashboardMetricCardV2 
          title="Bug Reports"
          value={metrics.bugsReceivedOverall}
          icon={Bug}
          archetype="volume"
          subtext="Technical issues reported"
          onClick={() => {}}
        />
      </div>

      {/* Section 3: AI Priority Strip */}
      <AIPriorityStrip 
        criticalCount={criticalTickets.length}
        onViewCritical={() => setSearchTerm("urgent")}
        onSmartReassign={() => toast.info("AI is calculating optimal workload distribution...")}
      />

      {/* Section 4: Queue Health Strip */}
      <div className="flex items-center justify-between px-6 py-3 bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-white/20 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-indigo-600" />
            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Queue Health:</span>
            <Badge className="bg-green-500 text-white border-none font-bold text-[10px]">Stable</Badge>
          </div>
          <div className="h-4 w-px bg-gray-200 dark:bg-gray-800" />
          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
            <span className="flex items-center gap-1.5 text-red-600"><AlertTriangle className="h-3 w-3" /> {criticalTickets.length} Critical</span>
            <span className="flex items-center gap-1.5 text-orange-600"><Clock className="h-3 w-3" /> {nearBreachCount} Near SLA</span>
            <span className="flex items-center gap-1.5 text-indigo-600"><CheckCircle2 className="h-3 w-3" /> {metrics.totalActiveTickets} Active</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Sort by:</span>
          <Badge variant="outline" className="bg-white dark:bg-gray-800 border-none shadow-sm font-bold text-[10px] cursor-pointer hover:bg-gray-50">Risk Score</Badge>
        </div>
      </div>

      {/* Section 5: Ticket Workspace (Sticky Header + Scroll Body) */}
      <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-gray-900 rounded-[28px] shadow-glass border border-white/20 dark:border-gray-800/30 overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
            <p className="text-lg font-medium">Loading Intelligence Workspace...</p>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Fixed Header */}
            <div className="z-20 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-700">
              <Table>
                <TableHeader>
                  <TableRow className="border-none hover:bg-transparent">
                    <TableHead className="w-12 pl-6"></TableHead>
                    <TableHead className="w-24 font-bold text-[10px] uppercase tracking-widest sticky left-0 bg-inherit">Code</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-widest">
                      <div className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors">
                        Subject & Context <ArrowUpDown className="h-3 w-3 opacity-50" />
                      </div>
                    </TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-widest">Status</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-widest text-right sticky right-0 bg-inherit">
                      <div className="flex items-center justify-end gap-1 cursor-pointer hover:text-primary transition-colors">
                        Risk & Urgency <ArrowUpDown className="h-3 w-3 opacity-50" />
                      </div>
                    </TableHead>
                    <TableHead className="w-40 pr-6"></TableHead>
                  </TableRow>
                </TableHeader>
              </Table>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <Table>
                <TableBody>
                  {paginatedTickets.map((ticket) => (
                    <TicketRow 
                      key={ticket.id}
                      ticket={ticket}
                      isSelected={queueState.selectedTicketIds.includes(ticket.id)}
                      onToggleSelect={() => queueState.toggleSelection(ticket.id)}
                      onClick={() => { setSelectedTicket(ticket); }}
                      viewMode={queueState.viewMode}
                    />
                  ))}
                  {paginatedTickets.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-64 text-center text-muted-foreground italic">
                        No tickets found matching your criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      {/* Section 6: Pagination & Bulk Actions */}
      <div className="flex items-center justify-between px-4 py-2 bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-white/20">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, tickets.length)} of {tickets.length}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="rounded-xl h-9 w-9 p-0 hover:bg-white dark:hover:bg-gray-800 shadow-sm"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum = i + 1;
              if (totalPages > 5 && currentPage > 3) {
                pageNum = currentPage - 3 + i + 1;
                if (pageNum > totalPages) pageNum = totalPages - (4 - i);
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className={cn(
                    "h-9 w-9 rounded-xl font-bold text-xs",
                    currentPage === pageNum ? "bg-indigo-600 shadow-lg shadow-indigo-500/20 text-white" : "hover:bg-white dark:hover:bg-gray-800"
                  )}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="rounded-xl h-9 w-9 p-0 hover:bg-white dark:hover:bg-gray-800 shadow-sm"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <BulkActionBar 
        selectedCount={queueState.selectedTicketIds.length}
        onClear={queueState.clearSelection}
        onAction={(type) => toast.success(`Bulk ${type} initiated for ${queueState.selectedTicketIds.length} tickets.`)}
      />

      <TicketDetailModal 
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        ticket={selectedTicket}
      />

      <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-indigo-600" />
              Advanced Filters
            </SheetTitle>
            <SheetDescription>Refine your operational view.</SheetDescription>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-120px)] mt-6">
            <div className="p-4 text-center text-muted-foreground italic">
              Filter components would be rendered here.
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default TicketsPage;