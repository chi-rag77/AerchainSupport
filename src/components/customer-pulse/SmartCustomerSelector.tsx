"use client";

import React, { useState, useMemo } from 'react';
import { 
  Popover, PopoverContent, PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, Building2, ChevronDown, Star, 
  Clock, ShieldAlert, CheckCircle2, AlertCircle,
  TrendingUp, TrendingDown, Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

interface SmartCustomerSelectorProps {
  selectedCustomer: string;
  onSelect: (name: string) => void;
}

const SmartCustomerSelector = ({ selectedCustomer, onSelect }: SmartCustomerSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [hoveredCustomer, setHoveredCustomer] = useState<string | null>(null);

  const { data: customers = [] } = useQuery({
    queryKey: ['customerPulseList'],
    queryFn: async () => {
      const { data } = await supabase.from('freshdesk_tickets').select('cf_company').limit(1000);
      const unique = Array.from(new Set((data || []).map(t => t.cf_company).filter(Boolean))) as string[];
      // Mocking health data for the preview
      return unique.map(name => ({
        name,
        tickets: Math.floor(Math.random() * 300) + 50,
        resolution: Math.floor(Math.random() * 40) + 50,
        status: (Math.random() > 0.7 ? 'Critical' : Math.random() > 0.4 ? 'Watch' : 'Healthy') as any
      }));
    }
  });

  const filtered = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  const selectedData = customers.find(c => c.name === selectedCustomer);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Healthy': return 'text-green-600 bg-green-50 border-green-100';
      case 'Watch': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'Critical': return 'text-red-600 bg-red-50 border-red-100';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className={cn(
              "h-12 px-6 rounded-2xl border-none bg-white dark:bg-gray-900 shadow-glass hover:shadow-md transition-all gap-4 group",
              selectedData && getStatusColor(selectedData.status).split(' ')[2] // Use border color
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "h-2 w-2 rounded-full animate-pulse",
                selectedData?.status === 'Healthy' ? "bg-green-500" : 
                selectedData?.status === 'Watch' ? "bg-amber-500" : "bg-red-500"
              )} />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Customer:</span>
              <span className="text-sm font-black tracking-tight">{selectedCustomer}</span>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-indigo-600 transition-colors" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-[480px] p-0 rounded-[28px] border-none shadow-2xl overflow-hidden flex" align="start">
          {/* Left: Search & List */}
          <div className="w-64 border-r border-border flex flex-col bg-white dark:bg-gray-950">
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search customers..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-10 bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm font-medium"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto max-h-[400px] p-2 space-y-1">
              <div className="px-3 py-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">All Accounts</span>
              </div>
              {filtered.map(c => (
                <button
                  key={c.name}
                  onClick={() => { onSelect(c.name); setIsOpen(false); }}
                  onMouseEnter={() => setHoveredCustomer(c.name)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-left group",
                    selectedCustomer === c.name ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600" : "hover:bg-gray-50 dark:hover:bg-gray-900"
                  )}
                >
                  <span className="text-sm font-bold truncate">{c.name}</span>
                  <div className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    c.status === 'Healthy' ? "bg-green-500" : c.status === 'Watch' ? "bg-amber-500" : "bg-red-500"
                  )} />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Context Preview */}
          <div className="flex-1 bg-gray-50/50 dark:bg-gray-900/50 p-6 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {hoveredCustomer ? (
                <motion.div
                  key={hoveredCustomer}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-6"
                >
                  {(() => {
                    const c = customers.find(cust => cust.name === hoveredCustomer)!;
                    return (
                      <>
                        <div className="space-y-1">
                          <h4 className="text-xl font-black tracking-tight">{c.name}</h4>
                          <Badge className={cn("font-black uppercase tracking-widest text-[9px] border-none", getStatusColor(c.status))}>
                            {c.status} Status
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Tickets</span>
                            <p className="text-lg font-black">{c.tickets}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Resolution</span>
                            <p className="text-lg font-black text-indigo-600">{c.resolution}%</p>
                          </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-border/50">
                          <div className="flex items-center gap-2 text-amber-600 mb-2">
                            <Target className="h-4 w-4" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Quick Insight</span>
                          </div>
                          <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                            {c.status === 'Critical' ? "High volume of recurring invoice issues detected." : "Operational metrics are within expected thresholds."}
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center space-y-3 opacity-30">
                  <Target className="h-10 w-10" />
                  <p className="text-xs font-bold uppercase tracking-widest">Hover to preview context</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </PopoverContent>
      </Popover>

      {/* Week Selector (Simplified for now) */}
      <Button variant="outline" className="h-12 px-6 rounded-2xl border-none bg-white dark:bg-gray-900 shadow-glass gap-3">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Week:</span>
        <span className="text-sm font-black tracking-tight">Mar 11 – Mar 15</span>
      </Button>
    </div>
  );
};

export default SmartCustomerSelector;