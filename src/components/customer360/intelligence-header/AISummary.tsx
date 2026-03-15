"use client";

import React, { useState } from 'react';
import { 
  Brain, Sparkles, AlertCircle, Zap, List, Eye, 
  Ticket, User, Bell, ChevronDown, ChevronUp, 
  Bug, HelpCircle, Settings, ShieldAlert, ArrowRight,
  MessageSquare, Info, BookOpen, Code
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import { AISummary as AISummaryType } from '@/features/customer360/types';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface AISummaryProps {
  summary: AISummaryType;
  confidence: number;
  explainability: string;
}

const AISummary = ({ summary, confidence, explainability }: AISummaryProps) => {
  const [isReasoningOpen, setIsReasoningOpen] = useState(false);

  if (!summary) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center px-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-xl font-black tracking-tight">AI Operational Insights</h3>
        </div>
        <div className="text-right">
          <Badge variant="outline" className="bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800 font-bold text-indigo-600 dark:text-indigo-400">
            <Sparkles className="h-3 w-3 mr-1.5" />
            {confidence}% Confidence
          </Badge>
          <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest font-bold">{explainability}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10">
        
        {/* SECTION 1: Root Issue Detected */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <ShieldAlert className="h-5 w-5" />
            <h4 className="text-xs font-black uppercase tracking-[0.2em]">Section 1 — Root Issue Detected</h4>
          </div>
          
          <div className="p-6 rounded-[24px] bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5">
              <ShieldAlert className="h-24 w-24" />
            </div>
            <div className="relative z-10 space-y-4">
              <div className="space-y-1">
                <h5 className="text-2xl font-black tracking-tight text-red-700 dark:text-red-400">🚨 Root Issue Detected</h5>
                <p className="text-lg font-bold leading-tight">
                  The <span className="text-red-600">{summary.root_issue.module} module</span> is generating {summary.root_issue.percentage}% of total support tickets.
                </p>
              </div>
              <p className="text-sm font-medium text-muted-foreground leading-relaxed max-w-2xl">
                {summary.root_issue.description}
              </p>
              <div className="pt-4 border-t border-red-100 dark:border-red-900/50">
                <p className="text-xs font-black uppercase tracking-widest text-red-600/70 italic">
                  Insight: {summary.root_issue.insight}
                </p>
              </div>
            </div>
          </div>
        </section>

        <Separator className="opacity-50" />

        {/* SECTION 2: Ticket Composition */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <List className="h-5 w-5" />
            <h4 className="text-xs font-black uppercase tracking-[0.2em]">Section 2 — Ticket Composition</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 p-8 rounded-[24px] bg-white dark:bg-gray-800 shadow-glass border border-border/50 space-y-8">
              <h5 className="text-lg font-black tracking-tight">Ticket Composition ({summary.root_issue.module} Module)</h5>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-red-500">
                    <Bug className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Bugs</span>
                  </div>
                  <div className="text-3xl font-black tracking-tighter">{summary.composition.bugs}%</div>
                  <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500" style={{ width: `${summary.composition.bugs}%` }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-blue-500">
                    <HelpCircle className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Queries</span>
                  </div>
                  <div className="text-3xl font-black tracking-tighter">{summary.composition.queries}%</div>
                  <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${summary.composition.queries}%` }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-amber-500">
                    <Settings className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Config</span>
                  </div>
                  <div className="text-3xl font-black tracking-tighter">{summary.composition.config}%</div>
                  <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500" style={{ width: `${summary.composition.config}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-[24px] bg-indigo-600 text-white shadow-glass-glow flex flex-col justify-center space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-200" />
                <h5 className="text-xs font-black uppercase tracking-widest text-indigo-200">AI Insight</h5>
              </div>
              <p className="text-lg font-bold leading-tight">
                {summary.composition.insight}
              </p>
            </div>
          </div>
        </section>

        <Separator className="opacity-50" />

        {/* SECTION 3: AI Suggested Actions */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <Zap className="h-5 w-5" />
            <h4 className="text-xs font-black uppercase tracking-[0.2em]">Section 3 — AI Suggested Actions</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {summary.suggested_actions.map((action, i) => (
              <Card key={i} className="border-none shadow-sm bg-white dark:bg-gray-800 rounded-[24px] overflow-hidden group hover:shadow-md transition-all">
                <div className={cn(
                  "p-6 space-y-4 border-l-4",
                  action.type === 'engineering' ? "border-l-red-500" : action.type === 'education' ? "border-l-blue-500" : "border-l-amber-500"
                )}>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-xl",
                      action.type === 'engineering' ? "bg-red-50 text-red-600" : action.type === 'education' ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"
                    )}>
                      {action.type === 'engineering' ? <Code className="h-5 w-5" /> : action.type === 'education' ? <BookOpen className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
                    </div>
                    <h5 className="font-black text-lg tracking-tight">{action.title}</h5>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground leading-relaxed">{action.description}</p>
                  <ul className="space-y-2">
                    {action.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs font-bold text-foreground/80">
                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            ))}

            {/* Operational Risk Card */}
            <Card className="border-none shadow-sm bg-amber-50/50 dark:bg-amber-950/20 rounded-[24px] p-8 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-amber-600">
                  <ShieldAlert className="h-5 w-5" />
                  <h5 className="text-xs font-black uppercase tracking-widest">Operational Risk</h5>
                </div>
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black tracking-tighter text-amber-700 dark:text-amber-400">{summary.operational_risk.metric}</span>
                  </div>
                  <p className="text-xs font-bold text-amber-600/70 uppercase tracking-widest">Target: {summary.operational_risk.target}</p>
                </div>
                <p className="text-sm font-medium text-amber-900/80 dark:text-amber-200/80 leading-relaxed">
                  {summary.operational_risk.description}
                </p>
              </div>
              <Badge className="w-fit bg-amber-600 text-white border-none font-black uppercase tracking-widest text-[10px] px-4 py-1 mt-4">
                Risk Level: {summary.operational_risk.level}
              </Badge>
            </Card>
          </div>
        </section>

        <Separator className="opacity-50" />

        {/* SECTION 4: AI Next Moves (Action Buttons) */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <Zap className="h-5 w-5" />
            <h4 className="text-xs font-black uppercase tracking-[0.2em]">Section 4 — AI Next Moves</h4>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button className="h-12 px-8 rounded-full bg-red-600 hover:bg-red-700 text-white font-black gap-2 shadow-lg shadow-red-500/20">
              <Code className="h-4 w-4" /> Create Engineering Incident
            </Button>
            <Button variant="outline" className="h-12 px-8 rounded-full border-2 border-indigo-100 hover:bg-indigo-50 font-black gap-2">
              <BookOpen className="h-4 w-4" /> Generate Knowledge Article
            </Button>
            <Button variant="outline" className="h-12 px-8 rounded-full border-2 border-indigo-100 hover:bg-indigo-50 font-black gap-2">
              <User className="h-4 w-4" /> Send User Walkthrough
            </Button>
            <Button variant="ghost" className="h-12 px-8 rounded-full font-black gap-2 text-indigo-600">
              <Bell className="h-4 w-4" /> Notify Product Manager
            </Button>
          </div>
        </section>

        {/* Gen-Z UX: AI Message Bubble & Expandable Reasoning */}
        <div className="pt-10 space-y-8">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-2xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div className="p-5 rounded-[24px] rounded-tl-none bg-white dark:bg-gray-800 shadow-glass border border-border/50 max-w-2xl">
              <p className="text-xs font-black uppercase tracking-widest text-indigo-600 mb-2">🤖 CineSync AI says:</p>
              <p className="text-base font-bold leading-relaxed text-foreground/90">
                {summary.root_issue.module} module is responsible for most support requests. The issue appears to be related to {summary.root_issue.description.split('.')[0].toLowerCase()}.
              </p>
            </div>
          </div>

          <div className="px-2">
            <button 
              onClick={() => setIsReasoningOpen(!isReasoningOpen)}
              className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-indigo-600 transition-colors"
            >
              Why AI thinks this?
              {isReasoningOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            
            <AnimatePresence>
              {isReasoningOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 p-6 rounded-[24px] bg-gray-50 dark:bg-gray-900/50 border border-dashed border-border space-y-3">
                    {summary.reasoning.map((point, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 shrink-0" />
                        {point}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AISummary;