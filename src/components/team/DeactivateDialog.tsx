"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Loader2, UserMinus } from 'lucide-react';
import { OrgUser } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DeactivateDialogProps {
  user: OrgUser | null;
  onClose: () => void;
  onSuccess: () => void;
}

const DeactivateDialog = ({ user, onClose, onSuccess }: DeactivateDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDeactivate = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('deactivate-user', {
        body: { user_id: user.id }
      });

      if (error) throw error;

      toast.success(`${user.display_name || user.email} has been deactivated.`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(`Failed to deactivate: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={!!user} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] rounded-[32px] border-none shadow-2xl p-0 overflow-hidden">
        <div className="p-8 bg-rose-600 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md">
              <ShieldAlert className="h-6 w-6 text-white" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-rose-100">Security Action</span>
          </div>
          <DialogTitle className="text-3xl font-black tracking-tight text-white">Deactivate User?</DialogTitle>
          <DialogDescription className="text-rose-100 font-medium text-base mt-2">
            This will immediately revoke access for {user?.display_name || user?.email}.
          </DialogDescription>
        </div>

        <div className="p-8 space-y-6">
          <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/50 space-y-3">
            <p className="text-sm font-bold text-rose-900 dark:text-rose-200 leading-relaxed">
              Deactivating this user will:
            </p>
            <ul className="space-y-2">
              {['Sign them out of all active sessions', 'Block all future login attempts', 'Retain their historical data for audit logs'].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-xs font-medium text-rose-800 dark:text-rose-300">
                  <div className="h-1.5 w-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleDeactivate} 
              disabled={isLoading}
              className="w-full h-12 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-rose-500/20"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserMinus className="h-4 w-4" />}
              Confirm Deactivation
            </Button>
            <Button variant="ghost" onClick={onClose} disabled={isLoading} className="rounded-xl font-bold">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeactivateDialog;