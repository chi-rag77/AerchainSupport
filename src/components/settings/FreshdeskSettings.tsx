"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOrgData } from '@/hooks/use-org-user';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query'; // Import useQueryClient

const FreshdeskSettings = () => {
  const { orgSettings, orgId, isOrgLoading } = useOrgData();
  const queryClient = useQueryClient(); // Initialize query client
  const [domain, setDomain] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (orgSettings) {
      setDomain(orgSettings.freshdesk_domain || '');
      // Note: We don't load the API key back into state for security, 
      // but we allow the user to overwrite it.
      setApiKey(''); 
    }
  }, [orgSettings]);

  const saveFreshdeskSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId) {
      toast.error("Authentication error: Organization ID missing.");
      return;
    }
    if (!domain || !apiKey) {
      toast.error("Both Freshdesk Domain and API Key are required.");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("org_settings")
        .upsert({
          org_id: orgId,
          freshdesk_domain: domain,
          freshdesk_api_key: apiKey,
        }, { onConflict: 'org_id' }); // Conflict on org_id ensures one row per org

      if (error) {
        toast.error(`Failed to save settings: ${error.message}`);
      } else {
        toast.success("Freshdesk settings updated successfully!");
        // Invalidate the orgData query to force a refetch and update the UI immediately
        queryClient.invalidateQueries({ queryKey: ["orgData", orgId] });
        // Optionally clear API key input after successful save
        setApiKey(''); 
      }
    } catch (err: any) {
      toast.error(`An unexpected error occurred: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isOrgLoading) {
    return <Card><CardContent className="p-6 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading...</CardContent></Card>;
  }

  const isConfigured = !!orgSettings;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Freshdesk API Configuration</CardTitle>
        <CardDescription>
          Enter your Freshdesk domain and API key to enable ticket synchronization.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={saveFreshdeskSettings} className="space-y-6">
          {isConfigured ? (
            <div className="flex items-center p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-md text-sm text-green-800 dark:text-green-200">
              <CheckCircle className="h-4 w-4 mr-2" />
              Freshdesk is currently configured. Enter new credentials to update.
            </div>
          ) : (
            <div className="flex items-center p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-md text-sm text-red-800 dark:text-red-200">
              <AlertCircle className="h-4 w-4 mr-2" />
              Freshdesk is NOT configured. Please enter credentials to enable data sync.
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="domain">Freshdesk Domain (e.g., mycompany)</Label>
            <Input
              id="domain"
              type="text"
              placeholder="mycompany"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">Your full Freshdesk URL is https://<span className="font-semibold">{domain || 'mycompany'}</span>.freshdesk.com</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="apiKey">Freshdesk API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder={isConfigured ? "••••••••••••••••••••••••••••••••" : "Enter your API Key"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">The API key is stored securely and used by our backend functions.</p>
          </div>
          
          <Button type="submit" disabled={isSaving || !domain || !apiKey}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Settings
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default FreshdeskSettings;