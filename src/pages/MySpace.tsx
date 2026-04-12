"use client";

import React, { useState } from "react";
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
import { toast } from "sonner";

const MySpace = () => {
  const { session } = useSupabase();
  const user = session?.user;
  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Agent';

  const { data: intelligence, isLoading: isIntelLoading } = useAgentIntelligence();
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

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

  if (isIntelLoading) return <IntelligenceLoader />;
  if (!intelligence) return null;

  // Mock data for UI sections not fully covered by Edge Function yet
  const urgentTickets = [
    { id: '4521', subject: 'Payment integration failing', customer: 'Acme Corp', hoursOpen: 18, category: 'Technical' },
    { id: '4518', subject: 'API rate limiting', customer: 'TechFlow Inc', hoursOpen: 14, category: 'Technical' },
    { id: '4515', subject: 'SSO setup blocking', customer: 'Global Inc', hoursOpen: 12, category: 'Technical' },
  ];

  const categories = [
    { label: 'Technical', count: 5, color: 'bg-indigo-500', percent: 42 },
    { label: 'Product', count: 3, color: 'bg-blue-500', percent: 25 },
    { label: 'Billing', count: 2, color: 'bg-amber-500', percent: 17 },
    { label: 'Other', count: 2, color: 'bg-gray-400', percent: 16 },
  ];

  const pendingResponses = [
    { id: '4510', subject: 'Confirm database migration window', waitDuration: '6h', priority: 'Medium', needsFollowUp: false },
    { id: '4508', subject: 'Provide error logs for debugging', waitDuration: '8h', priority: 'High', needsFollowUp: false },
    { id: '4505', subject: 'Confirm new password reset procedure', waitDuration: '12h', priority: 'Low', needsFollowUp: true },
  ];

  return (
    <TooltipProvider>
      <div className="flex-1 flex flex-col p-6 space-y-6 bg-[#F6F8FB] dark:bg-gray-950 min-h-screen overflow-y-auto">
        
        {/* Section 1: Header - Compact */}
        <AgentHeader 
          name={fullName}
          title="Senior Support Engineer"
          team="Enterprise Support A"
          status="online"
        />

        {/* Section 2: AI Briefing - High Impact */}
        <AIDailyBriefing briefing={intelligence.briefing} />

        {/* Section 3: Recommended Actions - High Density */}
        <RecommendedActions 
          actions={intelligence.actions.map((a, i) => ({ ...a, id: `action-${i}`, done: false }))} 
          onToggle={(id) => toast.success("Action marked as done!")}
        />

        {/* Section 4 & 5: Stats & Breakdown - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <QuickStats stats={intelligence.stats} />
          <QueueBreakdown data={intelligence.queue} />
        </div>

        {/* Section 6 & 7: Urgent & Categories - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UrgentTickets tickets={urgentTickets} onView={setSelectedTicketId} />
          <CategoryBreakdown categories={categories} trendingIssue="Recurring timeout in RFQ module" />
        </div>

        {/* Section 8: Pending Responses - Full Width */}
        <PendingResponses tickets={pendingResponses} onView={setSelectedTicketId} />

        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
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