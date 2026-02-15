"use client";

import React, { useState } from "react";
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
  Table, TableBody, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  TicketIcon, Hourglass, Bug, Clock, ShieldAlert, 
  Loader2, LayoutDashboard, SlidersHorizontal 
} from "lucide-react";
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

const TicketsPage = () => {
  const { session } = useSupabase();
  const user = session?.user;
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

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

  return (
    <div className="flex-1 flex flex-col p-8 space-y-8 bg-[#F6F8FB] dark:bg-gray-950 min-h-screen overflow-y-auto">
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

      {/* Section 4: Ticket Workspace */}
      <div className="bg-white dark:bg-gray-900 rounded-[28px] shadow-glass border border-white/20 dark:border-gray-800/30 overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
            <p className="text-lg font-medium">Loading Intelligence Workspace...</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-gray-50/50 dark:bg-gray-800/50">
              <TableRow className="border-none">
                <TableHead className="w-12 pl-6"></TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-widest">Code</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-widest">Subject & Context</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-widest">Status</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-widest text-right">Risk & Age</TableHead>
                <TableHead className="w-24 pr-6"></TableHead>
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