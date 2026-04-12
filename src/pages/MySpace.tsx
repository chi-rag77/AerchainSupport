"use client";

import React, { useState, useMemo } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAgentIntelligence } from "@/features/myspace/hooks/useAgentIntelligence";
import AgentHeader from "@/components/myspace/AgentHeader";
import AIDailyBriefing from "@/components/myspace/AIDailyBriefing";
import RecommendedActions from "@/components/myspace/RecommendedActions";
import QuickStats from "@/components/myspace/QuickStats";
import QueueBreakdown from "@/components/myspace/QueueBreakdown";
import UrgentTickets from "@/components/myspace/UrgentTickets";
import CategoryBreakdown from "@/components/myspace/CategoryBreakdown";
import PendingResponses from "@/components/myspace/PendingResponses";
import IntelligenceLoader from "@/components/customer-pulse/IntelligenceLoader";
import TicketDetailModal from "@/components/TicketDetailModal";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Ticket } from "@/features/tickets/types";
import { ArrowLeft, User, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const MySpace = () => {
  const { session } = useSupabase();
  
  // Fetch unique agents from the tickets table
  const { data: agents = [] } = useQuery<string[]>({
    queryKey: ['uniqueAgentsList'],
    queryFn: async () => {
      const { data } = await supabase.from('freshdesk_tickets').select('assignee').limit(1000);
      return Array.from(new Set((data || []).map(t => t.assignee).filter(Boolean))) as string[];
    }
  });

  const [selectedAgent, setSelectedAgent] = useState<string>("Admin User");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const { data: intelligence, isLoading: isIntelLoading } = useAgentIntelligence(selectedAgent);

  // Fetch full ticket details for the modal
  const { data: selectedTicket } = useQuery<Ticket | null>({
    queryKey: ['ticketDetail', selectedTicketId],
    queryFn: async () => {
      if (!selectedTicketId) return null;
      const { data, error } = await supabase
        .from('freshdesk_tickets')
        .select('*')
        .eq('freshdesk_id', selectedTicketId)
        .single();
      if (error) throw error;
      return { ...data, id: data.freshdesk_id } as Ticket;
    },
    enabled: !!selectedTicketId
  });

  if (isIntelLoading && !intelligence) return <IntelligenceLoader />;

  return (
    <TooltipProvider>
      <div className="flex-1 flex flex-col p-8 space-y-6 bg-[#F6F8FB] dark:bg-gray-950 min-h-screen overflow-y-auto">
        
        {/* Header with Agent Selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-3 w-3" />
              Back
            </Link>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Viewing Workspace:</span>
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger className="h-9 w-fit min-w-[180px] border-none bg-white dark:bg-gray-900 shadow-sm rounded-xl text-sm font-bold text-indigo-600 gap-2">
                  <User className="h-4 w-4" />
                  <SelectValue placeholder="Select Agent" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-2xl">
                  {agents.map(agent => (
                    <SelectItem key={agent} value={agent} className="font-medium">{agent}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {intelligence ? (
          <>
            {/* Section 1: Agent Header */}
            <AgentHeader 
              name={selectedAgent}
              title="Support Professional"
              team="Enterprise Support"
              status="online"
              stats={intelligence.stats}
              backlogCount={intelligence.queue.total}
            />

            {/* Section 2: AI Briefing */}
            <AIDailyBriefing briefing={intelligence.briefing} />

            {/* Section 3: Recommended Actions */}
            <RecommendedActions 
              actions={intelligence.actions.map((a: any, i: number) => ({ ...a, id: `action-${i}`, done: false }))} 
              onToggle={(id) => toast.success("Action marked as done!")}
            />

            {/* Section 4 & 5: Stats & Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <QuickStats stats={intelligence.stats} />
              <QueueBreakdown data={intelligence.queue} />
            </div>

            {/* Section 6 & 7: Urgent & Categories */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <UrgentTickets tickets={intelligence.urgentTickets || []} onView={setSelectedTicketId} />
              <CategoryBreakdown 
                categories={intelligence.categories || []} 
              />
            </div>

            {/* Section 8: Pending Responses */}
            <PendingResponses tickets={intelligence.pendingResponses || []} onView={setSelectedTicketId} />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-muted-foreground italic">
            No data found for this agent.
          </div>
        )}

        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30">End of Personal Workspace</p>
        </div>

        <TicketDetailModal 
          isOpen={!!selectedTicketId}
          onClose={() => setSelectedTicketId(null)}
          ticket={selectedTicket}
        />
      </div>
    </TooltipProvider>
  );
};

export default MySpace;