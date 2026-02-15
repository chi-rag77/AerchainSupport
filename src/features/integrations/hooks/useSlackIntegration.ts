import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchSlackIntegration, fetchSlackRules, updateSlackRule, disconnectSlack, sendSlackTestMessage } from '../services/slack.service';
import { useSupabase } from '@/components/SupabaseProvider';
import { toast } from 'sonner';

export function useSlackIntegration() {
  const { session } = useSupabase();
  const orgId = session?.user?.id;
  const queryClient = useQueryClient();

  const { data: integration, isLoading: isLoadingIntegration } = useQuery({
    queryKey: ['slackIntegration', orgId],
    queryFn: () => fetchSlackIntegration(orgId!),
    enabled: !!orgId,
  });

  const { data: rules = [], isLoading: isLoadingRules } = useQuery({
    queryKey: ['slackRules', orgId],
    queryFn: () => fetchSlackRules(orgId!),
    enabled: !!orgId,
  });

  const updateRuleMutation = useMutation({
    mutationFn: updateSlackRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slackRules', orgId] });
      toast.success("Notification rule updated.");
    },
    onError: (err: any) => toast.error(`Failed to update rule: ${err.message}`),
  });

  const disconnectMutation = useMutation({
    mutationFn: () => disconnectSlack(orgId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slackIntegration', orgId] });
      toast.success("Slack disconnected.");
    },
  });

  const testMessageMutation = useMutation({
    mutationFn: () => sendSlackTestMessage(orgId!),
    onSuccess: () => toast.success("Test message sent to Slack!"),
    onError: (err: any) => toast.error(`Failed to send test: ${err.message}`),
  });

  return {
    integration,
    rules,
    isConnected: !!integration,
    isLoading: isLoadingIntegration || isLoadingRules,
    updateRule: updateRuleMutation.mutate,
    disconnect: disconnectMutation.mutate,
    sendTest: testMessageMutation.mutate,
    isTesting: testMessageMutation.isPending,
  };
}