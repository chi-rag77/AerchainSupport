import { useState, useCallback } from 'react';
import { QueueViewMode, QueueState } from '../types';

export function useQueueState() {
  const [state, setState] = useState<QueueState>({
    viewMode: 'list',
    selectedTicketIds: [],
    isInsightsOpen: false,
    sortBy: 'risk',
  });

  const setViewMode = (viewMode: QueueViewMode) => setState(prev => ({ ...prev, viewMode }));
  
  const toggleSelection = (id: string) => {
    setState(prev => ({
      ...prev,
      selectedTicketIds: prev.selectedTicketIds.includes(id)
        ? prev.selectedTicketIds.filter(tid => tid !== id)
        : [...prev.selectedTicketIds, id]
    }));
  };

  const clearSelection = () => setState(prev => ({ ...prev, selectedTicketIds: [] }));

  const setSortBy = (sortBy: QueueState['sortBy']) => setState(prev => ({ ...prev, sortBy }));

  return {
    ...state,
    setViewMode,
    toggleSelection,
    clearSelection,
    setSortBy,
    toggleInsights: () => setState(prev => ({ ...prev, isInsightsOpen: !prev.isInsightsOpen })),
  };
}