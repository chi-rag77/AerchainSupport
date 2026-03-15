"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Ticket, ArrowRight, TrendingUp, TrendingDown, Clock, Search } from 'lucide-react';
import { formatDistanceToNowStrict, parseISO } from 'date-fns';
import { IssueCluster } from '@/features/customer360/types';

interface IssueClustersProps {
  clusters: IssueCluster[];
  onInvestigate: (cluster: IssueCluster) => void;
}

const IssueClusters = ({ clusters, onInvestigate }: IssueClustersProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {clusters.map((cluster, idx) => (
        <motion.div
          key={cluster.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          <Card className="group relative overflow-hidden border-none bg-white dark:bg-gray-800 shadow-glass hover:shadow-glass-glow transition-all duration-500 rounded-[28px]">
            <CardContent className="p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                  <Ticket className="h-6 w-6" />
                </div>
                <Badge variant="outline" className={cn(
                  "text-[10px] font-black uppercase tracking-widest border-2",
                  cluster.trend === 'worsening' ? "text-red-600 border-red-100" : "text-green-600 border-green-100"
                )}>
                  {cluster.trend === 'worsening' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {cluster.trend}
                </Badge>
              </div>

              <div className="space-y-1">
                <h4 className="text-xl font-black tracking-tight group-hover:text-indigo-600 transition-colors">
                  {cluster.name}
                </h4>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black tracking-tighter">{cluster.ticketCount}</span>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Tickets</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                <Clock className="h-3 w-3" />
                Last seen {formatDistanceToNowStrict(parseISO(cluster.lastSeen))} ago
              </div>

              <Button 
                onClick={() => onInvestigate(cluster)}
                className="w-full h-12 rounded-2xl bg-gray-50 dark:bg-gray-900 text-foreground hover:bg-indigo-600 hover:text-white font-bold gap-2 transition-all shadow-sm"
              >
                <Search className="h-4 w-4" />
                Investigate
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default IssueClusters;