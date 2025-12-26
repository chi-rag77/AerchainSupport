import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAutomationRules, createAutomationRule, updateAutomationRuleStatus, deleteAutomationRule } from '../rule.service';
import { useSupabase } from '@/components/SupabaseProvider';
import { AutomationRule, RuleCondition, RuleAction } from '@/types';
import { toast } from 'sonner';

const RULES_QUERY_KEY = 'automationRules';

export function useAutomationRules() {
  const { session } = useSupabase();
  const orgId = session?.user?.id;
  const queryClient = useQueryClient();

  const { data: rules = [], isLoading, error } = useQuery<AutomationRule[], Error>({
    queryKey: [RULES_QUERY_KEY, orgId],
    queryFn: () => fetchAutomationRules(orgId!),
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000,
  });

  const createRuleMutation = useMutation({
    mutationFn: ({ name, conditions, actions }: { name: string, conditions: RuleCondition[], actions: RuleAction[] }) =>
      createAutomationRule(orgId!, name, conditions, actions),
    onSuccess: () => {
      toast.success("Automation rule created successfully!");
      queryClient.invalidateQueries({ queryKey: [RULES_QUERY_KEY, orgId] });
    },
    onError: (err) => {
      toast.error(`Failed to create rule: ${err.message}`);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ ruleId, isActive }: { ruleId: string, isActive: boolean }) =>
      updateAutomationRuleStatus(ruleId, isActive),
    onSuccess: (_, variables) => {
      toast.success(`Rule ${variables.isActive ? 'enabled' : 'disabled'}.`);
      queryClient.invalidateQueries({ queryKey: [RULES_QUERY_KEY, orgId] });
    },
    onError: (err) => {
      toast.error(`Failed to update rule status: ${err.message}`);
    },
  });

  const deleteRuleMutation = useMutation({
    mutationFn: (ruleId: string) => deleteAutomationRule(ruleId),
    onSuccess: () => {
      toast.success("Automation rule deleted.");
      queryClient.invalidateQueries({ queryKey: [RULES_QUERY_KEY, orgId] });
    },
    onError: (err) => {
      toast.error(`Failed to delete rule: ${err.message}`);
    },
  });

  return {
    rules,
    isLoading,
    error,
    createRule: createRuleMutation.mutate,
    updateRuleStatus: updateStatusMutation.mutate,
    deleteRule: deleteRuleMutation.mutate,
    isCreating: createRuleMutation.isPending,
    isDeleting: deleteRuleMutation.isPending,
  };
}