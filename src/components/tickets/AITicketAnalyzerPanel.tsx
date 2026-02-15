"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { 
  Brain, Sparkles, AlertTriangle, TrendingUp, MessageSquare, 
  CheckCircle2, RefreshCw, Loader2, Info, ShieldAlert
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TicketAIAnalysis } from '@/features/ticket-ai/types';

interface AITicketAnalyzerPanelProps {
  analysis: TicketAIAnalysis | undefined;
  isLoading: boolean;
  onRefresh: () => void;
}

const AITicketAnalyzerPanel = ({ analysis, isLoading, onRefresh }: AITicketAnalyzerPanelProps) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4 text-muted-foreground">
        <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
        <p className="text-sm font-medium animate-pulse">AI is analyzing conversation patterns...</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="text-center py-8">
        <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-20" />
        <p className="text-sm text-muted-foreground">No analysis available. Click the button to start.</p>
      </div>
    );
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200';
      default: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'worsening': return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold">AI Ticket Intelligence</h3>
            <p className="text-xs text-muted-foreground">Last analyzed: {new Date(analysis.updated_at).toLocaleTimeString()}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onRefresh} className="h-8 gap-2">
          <RefreshCw className="h-3 w-3" /> Re-analyze
        </Button>
      </div>

      <Card className="border-none bg-purple-50/30 dark:bg-purple-950/10 shadow-inner">
        <CardContent className="p-4 space-y-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Executive Summary
            </h4>
            <p className="text-sm leading-relaxed text-foreground/90">{analysis.summary}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-muted-foreground">Customer Tone</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize">{analysis.customer_tone}</Badge>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-muted-foreground">Agent Tone</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize">{analysis.agent_tone}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className={cn("border-l-4", analysis.escalation_risk === 'high' ? "border-l-red-500" : "border-l-blue-500")}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-muted-foreground" /> Escalation Risk
              </h4>
              <Badge className={cn("capitalize", getRiskColor(analysis.escalation_risk))}>
                {analysis.escalation_risk}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {analysis.is_escalating ? (
                <span className="text-red-500 font-bold flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Escalating
                </span>
              ) : (
                <span className="text-green-500 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Stable
                </span>
              )}
              <span>•</span>
              <span className="flex items-center gap-1">
                {getTrendIcon(analysis.sentiment_trend)} {analysis.sentiment_trend}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" /> Confidence
            </h4>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold">{analysis.confidence_score}%</span>
              <span className="text-[10px] text-muted-foreground mb-1">AI Reliability</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-1 rounded-full mt-2">
              <div 
                className="bg-purple-500 h-1 rounded-full transition-all duration-1000" 
                style={{ width: `${analysis.confidence_score}%` }} 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-bold flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-purple-500" /> Suggested Next Actions
        </h4>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-border">
          <ul className="space-y-2">
            {analysis.suggested_action.split('\n').map((action, i) => (
              <li key={i} className="text-sm flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
                {action.replace(/^- /, '')}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AITicketAnalyzerPanel;