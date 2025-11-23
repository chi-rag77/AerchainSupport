"use client";

import React, { useState } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LayoutDashboard, Loader2, MessageSquare, TrendingUp, BarChart3, Users, ShieldAlert, DollarSign, CalendarDays } from "lucide-react";
import HandWaveIcon from "@/components/HandWaveIcon";
import CustomerCard from "@/components/customer360/CustomerCard";
import JourneyTimeline from "@/components/customer360/JourneyTimeline";
import EventCard from "@/components/customer360/EventCard";
import ActionDrawer from "@/components/customer360/ActionDrawer";
import { useQuery } from "@tanstack/react-query";
import { fetchCustomer, fetchCustomerEvents, fetchActionItems } from "@/integrations/customer360/api";
import { Customer, Event, ActionItem } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const Customer360 = () => {
  const { session } = useSupabase();
  const user = session?.user;
  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  // Hardcoded customer ID for now, can be dynamic later
  const customerId = "cust_102";

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEventCardOpen, setIsEventCardOpen] = useState(false);

  const { data: customer, isLoading: isLoadingCustomer, error: customerError } = useQuery<Customer, Error>({
    queryKey: ["customer360", customerId],
    queryFn: () => fetchCustomer(customerId),
  });

  const { data: eventsData, isLoading: isLoadingEvents, error: eventsError } = useQuery({
    queryKey: ["customer360Events", customerId],
    queryFn: () => fetchCustomerEvents(customerId),
  });

  const { data: actionItems, isLoading: isLoadingActions, error: actionsError } = useQuery<ActionItem[], Error>({
    queryKey: ["customer360Actions", customerId],
    queryFn: () => fetchActionItems(customerId),
  });

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsEventCardOpen(true);
  };

  if (isLoadingCustomer || isLoadingEvents || isLoadingActions) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg font-medium">Loading Customer 360° data...</p>
      </div>
    );
  }

  if (customerError || eventsError || actionsError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-red-500">
        <p className="text-xl font-bold mb-2">Error loading data</p>
        <p>{customerError?.message || eventsError?.message || actionsError?.message}</p>
      </div>
    );
  }

  if (!customer || !eventsData || !actionItems) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-muted-foreground">
        <p className="text-xl font-bold mb-2">No data available</p>
        <p>Could not load customer information.</p>
      </div>
    );
  }

  const { events, moodWave } = eventsData;

  return (
    <TooltipProvider>
      <div className="flex-1 flex flex-col p-6 overflow-y-auto bg-gradient-to-br from-gray-900 to-black text-white min-h-screen">
        {/* Top Ribbon: Customer Identity Card */}
        <div className="mb-6">
          <CustomerCard customer={customer} />
        </div>

        {/* Main Area: 2-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 flex-grow">
          {/* Left Column (60% width on desktop) */}
          <div className="lg:col-span-3 flex flex-col space-y-6">
            {/* Dynamic Customer Journey Map */}
            <div className="h-[400px] lg:h-[500px]"> {/* Fixed height for timeline */}
              <JourneyTimeline
                events={events}
                startDate="2025-09-01T00:00:00Z" // Example start date
                endDate="2026-01-31T23:59:59Z"   // Example end date
                moodWave={moodWave}
                onEventClick={handleEventClick}
              />
            </div>

            {/* Ticket Deep Dive Panel (Placeholder for second run) */}
            <Card className="bg-midnight-glass backdrop-blur-xl border border-white/10 shadow-glass text-white flex-grow">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-neon-blue" /> Ticket Deep Dive
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-400">
                <p>This panel will show detailed insights into selected tickets.</p>
                <p className="text-sm mt-2">*(Component `TicketDeepDive` for second run)*</p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column (40% width on desktop) */}
          <div className="lg:col-span-2 flex flex-col space-y-6">
            {/* Agent Action Center */}
            <ActionDrawer actions={actionItems} />

            {/* Escalation Radar card (Placeholder for second run) */}
            <Card className="bg-midnight-glass backdrop-blur-xl border border-white/10 shadow-glass text-white">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-hot-pink" /> Escalation Radar
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-400">
                <p>This card will highlight potential escalations.</p>
                <p className="text-sm mt-2">*(Component `EscalationRadar` for second run)*</p>
              </CardContent>
            </Card>

            {/* Revenue & Growth Insights (Placeholder for second run) */}
            <Card className="bg-midnight-glass backdrop-blur-xl border border-white/10 shadow-glass text-white">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-lime-green" /> Revenue & Growth Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-400">
                <p>This section will display revenue and growth metrics.</p>
                <p className="text-sm mt-2">*(Component `ChurnSimulator` for second run)*</p>
              </CardContent>
            </Card>

            {/* Proactive Alerts list (Placeholder for second run) */}
            <Card className="bg-midnight-glass backdrop-blur-xl border border-white/10 shadow-glass text-white flex-grow">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-electric-purple" /> Proactive Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-400">
                <p>This list will show proactive alerts for the customer.</p>
                <p className="text-sm mt-2">*(Component `ProactiveAlertsList` for second run)*</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer / bottom: Customer DNA panel (Placeholder for second run) */}
        <div className="mt-6">
          <Card className="bg-midnight-glass backdrop-blur-xl border border-white/10 shadow-glass text-white">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-neon-blue" /> Customer DNA
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400">
              <p>This collapsible panel will contain detailed customer DNA information.</p>
              <p className="text-sm mt-2">*(Component `CustomerDNA` for second run)*</p>
            </CardContent>
          </Card>
        </div>

        <EventCard event={selectedEvent} isOpen={isEventCardOpen} onClose={() => setIsEventCardOpen(false)} />
      </div>
    </TooltipProvider>
  );
};

export default Customer360;