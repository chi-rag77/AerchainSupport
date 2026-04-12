"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  HelpCircle, Brain, MessageSquare, 
  ArrowRight, ExternalLink, ShieldAlert,
  BookOpen, Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface SupportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const SupportDialog = ({ isOpen, onClose }: SupportDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-[32px] border-none shadow-2xl p-0 overflow-hidden">
        <div className="p-8 bg-indigo-600 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md">
              <HelpCircle className="h-6 w-6 text-white" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-100">Agent Support</span>
          </div>
          <DialogTitle className="text-3xl font-black tracking-tight text-white">Need a hand?</DialogTitle>
          <DialogDescription className="text-indigo-100 font-medium text-base mt-2">
            Access resources or request immediate assistance.
          </DialogDescription>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <Link to="/knowledge" onClick={onClose}>
              <div className="p-5 rounded-[24px] bg-white dark:bg-gray-800 border border-border hover:border-indigo-200 hover:shadow-md transition-all group flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                    <Brain className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black">Knowledge Hub</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Search SOPs & Docs</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-indigo-600 transition-all" />
              </div>
            </Link>

            <div className="p-5 rounded-[24px] bg-white dark:bg-gray-800 border border-border hover:border-rose-200 hover:shadow-md transition-all group flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-black">Ping Manager</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Request urgent review</p>
                </div>
              </div>
              <Zap className="h-4 w-4 text-muted-foreground group-hover:text-rose-600 transition-all" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-border/50 flex items-start gap-3">
            <BookOpen className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs font-medium text-muted-foreground leading-relaxed">
              Tip: Use the <strong>AI Intelligence</strong> mode in ticket details to automatically find relevant SOPs from the Knowledge Hub.
            </p>
          </div>

          <Button onClick={onClose} className="w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-500/20">
            Close Resources
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SupportDialog;