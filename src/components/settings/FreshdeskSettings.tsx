"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOrgData } from '@/hooks/use-org-user';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Save, AlertCircle, CheckCircle, KeyRound, RefreshCw, Settings2, ShieldCheck } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SyncCommandCenter from './SyncCommandCenter';

const FreshdeskSettings = () => {
  const { orgSettings, orgId, isOrgLoading } = useOrgData();
  const queryClient = useQueryClient();
  const [domain, setDomain] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (orgSettings) {
      setDomain(orgSettings.freshdesk_domain || '');
      setWebhookSecret(orgSettings.webhook_secret || '');
      setApiKey(''); 
    }
  }, [orgSettings]);

  const saveFreshdeskSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId) return;

    setIsSaving(true);
    try {
      const payload: any = {
        org_id: orgId,
        freshdesk_domain: domain,
        webhook_secret: webhookSecret,
      };
      
      if (apiKey) payload.freshdesk_api_key = apiKey;

      const { error } = await supabase
        .from("org_settings")
        .upsert(payload, { onConflict: 'org_id' });

      if (error) throw error;
      
      toast.success("Settings updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["orgData", orgId] });
      setApiKey(''); 
    } catch (err: any) {
      toast.error(`Failed to save: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isOrgLoading) {
    return <Card><CardContent className="p-6 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading...</CardContent></Card>;
  }

  return (
    <div className="space-y-8">
      <Tabs defaultValue="sync" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mb-8">
          <TabsTrigger value="sync" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" /> Sync Center
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" /> API Config
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sync">
          <SyncCommandCenter />
        </TabsContent>

        <TabsContent value="config">
          <Card className="border-none shadow-glass rounded-[28px] overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black tracking-tight">API Configuration</CardTitle>
                  <CardDescription className="font-medium">Securely connect your Freshdesk instance.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <form onSubmit={saveFreshdeskSettings} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="domain" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Freshdesk Domain</Label>
                    <Input
                      id="domain"
                      placeholder="mycompany"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      className="h-11 rounded-xl bg-gray-50 dark:bg-gray-900 border-none"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="apiKey" className="text-xs font-black uppercase tracking-widest text-muted-foreground">API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      placeholder={orgSettings?.freshdesk_api_key ? "••••••••••••••••" : "Enter API Key"}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="h-11 rounded-xl bg-gray-50 dark:bg-gray-900 border-none"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="webhookSecret" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Webhook HMAC Secret</Label>
                    <Input
                      id="webhookSecret"
                      type="password"
                      placeholder="Enter secret for signature validation"
                      value={webhookSecret}
                      onChange={(e) => setWebhookSecret(e.target.value)}
                      className="h-11 rounded-xl bg-gray-50 dark:bg-gray-900 border-none"
                    />
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter flex items-center gap-1.5 mt-1">
                      <ShieldCheck className="h-3 w-3 text-green-500" /> Used to verify real-time updates from Freshdesk
                    </p>
                  </div>
                </div>
                
                <Button type="submit" disabled={isSaving} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[10px] h-11 px-8 shadow-lg shadow-indigo-500/20">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Configuration
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FreshdeskSettings;