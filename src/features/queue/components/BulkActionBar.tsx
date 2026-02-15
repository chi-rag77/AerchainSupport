"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  UserPlus, Tag, MessageSquare, ShieldAlert, 
  X, CheckCircle2, Trash2, ArrowRight 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BulkActionBarProps {
  selectedCount: number;
  onClear: () => void;
  onAction: (type: string) => void;
}

const BulkActionBar = ({ selectedCount, onClear, onAction }: BulkActionBarProps) => {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="flex items-center gap-6 px-6 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-[24px] shadow-2xl border border-white/10 dark:border-gray-200">
            <div className="flex items-center gap-3 pr-6 border-r border-white/20 dark:border-gray-200">
              <Badge className="bg-indigo-500 text-white font-black h-6 w-6 rounded-full flex items-center justify-center p-0">
                {selectedCount}
              </Badge>
              <span className="text-sm font-bold uppercase tracking-widest">Selected</span>
              <Button variant="ghost" size="icon" onClick={onClear} className="h-8 w-8 rounded-full hover:bg-white/10 dark:hover:bg-gray-100">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                onClick={() => onAction('reassign')}
                className="h-10 rounded-xl font-bold text-xs gap-2 hover:bg-white/10 dark:hover:bg-gray-100"
              >
                <UserPlus className="h-4 w-4" />
                Reassign
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => onAction('status')}
                className="h-10 rounded-xl font-bold text-xs gap-2 hover:bg-white/10 dark:hover:bg-gray-100"
              >
                <Tag className="h-4 w-4" />
                Status
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => onAction('note')}
                className="h-10 rounded-xl font-bold text-xs gap-2 hover:bg-white/10 dark:hover:bg-gray-100"
              >
                <MessageSquare className="h-4 w-4" />
                Add Note
              </Button>
              <Button 
                className="h-10 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs gap-2 px-6 ml-2"
              >
                <ShieldAlert className="h-4 w-4" />
                Escalate
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BulkActionBar;