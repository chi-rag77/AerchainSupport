import { supabase } from '@/integrations/supabase/client';

export async function getAssistantResponse(query: string, context: any = {}): Promise<any> {
  const { data, error } = await supabase.functions.invoke('support-copilot', {
    method: 'POST',
    body: { query, context },
  });

  if (error) throw error;
  return data;
}