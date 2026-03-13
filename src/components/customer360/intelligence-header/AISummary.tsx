"use client";

import React from 'react';
import { Brain, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AISummaryProps {
  summary: string;
  confidence: number;
}

const AISummary = ({ summary, confidence }: AISummaryProps) => {
  return (
    <div className="p-6 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-indigo-600" />
          <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-700 dark:text-indigo-300">
            AI Customer Summary
          </h4>
        </div>
        <Badge variant="outline" className="bg-white/50 dark:bg-gray-800/50 border-none font-bold">
          <Sparkles className="h-3 w-3 mr-1.5 text-purple-500" />
          {confidence}% Confidence
        </Badge>
      </div>
      <p className="text-sm font-medium leading-relaxed text-foreground/90">
        {summary}
      </p>
    </div>
  );
};

export default AISummary;