"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket } from '@/types';
import { MessageSquare, PieChart, BarChart } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

import TicketTypeByCustomerChart from "@/components/TicketTypeByCustomerChart";
import PriorityDistributionChart from "@/components/PriorityDistributionChart";

interface CustomerIssueInsightsCardProps {
  customerName: string;
  tickets: Ticket[];
}

const CustomerIssueInsightsCard = ({ customerName, tickets }: CustomerIssueInsightsCardProps) => {
  return (
    <Card className="relative overflow-hidden group transition-all duration-300 hover:shadow-lg hover:scale-[1.02] h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-green-500" /> Issue & Category Insights
        </CardTitle>
        <Badge variant="secondary" className="text-sm font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          {customerName}
        </Badge>
      </CardHeader>
      <CardContent className="text-sm space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[400px]"> {/* Fixed height for charts */}
          <div className="flex flex-col p-3 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
            <h4 className="font-semibold text-foreground mb-2 flex items-center gap-1">
              <BarChart className="h-4 w-4 text-muted-foreground" /> Ticket Type Breakdown
            </h4>
            <div className="flex-grow">
              {tickets.length > 0 ? (
                <TicketTypeByCustomerChart tickets={tickets} selectedCustomer={customerName} topNCustomers={1} />
              ) : (
                <p className="text-center text-muted-foreground py-10">No ticket type data available.</p>
              )}
            </div>
          </div>

          <div className="flex flex-col p-3 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
            <h4 className="font-semibold text-foreground mb-2 flex items-center gap-1">
              <PieChart className="h-4 w-4 text-muted-foreground" /> Priority Distribution
            </h4>
            <div className="flex-grow">
              {tickets.length > 0 ? (
                <PriorityDistributionChart tickets={tickets} />
              ) : (
                <p className="text-center text-muted-foreground py-10">No priority data available.</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerIssueInsightsCard;