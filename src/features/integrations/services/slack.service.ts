import { supabase } from '@/integrations/supabase/client';
import { SlackIntegration, SlackNotificationRule, SlackChannel, SlackEventType } from '../types';
import { invokeEdgeFunction } from '@/lib/apiClient';

export async function fetchSlackIntegration(orgId: string): Promise<SlackIntegration | null> {
  const { data, error } = await supabase
    .from('slack_integrations')
    .select('*')
    .eq('org_id', orgId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as SlackIntegration | null;
}

export async function fetchSlackRules(orgId: string): Promise<SlackNotificationRule[]> {
  const { data, error } = await supabase
    .from('slack_notification_rules')
    .select('*')
    .eq('org_id', orgId);

  if (error) throw error;
  return data as SlackNotificationRule[];
}

export async function updateSlackRule(rule: Partial<SlackNotificationRule>): Promise<void> {
  const { error } = await supabase
    .from('slack_notification_rules')
    .upsert(rule, { onConflict: 'org_id,event_type' });

  if (error) throw error;
}

export async function disconnectSlack(orgId: string): Promise<void> {
  const { error } = await supabase
    .from('slack_integrations')
    .delete()
    .eq('org_id', orgId);

  if (error) throw error;
}

export async function sendSlackTestMessage(orgId: string): Promise<void> {
  return await invokeEdgeFunction('send-slack-message', {
    method: 'POST',
    body: { orgId, eventType: 'TEST', payload: { message: "This is a test message from your Aerchain Dashboard!" } }
  });
}