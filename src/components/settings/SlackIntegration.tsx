"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSlackIntegration } from '@/features/integrations/hooks/useSlackIntegration';
import { SlackEventType } from '@/features/integrations/types';
import { 
  Loader2, Slack, CheckCircle2, AlertCircle, Send, LogOut, Zap, 
  ShieldAlert, TrendingUp, Users, Brain, Info, ShieldCheck, Settings, 
  Lock, Code, ChevronRight 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const EVENT_CONFIG: { type: SlackEventType; label: string; description: string; icon: React.ElementType }[] = [
  { type: 'SLA_BREACH', label: 'SLA Breach Alerts', description: 'Notify when tickets are predicted to breach SLA.', icon: ShieldAlert },
  { type: 'ESCALATION_RISK', label: 'Escalation Risk Alerts', description: 'Alert on high-risk sentiment or urgent escalations.', icon: AlertCircle },
  { type: 'DAILY_SUMMARY', label: 'Daily AI Executive Summary', description: 'Send a morning brief of operational health.', icon: Brain },
  { type: 'VOLUME_SPIKE', label: 'Volume Spike Alerts', description: 'Notify when ticket volume exceeds normal thresholds.', icon: TrendingUp },
  { type: 'AGENT_OVERLOAD', label: 'Agent Overload Alerts', description: 'Alert when specific agents reach critical capacity.', icon: Users },
];

const SlackIntegration = () => {
  const { integration, rules, isConnected, isLoading, updateRule, disconnect, sendTest, isTesting } = useSlackIntegration();

  const handleConnect = () => {
    const clientId = "YOUR_SLACK_CLIENT_ID"; 
    const redirectUri = `${window.location.origin}/functions/v1/slack-oauth-callback`;
    const scope = "chat:write,channels:read,groups:read";
    window.location.href = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=${scope}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Connection Status */}
      <Card className={cn(
        "border-none shadow-glass rounded-[24px] overflow-hidden",
        isConnected ? "bg-green-50/30 dark:bg-green-950/10" : "bg-white dark:bg-gray-800"
      )}>
        <CardHeader className="p-8 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-[#4A154B] text-white shadow-lg">
                <Slack className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">Slack Integration</CardTitle>
                <CardDescription>
                  Connect your workspace to receive AI-powered operational alerts.
                </CardDescription>
              </div>
            </div>
            {isConnected ? (
              <Badge className="bg-green-500 text-white border-none font-bold px-3 py-1">
                Connected
              </Badge>
            ) : (
              <Badge variant="outline" className="font-bold opacity-50">
                Not Configured
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-8 pt-0 space-y-6">
          
          {/* How it works section */}
          <div className="bg-gray-50/50 dark:bg-gray-900/50 rounded-[16px] border border-border/50 shadow-inner overflow-hidden">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="how-it-works" className="border-none">
                <AccordionTrigger className="px-6 py-3 hover:no-underline group">
                  <div className="flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    <Info className="h-4 w-4" />
                    Learn how Slack integration works
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-2">
                      <h4 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-foreground">
                        <ShieldCheck className="h-3.5 w-3.5 text-green-500" /> What gets sent to Slack
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        When connected, your workspace receives SLA predictions, escalation risks, volume spikes, and AI summaries. <strong>No ticket content is sent</strong> unless explicitly included in the alert summary.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-foreground">
                        <Zap className="h-3.5 w-3.5 text-amber-500" /> When alerts are triggered
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Alerts trigger automatically when SLA breaches are predicted, risk levels become High, or agent capacity is reached. You have full control over which alerts are enabled.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-foreground">
                        <Lock className="h-3.5 w-3.5 text-blue-500" /> Security & Permissions
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        We request minimum permissions: posting to channels and reading channel lists. Your bot token is <strong>encrypted and securely stored</strong>. We never access private messages.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-foreground">
                        <Settings className="h-3.5 w-3.5 text-purple-500" /> How to configure
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        After connecting, select a default channel and toggle specific alert types. You can send a test message anytime to verify the connection is active.
                      </p>
                    </div>
                  </div>
                  
                  <Separator className="opacity-50" />
                  
                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-foreground">
                      <Code className="h-3.5 w-3.5 text-gray-500" /> Technical Overview (Advanced)
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Alerts are event-driven and sent via a dedicated Slack Bot. There is no continuous polling; data is synced via secure server-side APIs to ensure performance and integrity.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {isConnected ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 rounded-2xl bg-white/50 dark:bg-gray-900/50 border border-white/20">
              <div className="space-y-1">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Connected Workspace</p>
                <p className="text-lg font-black">{integration?.workspace_name}</p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => disconnect()} className="rounded-full border-red-200 text-red-600 hover:bg-red-50 gap-2">
                  <LogOut className="h-4 w-4" /> Disconnect
                </Button>
                <Button onClick={() => sendTest()} disabled={isTesting} className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                  {isTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Send Test Alert
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 space-y-6">
              <div className="max-w-sm mx-auto space-y-3">
                <p className="text-sm font-bold text-foreground">
                  Deliver AI-powered operational intelligence directly to your team’s workflow.
                </p>
                <Button onClick={handleConnect} className="rounded-full bg-[#4A154B] hover:bg-[#3a113b] text-white h-12 px-8 font-bold gap-2 shadow-lg shadow-purple-500/20">
                  <Slack className="h-5 w-5" />
                  Connect with Slack
                </Button>
                <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  <Lock className="h-3 w-3" /> Secure OAuth 2.0 Connection
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Rules */}
      {isConnected && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
              <Zap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold tracking-tight">Notification Intelligence</h3>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {EVENT_CONFIG.map((config) => {
              const rule = rules.find(r => r.event_type === config.type);
              const isEnabled = rule?.is_enabled ?? false;
              const Icon = config.icon;

              return (
                <Card key={config.type} className="border-none shadow-sm rounded-[20px] bg-white dark:bg-gray-800 hover:shadow-md transition-all">
                  <CardContent className="p-6 flex items-center justify-between gap-6">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={cn(
                        "p-3 rounded-xl",
                        isEnabled ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600" : "bg-gray-50 dark:bg-gray-900 text-muted-foreground"
                      )}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-base font-bold leading-none">{config.label}</Label>
                        <p className="text-sm text-muted-foreground font-medium">{config.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        {isEnabled ? 'Active' : 'Disabled'}
                      </span>
                      <Switch 
                        checked={isEnabled}
                        onCheckedChange={(checked) => updateRule({ event_type: config.type, is_enabled: checked })}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SlackIntegration;