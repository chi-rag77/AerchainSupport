"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  BarChart3, LineChart, PieChart, Table as TableIcon, 
  LayoutGrid, Zap, ArrowRight, Clock 
} from 'lucide-react';
import { Report } from '@/features/reports/types';
import { motion } from 'framer-motion';

interface ReportCardProps {
  report: Report;
  onClick: () => void;
}

const ReportCard = React.forwardRef<HTMLDivElement, ReportCardProps>(({ report, onClick }, ref) => {
  const Icon = {
    bar: BarChart3,
    line: LineChart,
    pie: PieChart,
    table: TableIcon,
    kpi: Zap,
    treemap: LayoutGrid
  }[report.type];

  const categoryColors = {
    'Customer Health': "bg-emerald-50 text-emerald-700 border-emerald-100",
    'Support Performance': "bg-blue-50 text-blue-700 border-blue-100",
    'Ticket Insights': "bg-indigo-50 text-indigo-700 border-indigo-100",
    'Implementation': "bg-purple-50 text-purple-700 border-purple-100",
    'Executive': "bg-amber-50 text-amber-700 border-amber-100",
  };

  return (
    <motion.div
      ref={ref}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className="group relative overflow-hidden border-none bg-white dark:bg-gray-900 shadow-glass hover:shadow-md transition-all duration-300 rounded-[24px]">
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-muted-foreground group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Icon className="h-5 w-5" />
            </div>
            <Badge variant="outline" className={cn("text-[9px] font-black uppercase tracking-widest border-none", categoryColors[report.category])}>
              {report.category}
            </Badge>
          </div>

          <div className="space-y-1">
            <h4 className="text-base font-black tracking-tight text-foreground group-hover:text-indigo-600 transition-colors">
              {report.title}
            </h4>
            <p className="text-xs font-medium text-muted-foreground line-clamp-2 leading-relaxed">
              {report.description}
            </p>
          </div>

          <div className="pt-4 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">
              <Clock className="h-3 w-3" />
              Last run {report.lastRun || 'Just now'}
            </div>
            <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
              View Report <ArrowRight className="h-3 w-3" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

ReportCard.displayName = "ReportCard";

export default ReportCard;