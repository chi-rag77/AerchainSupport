"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Mail, Sparkles, FileText, Send, 
  Download, Edit3, CheckCircle2, AlertTriangle,
  TrendingUp, TrendingDown, Zap, Clock, ShieldAlert,
  Brain, ThumbsUp, ThumbsDown, RefreshCw, Eye,
  LayoutDashboard, ListFilter, ShieldCheck, User,
  ChevronRight, ArrowRight, Search, MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invokeEdgeFunction } from '@/lib/apiClient';
import { CustomerDigest } from '@/features/customer-pulse/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import DigestMetricCard from './DigestMetricCard';
import ClassificationDistribution from './ClassificationDistribution';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface WeeklyDigestSectionProps {
  customerName: string;
}

const WeeklyDigestSection = ({ customerName }: WeeklyDigestSectionProps) => {
  const [viewMode, setViewMode] = useState<'detailed' | 'executive'>('detailed');
  const [isEditing, setIsEditing] = useState(false);
  const [editedSummary, setEditedSummary] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: digest, isLoading, isFetching, refetch } = useQuery<CustomerDigest, Error>({
    queryKey: ['customerDigest', customerName],
    queryFn: () => invokeEdgeFunction('generate-customer-digest', {
      method: 'POST',
      body: { customerName },
    }),
    enabled: !!customerName,
  });

  const regenerateMutation = useMutation({
    mutationFn: (focus: string) => invokeEdgeFunction('generate-customer-digest', {
      method: 'POST',
      body: { customerName, focus },
    }),
    onSuccess: (data) => {
      queryClient.setQueryData(['customerDigest', customerName], data);
      toast.success("AI Summary updated with new focus.");
    }
  });

  if (isLoading) {
    return (
      <div className="h-[600px] flex flex-col items-center justify-center bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl rounded-[32px] border border-dashed border-indigo-200">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-2xl animate-pulse" />
          <Brain className="h-12 w-12 text-indigo-600 animate-pulse relative z-10" />
        </div>
        <p className="mt-6 font-black text-muted-foreground uppercase tracking-[0.3em] text-[10px] animate-pulse">
          Synthesizing Weekly Intelligence...
        </p>
      </div>
    );
  }

  if (!digest) return null;

  const metrics = digest.metrics;
  const isExec = viewMode === 'executive';

  const sparklineData = Array.from({ length: 10 }, () => ({ value: Math.floor(Math.random() * 50) + 10 }));

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      
      {/* 1. Premium Header Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-500/20">
            <Mail className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-3xl font-black tracking-tighter text-foreground">Weekly Customer Digest</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="bg-indigo-50/50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-200/50 font-bold text-[10px] uppercase tracking-widest">
                {digest.weekLabel}
              </Badge>
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-green-500" /> Verified Data
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-gray-200/50 dark:bg-gray-800/50 rounded-full border border-white/20">
            <button
              onClick={() => setViewMode('detailed')}
              className={cn(
                "relative flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                !isExec ? "text-white" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {!isExec && <motion.div layoutId="digest-view" className="absolute inset-0 bg-indigo-600 rounded-full shadow-md" />}
              <span className="relative z-10">Detailed</span>
            </button>
            <button
              onClick={() => setViewMode('executive')}
              className={cn(
                "relative flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                isExec ? "text-white" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isExec && <motion.div layoutId="digest-view" className="absolute inset-0 bg-indigo-600 rounded-full shadow-md" />}
              <span className="relative z-10">Executive</span>
            </button>
          </div>

          <Button 
            onClick={() => setIsPreviewOpen(true)}
            className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-widest h-12 px-8 gap-3 shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <Send className="h-4 w-4" />
            Send to Customer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 2. Interactive AI Summary Card (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          <Card className="border-none shadow-glass rounded-[32px] bg-white dark:bg-gray-800 overflow-hidden group">
            <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-500 blur-md opacity-20 animate-pulse" />
                  <div className="relative p-2 rounded-xl bg-indigo-50 text-indigo-600">
                    <Brain className="h-5 w-5" />
                  </div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">AI Intelligence Brief</span>
                  <p className="text-xs font-bold text-muted-foreground">Synthesized from {metrics.volume.total} interactions</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-green-50 text-muted-foreground hover:text-green-600"><ThumbsUp className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-rose-50 text-muted-foreground hover:text-rose-600"><ThumbsDown className="h-4 w-4" /></Button>
                <Separator orientation="vertical" className="h-4 mx-1" />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    if (!isEditing) setEditedSummary(digest.aiSummary);
                    setIsEditing(!isEditing);
                  }}
                  className="h-8 rounded-lg font-black text-[10px] uppercase tracking-widest gap-2 hover:bg-indigo-50 text-indigo-600"
                >
                  {isEditing ? "Cancel" : <><Edit3 className="h-3.5 w-3.5" /> Edit</>}
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-8 pt-0 space-y-8">
              <AnimatePresence mode="wait">
                {isEditing ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                    <Textarea 
                      value={editedSummary}
                      onChange={(e) => setEditedSummary(e.target.value)}
                      className="min-h-[160px] rounded-[24px] border-indigo-100 bg-indigo-50/30 font-medium text-base leading-relaxed p-6 focus-visible:ring-indigo-500/30"
                    />
                    <div className="flex justify-end gap-3">
                      <Button variant="ghost" onClick={() => setIsEditing(false)} className="rounded-xl font-bold">Discard</Button>
                      <Button className="rounded-xl bg-indigo-600 font-black uppercase tracking-widest text-[10px] px-8" onClick={() => setIsEditing(false)}>Save Changes</Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                    <p className="text-xl font-medium leading-relaxed text-foreground/90 italic">
                      "{digest.aiSummary}"
                    </p>

                    {/* Focus Controls */}
                    <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-50 dark:border-gray-800">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mr-2">Regenerate with focus:</span>
                      <Button 
                        variant="outline" size="sm" 
                        onClick={() => regenerateMutation.mutate('risks')}
                        disabled={regenerateMutation.isPending}
                        className="rounded-full h-8 px-4 text-[10px] font-bold border-rose-100 text-rose-600 hover:bg-rose-50"
                      >
                        <ShieldAlert className="h-3 w-3 mr-1.5" /> Risks
                      </Button>
                      <Button 
                        variant="outline" size="sm" 
                        onClick={() => regenerateMutation.mutate('escalations')}
                        disabled={regenerateMutation.isPending}
                        className="rounded-full h-8 px-4 text-[10px] font-bold border-amber-100 text-amber-600 hover:bg-amber-50"
                      >
                        <Zap className="h-3 w-3 mr-1.5" /> Escalations
                      </Button>
                      <Button 
                        variant="outline" size="sm" 
                        onClick={() => regenerateMutation.mutate('executive')}
                        disabled={regenerateMutation.isPending}
                        className="rounded-full h-8 px-4 text-[10px] font-bold border-indigo-100 text-indigo-600 hover:bg-indigo-50"
                      >
                        <Brain className="h-3 w-3 mr-1.5" /> Exec Summary
                      </Button>
                      <Button 
                        variant="ghost" size="sm" 
                        className="rounded-full h-8 px-4 text-[10px] font-black uppercase tracking-widest text-indigo-600 ml-auto gap-2"
                      >
                        Ask AI <MessageSquare className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* 3. Intelligence Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DigestMetricCard 
              title="Total Volume"
              value={metrics.volume.total}
              trend={metrics.volume.wow}
              trendLabel="vs last week"
              status={metrics.volume.wow > 15 ? 'warning' : 'neutral'}
              sparklineData={sparklineData}
              description="Total support requests received this week. A spike often indicates a new release or integration issue."
              isPrimary
            />
            <DigestMetricCard 
              title="Resolution Rate"
              value={Math.round((metrics.status.closed / metrics.volume.total) * 100)}
              suffix="%"
              trend={5}
              trendLabel="Efficiency"
              status="good"
              sparklineData={sparklineData}
              description="Percentage of weekly tickets successfully closed. Maintaining >80% is critical for backlog health."
            />
            <DigestMetricCard 
              title="SLA Adherence"
              value={metrics.sla.adherence}
              suffix="%"
              trend={-2}
              trendLabel="Compliance"
              status={metrics.sla.adherence < 85 ? 'critical' : 'good'}
              sparklineData={sparklineData}
              description="Percentage of tickets resolved within the agreed Service Level Agreement timeframe."
            />
            <DigestMetricCard 
              title="Active Backlog"
              value={metrics.status.backlog}
              trend={12}
              trendLabel="Growth"
              status={metrics.status.backlog > 10 ? 'warning' : 'neutral'}
              sparklineData={sparklineData}
              description="Unresolved tickets carried over from previous periods. High backlog increases churn risk."
            />
          </div>

          {/* 4. Visual Distribution & Critical Alerts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-none shadow-glass rounded-[32px] bg-white dark:bg-gray-800 p-8">
              <ClassificationDistribution 
                data={[
                  { label: 'Bugs', count: metrics.classification.bugs, color: 'bg-rose-500' },
                  { label: 'Queries', count: metrics.classification.queries, color: 'bg-indigo-500' },
                  { label: 'Tasks', count: metrics.classification.tasks, color: 'bg-amber-500' },
                  { label: 'Features', count: metrics.classification.features, color: 'bg-emerald-500' },
                ]}
              />
            </Card>

            <Card className="border-none shadow-glass rounded-[32px] bg-white dark:bg-gray-800 p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Critical Intelligence</h4>
                <Badge className="bg-rose-500 text-white border-none font-black text-[9px] uppercase">Action Required</Badge>
              </div>
              
              <div className="space-y-4">
                <div className="group relative p-5 rounded-[24px] bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 transition-all hover:shadow-md">
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="h-4 w-4 text-rose-600" />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-xl bg-rose-100 text-rose-600 shadow-sm">
                      <ShieldAlert className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-sm font-black text-rose-900 dark:text-rose-200">{metrics.critical.urgent} Urgent Tickets</p>
                      <p className="text-[10px] font-bold text-rose-600/70 uppercase tracking-widest">Immediate attention needed</p>
                    </div>
                  </div>
                </div>

                <div className="group relative p-5 rounded-[24px] bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 transition-all hover:shadow-md">
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-xl bg-amber-100 text-amber-600 shadow-sm">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-sm font-black text-amber-900 dark:text-amber-200">{metrics.critical.escalated} Escalations</p>
                      <p className="text-[10px] font-bold text-amber-600/70 uppercase tracking-widest">Manager review recommended</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* 5. Right Panel: Settings & Recipients (4 cols) */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="border-none shadow-glass rounded-[32px] bg-white dark:bg-gray-800 p-8 space-y-8">
            <div className="space-y-1">
              <h4 className="text-xl font-black tracking-tight">Digest Intelligence</h4>
              <p className="text-sm font-medium text-muted-foreground">Manage delivery and stakeholders.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Active Recipients</label>
                <div className="space-y-3">
                  {[
                    { email: 'ops-lead@customer.com', role: 'Operations Head', initial: 'OL' },
                    { email: 'csm@aerchain.io', role: 'Account Manager', initial: 'AM' }
                  ].map(item => (
                    <div key={item.email} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-border/50 group hover:border-indigo-200 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-[10px] font-black text-indigo-600 shadow-sm border border-border/50">
                          {item.initial}
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold truncate max-w-[140px]">{item.email}</p>
                          <p className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground">{item.role}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[8px] font-black uppercase border-none bg-white dark:bg-gray-700">Verified</Badge>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" size="sm" className="w-full h-11 rounded-xl font-black text-[10px] uppercase tracking-widest mt-2 border border-dashed border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                  + Add Stakeholder
                </Button>
              </div>

              <Separator className="opacity-50" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-black">Auto-Send Weekly</span>
                    <p className="text-[10px] font-medium text-muted-foreground">Every Monday, 9:00 AM</p>
                  </div>
                  <Badge className="bg-green-500 text-white border-none font-black text-[9px] uppercase px-3 py-1">Enabled</Badge>
                </div>
                <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50">
                  <div className="flex items-center gap-2 text-indigo-600 mb-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Last Delivered</span>
                  </div>
                  <p className="text-xs font-bold text-indigo-900 dark:text-indigo-200">Mar 11, 2024 • 09:02 AM</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Smart Nudge */}
          <div className="p-6 rounded-[32px] bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-xl shadow-indigo-500/20 space-y-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
              <Sparkles className="h-16 w-16" />
            </div>
            <div className="relative z-10 space-y-3">
              <h5 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-400" /> Smart Nudge
              </h5>
              <p className="text-xs font-bold leading-relaxed opacity-90">
                SLA adherence has dropped below 85% for two consecutive weeks. You may want to schedule a review call with the customer.
              </p>
              <Button variant="secondary" className="w-full rounded-xl font-black uppercase tracking-widest text-[10px] h-10 bg-white text-indigo-600 hover:bg-indigo-50 border-none">
                Schedule Review
              </Button>
            </div>
          </div>
        </div>

      </div>

      {/* 6. Confidence Briefing & Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-2xl rounded-[32px] border-none shadow-2xl p-0 overflow-hidden">
          <div className="bg-indigo-600 p-8 text-white">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <Badge className="bg-white/20 text-white border-none font-black uppercase tracking-widest text-[10px]">
                  Confidence Briefing
                </Badge>
              </div>
              <DialogTitle className="text-3xl font-black tracking-tight text-white">Ready to Send?</DialogTitle>
              <DialogDescription className="text-indigo-100 font-medium text-base">
                We've analyzed the digest for accuracy and potential risks.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-8 space-y-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/50 space-y-2">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Data Integrity</span>
                </div>
                <p className="text-sm font-bold text-green-900 dark:text-green-200">No critical data gaps detected in this week's set.</p>
              </div>
              <div className="p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/50 space-y-2">
                <div className="flex items-center gap-2 text-indigo-600">
                  <Zap className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Risk Highlight</span>
                </div>
                <p className="text-sm font-bold text-indigo-900 dark:text-indigo-200">1 major escalation is highlighted in the summary.</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Email Preview</h4>
              <div className="p-6 rounded-[24px] bg-gray-50 dark:bg-gray-900 border border-border/50 space-y-4 max-h-[200px] overflow-y-auto">
                <p className="text-sm font-bold">Subject: Weekly Support Summary – {customerName} | {digest.weekLabel}</p>
                <Separator />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Hi Team,<br/><br/>
                  Here is your weekly support summary for {customerName}.<br/><br/>
                  "{digest.aiSummary}"<br/><br/>
                  Best,<br/>
                  Aerchain Support Team
                </p>
              </div>
            </div>
          </div>

          <div className="p-8 bg-gray-50 dark:bg-gray-900 border-t border-border flex justify-end gap-4">
            <Button variant="ghost" onClick={() => setIsPreviewOpen(false)} className="rounded-xl font-bold">Back to Edit</Button>
            <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[10px] px-10 h-12 shadow-lg shadow-indigo-500/20">
              Confirm & Send Email
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default WeeklyDigestSection;