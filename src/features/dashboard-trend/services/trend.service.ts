import { invokeEdgeFunction } from '@/lib/apiClient';
import { TrendIntelligenceData, TrendSignals, AIIntelligence } from '../types';
import { supabase } from '@/integrations/supabase/client';

export async function fetchTrendData(startDate: string, endDate: string): Promise<{ trendData: any[], signals: TrendSignals }> {
  return await invokeEdgeFunction('get-volume-sla-trend', {
    method: 'POST',
    body: { startDate, endDate },
  });
}

export async function fetchAIIntelligence(signals: TrendSignals, orgId: string, forceRefresh = false): Promise<AIIntelligence> {
  // 1. Check Cache with explicit error code handling
  if (!forceRefresh) {
    const { data: cached, error } = await supabase
      .from('ai_trend_intelligence')
      .select('*')
      .eq('start_date', signals.startDate)
      .eq('end_date', signals.endDate)
      .eq('risk_level', signals.riskLevel)
      .maybeSingle();

    // If table exists and we have data, check if it's still valid
    if (cached && !error) {
      const volDiff = Math.abs(cached.avg_volume - signals.avgVolume) / cached.avg_volume;
      if (volDiff < 0.1) {
        return {
          summary: cached.summary,
          rootCause: cached.root_cause,
          recommendedAction: cached.recommended_action,
          confidenceScore: cached.confidence_score
        };
      }
    }
    
    // If error is PGRST205 (Table not found), we just log it and proceed to generation
    if (error && error.code === 'PGRST205') {
      console.warn("[trend.service] Cache table not found in schema cache. Proceeding with fresh generation.");
    }
  }

  // 2. Generate New (This is the source of truth)
  const intelligence = await invokeEdgeFunction<AIIntelligence>('generate-trend-intelligence', {
    method: 'POST',
    body: { signals, orgId },
  });

  // 3. Attempt to Save to Cache (Fail silently if table is missing)
  try {
    const { error: upsertError } = await supabase.from('ai_trend_intelligence').upsert({
      org_id: orgId,
      start_date: signals.startDate,
      end_date: signals.endDate,
      risk_level: signals.riskLevel,
      summary: intelligence.summary,
      root_cause: intelligence.rootCause,
      recommended_action: intelligence.recommendedAction,
      confidence_score: intelligence.confidenceScore,
      updated_at: new Date().toISOString()
    });
    
    if (upsertError) {
      console.error("[trend.service] Failed to update AI cache:", upsertError.message);
    }
  } catch (e) {
    // Catch any unexpected JS errors during upsert
  }

  return intelligence;
}