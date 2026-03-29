"use client";

import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { KPIMetric, KPIInsight } from '@/features/dashboard/types';
import { cn } from '@/lib/utils';
import { 
  ArrowUpRight, ArrowDownRight, Ticket, Clock, 
  CheckCircle2, Bug, Brain, Sparkles, Target,
  ShieldAlert, TrendingUp, Search, UserPlus,
  ChevronDown, ChevronUp, Info, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface SmartKPICardProps {
  metric: KPIMetric;
  isExpanded: boolean;
  onToggle: () => void;
  canManage: boolean;
}

const SmartKPICard = ({ metric, isExpanded, onToggle, canManage }: SmartKPICardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const getArchetypeConfig = (archetype: KPIMetric['archetype']) => {
    switch (archetype) {
      case 'volume':
        return {
          icon: Ticket,
          color: "text-blue-600",
          bg: "bg-blue-50 dark:bg-blue-900/20",
          chartColor: "#3b82f6",
          accent: "border-blue-100 dark:border-blue-900/50"
        };
      case 'backlog':
        return {
          icon: Clock,
          color: "text-orange-600",
          bg: "bg-orange-50 dark:bg-orange-900/20",
          chartColor: "#f97316",
          accent: "border-orange-100 dark:border-orange-900/50"
        };
      case 'resolved':
        return {
          icon: CheckCircle2,
          color: "text-green-600",
          bg: "bg-green-50 dark:bg-green-900/20",
          chartColor: "#10b981",
          accent: "border-green-100 dark:border-green-900/50"
        };
      case 'attention':
        return {
          icon: Bug,
          color: "text-red-600",
          bg: "bg-red-50 dark:bg-red-900/20",
          chartColor: "#ef4444",
          accent: "border-red-100 dark:border-red-900/50"
        };
    }
  };

  const config = getArchetypeConfig(metric.archetype);
  const Icon = config.icon;
  const isPositiveTrend = metric.trend > 0;
  const isTrendGood = (metric.archetype === 'backlog' || metric.archetype === 'attention') 
    ? !isPositiveTrend 
    : isPositiveTrend;

  return (
    <motion.div
      layout
      initial={false}
      animate={{ 
        scale: isExpanded ? 1.02 : 1,
        zIndex: isExpanded ? 20 : 1
      }}
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card 
        className={cn(
          "group relative overflow-hidden rounded-[24px] border transition-all duration-500 cursor-pointer",
          isExpanded 
            ? "bg-white dark:bg-gray-900 shadow-2xl border-indigo-200 dark:border-indigo-800" 
            : "bg-white dark:bg-gray-900 shadow-sm hover:shadow-md border-border",
          !isExpanded && isHovered && "translate-y-[-4px]"
        )}
        onClick={onToggle}
      >
        <CardContent className="p-6 space-y-6">
          {/* 1. Collapsed Header */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className={cn("p-2.5 rounded-xl shadow-sm", config.bg, config.color)}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-black tracking-tight text-foreground/80 uppercase">
                  {metric.title}
                </h4>
                {metric.status_label && (
                  <Badge variant="secondary" className="h-5 px-2 text-[8px] font-black uppercase tracking-widest bg-amber-50 text-amber-700 border-none">
                    <AlertTriangle className="h-2.5 w-2.5 mr-1" /> {metric.status_label}
                  </Badge>
                )}
              </div>
            </div>
            <div className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-tight border",
              isTrendGood 
                ? "bg-green-50 text-green-700 border-green-100" 
                : "bg-red-50 text-red-700 border-red-100"
            )}>
              {isPositiveTrend ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(metric.trend)}%
            </div>
          </div>

          {/* 2. Main Metric & Sparkline */}
          <div className="space-y-4">
            <div className="flex items-baseline gap-2">
              <div className="text-4xl font-black tracking-tighter text-foreground">
                {typeof metric.value === 'number' ? (
                  <CountUp end={metric.value} duration={2} separator="," />
                ) : metric.value}
              </div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                {metric.microInsight}
              </span>
            </div>

            {/* Progress Bar for Performance Archetype */}
            {metric.archetype === 'resolved' && metric.insights?.target && (
              <div className="space-y-2">
                <Progress value={metric.insights.current_progress} className="h-2 bg-gray-100" indicatorClassName="bg-green-500" />
                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                  <span>Target: {metric.insights.target}</span>
                  <span className="text-red-500">-12% behind target</span>
                </div>
              </div>
            )}

            <div className="h-12 w-full -mx-2 opacity-40 group-hover:opacity-100 transition-opacity">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metric.sparklineData}>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={config.chartColor}
                    strokeWidth={2}
                    fill={config.chartColor}
                    fillOpacity={0.1}
                    isAnimationActive={true}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3. Peek State (Hover Insight) */}
          <AnimatePresence>
            {!isExpanded && isHovered && metric.insights && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="pt-4 border-t border-gray-50 dark:border-gray-800"
              >
                <div className="flex items-start gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 leading-relaxed">
                    {metric.insights.insight}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 4. Expanded State (Deep Intelligence) */}
          <AnimatePresence>
            {isExpanded && metric.insights && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden pt-6 space-y-6 border-t border-gray-100 dark:border-gray-800"
              >
                {/* AI Insight Section */}
                <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-indigo-600" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">AI Root Cause</span>
                    </div>
                    <span className="text-[9px] font-bold text-indigo-400 uppercase">{metric.insights.confidence}% Confidence</span>
                  </div>
                  <p className="text-xs font-bold leading-relaxed text-foreground/80">
                    {metric.insights.insight}
                  </p>
                </div>

                {/* Impact & Prediction Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {metric.insights.impact && (
                    <div className="space-y-3">
                      <h5 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Impacted Accounts</h5>
                      <div className="space-y-2">
                        {metric.insights.impact.map((item, i) => (
                          <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-border/50">
                            <span className="text-[10px] font-bold truncate max-w-[80px]">{item.name}</span>
                            <div className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              item.risk === 'high' ? "bg-red-500" : "bg-amber-500"
                            )} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {metric.insights.prediction && (
                    <div className="space-y-3">
                      <h5 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Prediction</h5>
                      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/50">
                        <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 leading-tight">
                          {metric.insights.prediction}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions Row */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {metric.insights.actions.map((action, i) => (
                    <Button
                      key={i}
                      size="sm"
                      disabled={!canManage}
                      className={cn(
                        "flex-1 h-9 rounded-xl font-black text-[9px] uppercase tracking-widest gap-2 shadow-sm transition-all active:scale-95",
                        action.type === 'primary' 
                          ? "bg-indigo-600 hover:bg-indigo-700 text-white" 
                          : "bg-gray-100 dark:bg-gray-800 text-foreground hover:bg-gray-200"
                      )}
                    >
                      {action.type === 'primary' ? <Search className="h-3 w-3" /> : <Target className="h-3 w-3" />}
                      {action.label}
                    </Button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Expand/Collapse Indicator */}
          <div className="flex justify-center pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SmartKPICard;