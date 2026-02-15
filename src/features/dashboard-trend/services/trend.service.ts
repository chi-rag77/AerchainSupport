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
  // 1. Check Cache (with safety check for missing table)
  if (!forceRefresh) {
    try {
      const { data: cached, error } = await supabase
        .from('ai_trend_intelligence')
        .select('*')
        .eq('start_date', signals.startDate)
        .eq('end_date', signals.endDate)
        .eq('risk_level', signals.riskLevel)
        .maybeSingle();

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
    } catch (e) {
      console.warn("Cache table not found or inaccessible, falling back to fresh generation.");
    }
  }

  // 2. Generate New
  const intelligence = await invokeEdgeFunction<AIIntelligence>('generate-trend-intelligence', {
    method: 'POST',
    body: { signals, orgId },
  });

  // 3. Save to Cache (Attempt save, but don't fail if table is missing)
  try {
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
  } catch (e) {
    console.error("Failed to save to AI trend cache:", e);
  }

  return intelligence;
}