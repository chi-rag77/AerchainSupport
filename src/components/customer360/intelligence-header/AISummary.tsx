"use client";

import React from 'react';
import { Brain, Sparkles, AlertTriangle, CheckCircle, List, Zap, Eye, Ticket, User, Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AISummary as AISummaryType } from '@/features/customer360/types';

interface AISummaryProps {
  summary: AISummaryType;
  confidence: number;
  explainability: string;
}

const AISummary = ({ summary, confidence, explainability }: AISummaryProps) => {
  const sections = [
    { title: "Status", content: summary.status, icon: AlertTriangle },
    { title: "Key Drivers", content: summary.key_drivers, icon: Zap },
    { title: "Top Issues", content: summary.top_issues, icon: List },
    { title: "Recommended Actions", content: summary.recommended_actions, icon: Eye },
  ];

  return (
    <div className="p-6 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-indigo-600" />
          <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-700 dark:text-indigo-300">
            AI Customer Intelligence
          </h4>
        </div>
        <div className="text-right">
          <Badge variant="outline" className="bg-white/50 dark:bg-gray-800/50 border-none font-bold">
            <Sparkles className="h-3 w-3 mr-1.5 text-purple-500" />
            {confidence}% Confidence
          </Badge>
          <p className="text-[10px] text-muted-foreground mt-1">{explainability}</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {sections.map(section => (
          <div key={section.title}>
            <h5 className="font-bold text-sm mb-2 flex items-center gap-2"><section.icon className="h-4 w-4 text-muted-foreground" /> {section.title}</h5>
            {Array.isArray(section.content) ? (
              <ul className="list-disc list-inside space-y-1">
                {section.content.map((item, i) => <li key={i} className="text-sm text-foreground/90">{item}</li>)}
              </ul>
            ) : (
              <p className="text-sm text-foreground/90">{section.content}</p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-indigo-100 dark:border-indigo-900/50 flex items-center gap-2">
        <Button size="sm" variant="outline" className="rounded-full font-bold gap-2"><Ticket className="h-4 w-4" /> View Tickets</Button>
        <Button size="sm" variant="outline" className="rounded-full font-bold gap-2"><User className="h-4 w-4" /> Notify Owner</Button>
        <Button size="sm" variant="destructive" className="rounded-full font-bold gap-2"><Bell className="h-4 w-4" /> Escalate</Button>
      </div>
    </div>
  );
};

export default AISummary;