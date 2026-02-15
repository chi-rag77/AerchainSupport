import { useQuery } from '@tanstack/react-query';
import { fetchTrendData, fetchAIIntelligence } from '../services/trend.service';
import { useSupabase } from '@/components/SupabaseProvider';
import { format } from 'date-fns';

export function useTrendIntelligence(dateRange: { from: Date; to: Date }) {
  const { session } = useSupabase();
  const orgId = session?.user?.id;

  const startDate = format(dateRange.from, 'yyyy-MM-dd');
  const endDate = format(dateRange.to, 'yyyy-MM-dd');

  // 1. Fetch Trend & Signals
  const trendQuery = useQuery({
    queryKey: ['trendData', startDate, endDate],
    queryFn: () => fetchTrendData(startDate, endDate),
    enabled: !!orgId,
  });

  // 2. Fetch AI Intelligence
  const aiQuery = useQuery({
    queryKey: ['trendAI', trendQuery.data?.signals],
    queryFn: () => fetchAIIntelligence(trendQuery.data!.signals, orgId!),
    enabled: !!trendQuery.data?.signals && !!orgId,
    staleTime: Infinity, // Cache heavily
  });

  return {
    trendData: trendQuery.data?.trendData || [],
    signals: trendQuery.data?.signals,
    intelligence: aiQuery.data,
    isLoading: trendQuery.isLoading || aiQuery.isLoading,
    isFetching: trendQuery.isFetching || aiQuery.isFetching,
    error: trendQuery.error || aiQuery.error,
  };
}