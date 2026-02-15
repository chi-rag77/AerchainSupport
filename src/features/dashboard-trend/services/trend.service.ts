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
  // 1. Check Cache
  if (!forceRefresh) {
    const { data: cached } = await supabase
      .from('ai_trend_intelligence')
      .select('*')
      .eq('start_date', signals.startDate)
      .eq('end_date', signals.endDate)
      .eq('risk_level', signals.riskLevel)
      .single();

    if (cached) {
      // Check if volume/sla changed significantly (>10%)
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
  }

  // 2. Generate New
  const intelligence = await invokeEdgeFunction<AIIntelligence>('generate-trend-intelligence', {
    method: 'POST',
    body: { signals, orgId },
  });

  // 3. Save to Cache
  await supabase.from('ai_trend_intelligence').upsert({
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

  return intelligence;
}