"use client";

import React, { useState } from 'react';
import { KPIMetric } from '@/features/dashboard/types';
import SmartKPICard from './SmartKPICard';
import { usePermissions } from '@/hooks/use-permissions';
import { motion, AnimatePresence } from 'framer-motion';

interface KPISectionProps {
  metrics: KPIMetric[];
  isLoading: boolean;
}

const KPISection = ({ metrics, isLoading }: KPISectionProps) => {
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const { canManage } = usePermissions();

  const handleToggle = (id: string) => {
    setExpandedCardId(expandedCardId === id ? null : id);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
      {metrics.map((metric, index) => (
        <SmartKPICard
          key={metric.id}
          metric={metric}
          isExpanded={expandedCardId === metric.id}
          onToggle={() => handleToggle(metric.id)}
          canManage={canManage}
        />
      ))}
      
      {/* Focus Overlay when a card is expanded */}
      <AnimatePresence>
        {expandedCardId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/5 dark:bg-black/20 z-10 pointer-events-none backdrop-blur-[2px]"
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default KPISection;