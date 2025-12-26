import { supabase } from '@/integrations/supabase/client';
import { AutomationRule, RuleCondition, RuleAction } from '@/types';

const TABLE_NAME = 'automation_rules';

export async function fetchAutomationRules(orgId: string): Promise<AutomationRule[]> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as AutomationRule[];
}

export async function createAutomationRule(orgId: string, name: string, conditions: RuleCondition[], actions: RuleAction[]): Promise<AutomationRule> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert({
      org_id: orgId,
      name: name,
      trigger_conditions: conditions,
      actions: actions,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data as AutomationRule;
}

export async function updateAutomationRuleStatus(ruleId: string, isActive: boolean): Promise<void> {
  const { error } = await supabase
    .from(TABLE_NAME)
    .update({ is_active: isActive })
    .eq('id', ruleId);

  if (error) throw error;
}

export async function deleteAutomationRule(ruleId: string): Promise<void> {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', ruleId);

  if (error) throw error;
}