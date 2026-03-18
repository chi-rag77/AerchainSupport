"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, MessageSquare, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TextSelectionAI = () => {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedText, setSelectedText] = useState("");

  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (text && text.length > 5) {
        const range = selection?.getRangeAt(0);
        const rect = range?.getBoundingClientRect();
        if (rect) {
          setPosition({
            x: rect.left + rect.width / 2,
            y: rect.top - 45
          });
          setSelectedText(text);
        }
      } else {
        setPosition(null);
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  if (!position) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        style={{ 
          position: 'fixed', 
          left: position.x, 
          top: position.y, 
          transform: 'translateX(-50%)',
          zIndex: 9999 
        }}
        className="flex items-center gap-1 p-1 bg-gray-900 text-white rounded-full shadow-2xl border border-white/10"
      >
        <Button variant="ghost" size="sm" className="h-8 rounded-full text-[10px] font-bold gap-1.5 hover:bg-white/10 text-white">
          <Brain className="h-3.5 w-3.5 text-indigo-400" />
          Explain
        </Button>
        <div className="w-px h-4 bg-white/20 mx-1" />
        <Button variant="ghost" size="sm" className="h-8 rounded-full text-[10px] font-bold gap-1.5 hover:bg-white/10 text-white">
          <MessageSquare className="h-3.5 w-3.5 text-indigo-400" />
          Draft Reply
        </Button>
        <div className="w-px h-4 bg-white/20 mx-1" />
        <Button variant="ghost" size="sm" className="h-8 rounded-full text-[10px] font-bold gap-1.5 hover:bg-white/10 text-white">
          <Search className="h-3.5 w-3.5 text-indigo-400" />
          Search KB
        </Button>
      </motion.div>
    </AnimatePresence>
  );
};

export default TextSelectionAI;