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
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const MySpace = () => {
  const { session } = useSupabase();
  const user = session?.user;
  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Sarah Khan';

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

  return (
    <TooltipProvider>
      <div className="flex-1 flex flex-col p-8 space-y-6 bg-[#F6F8FB] dark:bg-gray-950 min-h-screen overflow-y-auto">
        
        {/* Back Link */}
        <div className="flex items-center mb-2">
          <Link to="/" className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-3 w-3" />
            Back to Dashboard
          </Link>
        </div>

        {/* Section 1: Agent Header */}
        <AgentHeader 
          name={fullName}
          title="Senior Support Engineer"
          team="Team Alpha"
          status="online"
        />

        {/* Section 2: AI Briefing */}
        <AIDailyBriefing briefing={intelligence.briefing} />

        {/* Section 3: Recommended Actions */}
        <RecommendedActions 
          actions={intelligence.actions.map((a, i) => ({ ...a, id: `action-${i}`, done: false }))} 
          onToggle={() => {}}
        />

        {/* Section 4 & 5: Stats & Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <QuickStats stats={intelligence.stats} />
          <QueueBreakdown data={intelligence.queue} />
        </div>

        {/* Section 6 & 7: Urgent & Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UrgentTickets tickets={[
            { id: '4521', subject: 'Payment integration failing', customer: 'Acme Corp', hoursOpen: 18, category: 'Technical' },
            { id: '4518', subject: 'API rate limiting errors', customer: 'TechFlow Inc', hoursOpen: 14, category: 'Technical' },
            { id: '4515', subject: 'SSO setup blocking onboarding', customer: 'Global Inc', hoursOpen: 12, category: 'Product' },
          ]} onView={setSelectedTicketId} />
          <CategoryBreakdown categories={[
            { label: 'Technical', count: 5, color: 'bg-indigo-500', percent: 42, trending: 'API rate limiting' },
            { label: 'Product', count: 3, color: 'bg-amber-500', percent: 25, trending: 'Export bug recurring' },
            { label: 'Billing', count: 2, color: 'bg-emerald-500', percent: 17 },
            { label: 'Feature Request', count: 1, color: 'bg-blue-500', percent: 8 },
            { label: 'Other', count: 1, color: 'bg-slate-400', percent: 8 },
          ]} />
        </div>

        {/* Section 8: Pending Responses */}
        <PendingResponses tickets={[
          { id: '4510', subject: 'Confirm database migration window', customer: 'DataSync Ltd', waitDuration: '6h', priority: 'Medium', needsFollowUp: false },
          { id: '4508', subject: 'Provide error logs for debugging', customer: 'CloudOps Inc', waitDuration: '8h', priority: 'High', needsFollowUp: true },
          { id: '4505', subject: 'Confirm new password reset procedure', customer: 'SecureNet', waitDuration: '12h', priority: 'Low', needsFollowUp: true, autoRemind: true },
        ]} onView={setSelectedTicketId} />

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