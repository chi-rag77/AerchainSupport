"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket } from '@/features/tickets/types';
import { Brain, Sparkles, TicketIcon, CheckCircle2, ListFilter, Table as TableIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

interface DeterministicSummaryProps {
  tickets: Ticket[];
  dateRange: { from?: Date; to?: Date };
  onTriggerAI: () => void;
  isGeneratingAI: boolean;
}

const DeterministicSummary = ({ tickets, dateRange, onTriggerAI, isGeneratingAI }: DeterministicSummaryProps) => {
  const stats = useMemo(() => {
    const total = tickets.length;
    const resolved = tickets.filter(t => ['resolved', 'closed'].includes(t.status.toLowerCase())).length;
    
    const typeMap: Record<string, number> = {};
    tickets.forEach(t => {
      const type = t.type || 'Uncategorized';
      typeMap[type] = (typeMap[type] || 0) + 1;
    });

    const typeBreakdown = Object.entries(typeMap)
      .map(([name, count]) => ({
        name,
        count,
        percent: total > 0 ? Math.round((count / total) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);

    return { total, resolved, typeBreakdown };
  }, [tickets]);

  const dateLabel = dateRange.from && dateRange.to 
    ? `${format(dateRange.from, 'MMM dd')} - ${format(dateRange.to, 'MMM dd, yyyy')}`
    : "Selected Period";

  return (
    <Card className="relative overflow-hidden rounded-[28px] border-none bg-white dark:bg-gray-800 shadow-glass">
      <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="text-xl font-black flex items-center gap-2">
            <ListFilter className="h-5 w-5 text-indigo-500" />
            Operational Gist
          </CardTitle>
          <p className="text-sm font-medium text-muted-foreground">Deterministic summary for {dateLabel}</p>
        </div>
        
        <Button 
          onClick={onTriggerAI} 
          disabled={isGeneratingAI}
          variant="outline"
          className="rounded-full border-indigo-100 bg-indigo-50/50 text-indigo-600 hover:bg-indigo-100 font-bold gap-2 h-10 px-5"
        >
          {isGeneratingAI ? <Sparkles className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
          Deep AI Analysis
        </Button>
      </CardHeader>

      <CardContent className="p-8 pt-0 space-y-8">
        <div className="p-6 rounded-[20px] bg-gray-50 dark:bg-gray-900/50 border border-border">
          <p className="text-lg font-medium leading-relaxed text-foreground">
            During this period, a total of <span className="font-black text-indigo-600">{stats.total} tickets</span> were received. 
            Out of these, <span className="font-black text-green-600">{stats.resolved} tickets</span> have been successfully resolved, 
            while <span className="font-black text-amber-600">{stats.total - stats.resolved}</span> remain in an active or pending state.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <TableIcon className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Ticket Type Distribution</h4>
          </div>
          
          <div className="rounded-2xl border border-border overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50/50 dark:bg-gray-900/50">
                <TableRow>
                  <TableHead className="font-bold text-[10px] uppercase tracking-widest">Category</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase tracking-widest text-center">Volume</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase tracking-widest text-right">Mix %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.typeBreakdown.map((type) => (
                  <TableRow key={type.name} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors">
                    <TableCell className="font-bold text-sm">{type.name}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="font-black">{type.count}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-3">
                        <div className="w-24 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500" style={{ width: `${type.percent}%` }} />
                        </div>
                        <span className="text-xs font-black w-8">{type.percent}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {stats.typeBreakdown.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground italic">
                      No ticket data found for this period.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeterministicSummary;