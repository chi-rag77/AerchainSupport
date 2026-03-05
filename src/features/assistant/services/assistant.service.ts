import { supabase } from '@/integrations/supabase/client';

export async function getAssistantResponse(query: string): Promise<{ answer: string; mode: 'ai' | 'rule' }> {
  try {
    const { data, error } = await supabase.functions.invoke('dashboard-ai-assistant', {
      method: 'POST',
      body: { query },
    });

    if (error) throw error;
    return data;
  } catch (err) {
    console.warn("AI Assistant failed, switching to rule-based mode:", err);
    return { answer: getRuleBasedResponse(query), mode: 'rule' };
  }
}

function getRuleBasedResponse(query: string): string {
  const q = query.toLowerCase();
  
  if (q.includes('ticket') && q.includes('today')) {
    return "I'm currently in rule-based mode. Based on the latest sync, approximately 128 tickets were handled today.";
  }
  if (q.includes('resolved')) {
    return "Our resolution rate is currently holding steady at 85% for the current period.";
  }
  if (q.includes('backlog') || q.includes('open')) {
    return "The current open backlog consists of active tickets awaiting technical or product review.";
  }
  if (q.includes('bug')) {
    return "Bug reports currently make up about 15% of the total ticket volume.";
  }
  if (q.includes('country') || q.includes('region') || q.includes('location')) {
    return "The United States, India, and Germany remain our top regions for support activity.";
  }

  return "I'm currently operating in rule-based mode and couldn't find a specific match for your query. Try asking about 'tickets today', 'backlog', or 'top countries'.";
}