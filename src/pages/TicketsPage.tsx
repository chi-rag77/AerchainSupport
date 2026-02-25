"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import { useTickets } from "@/features/tickets/hooks/useTickets";
import { useQueueState } from "@/features/queue/hooks/useQueueState";
import QueueCommandBar from "@/features/queue/components/QueueCommandBar";
import TicketRow from "@/features/queue/components/TicketRow";
import CompactTicketCard from "@/features/queue/components/CompactTicketCard";
import KanbanBoard from "@/features/queue/components/KanbanBoard";
import BulkActionBar from "@/features/queue/components/BulkActionBar";
import QueueFilters from "@/features/queue/components/QueueFilters";
import TicketDetailModal from "@/components/TicketDetailModal";
import DashboardMetricCardV2 from "@/components/DashboardMetricCardV2";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  TicketIcon, Hourglass, Bug, Clock, ShieldAlert, 
  Loader2, LayoutDashboard, SlidersHorizontal, ChevronLeft, ChevronRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { TicketFilters, Ticket } from "@/features/tickets/types";
import { motion, AnimatePresence } from "framer-motion";

const TicketsPage = () => {
  const { session } = useSupabase();
  const user = session?.user;
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [filters, setFilters] = useState<TicketFilters>({
    searchTerm: "",
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

  const queueState = useQueueState();
  
  const { 
    tickets, 
    isLoading, 
    isFetching, 
    metrics, 
    uniqueFilters,
    queryKey 
  } = useTickets({
    ...filters,
    searchTerm,
  }, currentPage);

  // Reset to page 1 when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  const handleSync = async () => {
    toast.loading("Syncing Freshdesk...", { id: "sync-queue" });
    try {
      const { error } = await supabase.functions.invoke('fetch-freshdesk-tickets', {
        method: 'POST',
        body: { action: 'syncTickets', user_id: user?.id },
      });
      if (error) throw error;
      toast.success("Queue updated!", { id: "sync-queue" });
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    } catch (err: any) {
      toast.error(`Sync failed: ${err.message}`, { id: "sync-queue" });
    }
  };

  const handleResetFilters = () => {
    setFilters({
      searchTerm: "",
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
    setSearchTerm("");
    toast.success("Filters reset to default.");
  };

  const activeFilterCount = useMemo(() => {
    return [
      filters.status !== "All",
      filters.priority !== "All",
      filters.assignees.length > 0,
      filters.companies.length > 0,
      filters.types.length > 0,
      filters.dependencies.length > 0,
      filters.myTickets,
      filters.highPriority,
      filters.slaBreached,
    ].filter(Boolean).length;
  }, [filters]);

  const criticalTickets = tickets.filter(t => t.priority.toLowerCase() === 'urgent' || t.status.toLowerCase() === 'escalated');
  
  return (
    <div className="flex-1 flex flex-col p-8 space-y-8 bg-[#F6F8FB] dark:bg-gray-950 min-h-screen overflow-y-auto">
      {/* Section 1: Command Bar */}
      <QueueCommandBar 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        viewMode={queueState.viewMode}
        onViewModeChange={queueState.setViewMode}
        onOpenFilters={() => setIsFilterOpen(true)}
        activeFilterCount={activeFilterCount}
        isSyncing={isFetching}
        onSync={handleSync}
      />

      {/* Section 2: Intelligence Snapshot (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardMetricCardV2 
          title="Active Queue"
          value={metrics?.totalActiveTickets || 0}
          icon={TicketIcon}
          archetype="volume"
          subtext="Total tickets in progress"
          onClick={() => {}}
          isLoading={isLoading}
        />
        <DashboardMetricCardV2 
          title="SLA Risk"
          value={criticalTickets.length}
          icon={ShieldAlert}
          archetype="attention"
          subtext="Tickets near breach"
          onClick={() => {}}
          isLoading={isLoading}
        />
        <DashboardMetricCardV2 
          title="Open Backlog"
          value={metrics?.openTicketsSpecific || 0}
          icon={Clock}
          archetype="health"
          subtext="Awaiting initial response"
          onClick={() => {}}
          isLoading={isLoading}
        />
        <DashboardMetricCardV2 
          title="Bug Reports"
          value={metrics?.bugsReceivedOverall || 0}
          icon={Bug}
          archetype="volume"
          subtext="Technical issues reported"
          onClick={() => {}}
          isLoading={isLoading}
        />
      </div>

      {/* Section 3: Ticket Workspace */}
      <div className="flex flex-col gap-4">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 text-muted-foreground bg-white dark:bg-gray-900 rounded-[28px] shadow-glass border border-white/20"
            >
              <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
              <p className="text-lg font-medium">Loading Intelligence Workspace...</p>
            </motion.div>
          ) : (
            <motion.div
              key={queueState.viewMode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {queueState.viewMode === 'list' && (
                <div className="bg-white dark:bg-gray-900 rounded-[28px] shadow-glass border border-white/20 dark:border-gray-800/30 overflow-hidden">
                  <div className="max-h-[65vh] overflow-y-auto relative">
                    <Table>
                      <TableHeader className="sticky top-0 z-20 shadow-sm">
                        <TableRow className="border-none bg-gray-50 dark:bg-gray-800">
                          <TableHead className="w-12 pl-6 bg-inherit"></TableHead>
                          <TableHead className="font-bold text-[10px] uppercase tracking-widest bg-inherit">Code</TableHead>
                          <TableHead className="font-bold text-[10px] uppercase tracking-widest bg-inherit">Subject & Context</TableHead>
                          <TableHead className="font-bold text-[10px] uppercase tracking-widest bg-inherit">Status</TableHead>
                          <TableHead className="font-bold text-[10px] uppercase tracking-widest text-right bg-inherit">Risk & Age</TableHead>
                          <TableHead className="w-24 pr-6 bg-inherit"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tickets.map((ticket) => (
                          <TicketRow 
                            key={ticket.id}
                            ticket={ticket}
                            isSelected={queueState.selectedTicketIds.includes(ticket.id)}
                            onToggleSelect={() => queueState.toggleSelection(ticket.id)}
                            onClick={() => { setSelectedTicket(ticket); }}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {queueState.viewMode === 'compact' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {tickets.map((ticket) => (
                    <CompactTicketCard 
                      key={ticket.id} 
                      ticket={ticket} 
                      onClick={() => setSelectedTicket(ticket)} 
                    />
                  ))}
                </div>
              )}

              {queueState.viewMode === 'kanban' && (
                <KanbanBoard 
                  tickets={tickets} 
                  onTicketClick={setSelectedTicket} 
                />
              )}

              {tickets.length === 0 && (
                <div className="py-32 text-center text-muted-foreground italic bg-white dark:bg-gray-900 rounded-[28px] border border-dashed">
                  No tickets found matching your criteria.
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination Controls */}
        {queueState.viewMode !== 'kanban' && (
          <div className="flex items-center justify-between px-4 py-2 bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-white/20">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Page {currentPage}
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={tickets.length < itemsPerPage}
                className="rounded-xl h-9 w-9 p-0 hover:bg-white dark:hover:bg-gray-800 shadow-sm"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Section 5: Bulk Actions */}
      <BulkActionBar 
        selectedCount={queueState.selectedTicketIds.length}
        onClear={queueState.clearSelection}
        onAction={(type) => toast.success(`Bulk ${type} initiated for ${queueState.selectedTicketIds.length} tickets.`)}
      />

      {/* Modals & Drawers */}
      <TicketDetailModal 
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        ticket={selectedTicket}
      />

      <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
          <SheetHeader className="p-6 border-b border-border">
            <SheetTitle className="flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-indigo-600" />
              Advanced Filters
            </SheetTitle>
            <SheetDescription>Refine your operational view.</SheetDescription>
          </SheetHeader>
          <ScrollArea className="flex-grow p-6">
            <QueueFilters 
              filters={filters}
              onFilterChange={setFilters}
              uniqueFilters={uniqueFilters}
              onReset={handleResetFilters}
            />
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default TicketsPage;