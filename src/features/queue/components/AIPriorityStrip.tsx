"use client";

import React from 'react';
import { Card } from "@/components/ui/card";
import { Brain, Sparkles, ArrowRight, ShieldAlert, UserPlus, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface AIPriorityStripProps {
  criticalCount: number;
  onViewCritical: () => void;
  onSmartReassign: () => void;
}

const AIPriorityStrip = ({ criticalCount, onViewCritical, onSmartReassign }: AIPriorityStripProps) => {
  if (criticalCount === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className="relative overflow-hidden border-none bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg rounded-[20px] p-4">
        {/* Animated Background Element */}
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Zap className="h-24 w-24" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md">
              <ShieldAlert className="h-6 w-6 text-white animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase tracking-widest text-red-100">AI Priority Focus</h4>
              <p className="text-lg font-bold">
                {criticalCount} High-Risk Tickets require immediate attention
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              onClick={onViewCritical}
              className="bg-white text-red-600 hover:bg-red-50 font-bold rounded-xl h-10 px-6 shadow-sm"
            >
              View Critical
            </Button>
            <Button 
              variant="ghost"
              onClick={onSmartReassign}
              className="text-white hover:bg-white/10 font-bold rounded-xl h-10 px-6 gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Reassign Smartly
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default AIPriorityStrip;