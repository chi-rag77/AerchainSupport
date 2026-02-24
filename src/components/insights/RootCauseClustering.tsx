"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { IssueCluster } from '@/features/insights/types';
import { AlertCircle, ArrowRight, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const RootCauseClustering = ({ clusters }: { clusters: IssueCluster[] }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
          <Target className="h-5 w-5 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-xl font-black tracking-tight">AI Root Cause Engine</h3>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {clusters.map((cluster) => (
          <motion.div key={cluster.id} whileHover={{ x: 4 }}>
            <Card className={cn(
              "border-none shadow-sm rounded-[24px] overflow-hidden group transition-all",
              cluster.severity === 'critical' ? "bg-red-50/50 dark:bg-red-950/20" : "bg-white dark:bg-gray-800"
            )}>
              <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4 flex-1">
                  <div className={cn(
                    "p-3 rounded-2xl shrink-0",
                    cluster.severity === 'critical' ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                  )}>
                    <AlertCircle className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-bold leading-tight">{cluster.topic}</h4>
                      <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-2">
                        {cluster.count} Tickets
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">
                      Root Cause Probability: <span className="text-foreground font-bold">{cluster.rootCauseProbability}%</span> linked to <span className="italic">"{cluster.linkedEvent}"</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Weekly Trend</span>
                    <div className={cn("text-xl font-black", cluster.trend > 0 ? "text-red-500" : "text-green-500")}>
                      +{cluster.trend}%
                    </div>
                  </div>
                  <Button className="rounded-full h-12 w-12 p-0 bg-gray-100 dark:bg-gray-700 text-foreground hover:bg-indigo-600 hover:text-white transition-all">
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RootCauseClustering;