"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Customer } from "@/types";
import { cn } from "@/lib/utils";
import { Heart, DollarSign, CalendarDays, User, Phone, Mail, MessageSquare, ChevronDown, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format } from 'date-fns';
import { toast } from 'sonner';

interface CustomerCardProps {
  customer: Customer;
}

const CustomerCard = ({ customer }: CustomerCardProps) => {
  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-lime-green";
    if (score >= 60) return "text-yellow-500";
    if (score >= 40) return "text-orange-500";
    return "text-red-500";
  };

  const getSentimentIcon = (sentiment: 'positive' | 'neutral' | 'negative') => {
    switch (sentiment) {
      case 'positive': return <TrendingUp className="h-4 w-4 text-lime-green" />;
      case 'negative': return <TrendingDown className="h-4 w-4 text-hot-pink" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleQuickAction = (action: string) => {
    toast.info(`Initiating ${action} for ${customer.name}`);
    // Implement actual action logic here (e.g., open call modal, prefill ticket)
  };

  return (
    <Card className="relative overflow-hidden bg-midnight-glass backdrop-blur-xl border border-white/10 shadow-glass text-white">
      <div className="absolute inset-0 bg-noise opacity-10 pointer-events-none"></div>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 relative z-10">
        <div className="flex items-center space-x-4">
          <Avatar className="h-14 w-14 border-2 border-neon-blue shadow-lg">
            <AvatarImage src={customer.logoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${customer.name}`} alt={customer.name} />
            <AvatarFallback className="bg-neon-blue/20 text-neon-blue text-lg font-bold">{customer.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
              {customer.name}
              <Badge variant="secondary" className="bg-electric-purple/30 text-electric-purple border border-electric-purple/50 text-xs font-semibold">
                {customer.tier}
              </Badge>
            </CardTitle>
            <p className="text-sm text-gray-300 flex items-center gap-1 mt-1">
              <User className="h-3 w-3" /> Account Manager: {customer.accountManager}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-6">
          {/* Health Ring + Sentiment */}
          <div className="flex flex-col items-center">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <Progress value={customer.healthScore} className="absolute inset-0 w-full h-full rounded-full" indicatorClassName={cn("bg-gradient-to-r from-neon-blue to-electric-purple", getHealthColor(customer.healthScore))} />
              <span className="relative text-lg font-bold text-white">{customer.healthScore}%</span>
            </div>
            <p className={cn("text-xs font-medium mt-1 flex items-center gap-1", getHealthColor(customer.healthScore))}>
              {getSentimentIcon(customer.sentiment)} {customer.sentiment.charAt(0).toUpperCase() + customer.sentiment.slice(1)}
            </p>
          </div>
          {/* Revenue + Renewal */}
          <div className="flex flex-col items-end space-y-1">
            <p className="text-lg font-bold text-white flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-lime-green" /> ARR: ${customer.arr.toLocaleString()}
            </p>
            <p className="text-sm text-gray-300 flex items-center gap-1">
              <CalendarDays className="h-3 w-3" /> Renewal: {format(new Date(customer.renewal), 'MMM dd, yyyy')}
            </p>
          </div>
          {/* Quick Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white shadow-glass-glow">
                Quick Actions <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-midnight-glass backdrop-blur-md border border-white/20 text-white">
              <DropdownMenuItem onClick={() => handleQuickAction("Call")}>
                <Phone className="mr-2 h-4 w-4 text-neon-blue" /> Start Call
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleQuickAction("Email")}>
                <Mail className="mr-2 h-4 w-4 text-lime-green" /> Send Email
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleQuickAction("Create Ticket")}>
                <MessageSquare className="mr-2 h-4 w-4 text-electric-purple" /> Create Ticket
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
    </Card>
  );
};

export default CustomerCard;