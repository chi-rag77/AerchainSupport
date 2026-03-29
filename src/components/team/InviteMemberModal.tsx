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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Mail, Loader2, Shield, User, Eye, Sparkles } from 'lucide-react';
import { UserRole } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ROLE_CONFIG: { id: UserRole; label: string; desc: string; icon: any }[] = [
  { id: 'admin', label: 'Admin', desc: 'Full access to users, settings, and all features.', icon: Shield },
  { id: 'manager', label: 'Manager', desc: 'Can manage automation rules and view all data.', icon: Sparkles },
  { id: 'viewer', label: 'Viewer', desc: 'Read-only access to dashboards and tickets.', icon: Eye },
];

const InviteMemberModal = ({ isOpen, onClose }: InviteMemberModalProps) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("viewer");
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleInvite = async () => {
    if (!email || !role) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('invite-user', {
        body: { email, role }
      });

      if (error) throw error;

      toast.success(`Invitation sent to ${email}`);
      queryClient.invalidateQueries({ queryKey: ['orgInvitations'] });
      onClose();
      setEmail("");
      setRole("viewer");
    } catch (err: any) {
      toast.error(`Failed to invite: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-[32px] border-none shadow-2xl p-0 overflow-hidden">
        <div className="p-8 bg-indigo-600 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-100">Team Expansion</span>
          </div>
          <DialogTitle className="text-3xl font-black tracking-tight text-white">Invite Member</DialogTitle>
          <DialogDescription className="text-indigo-100 font-medium text-base mt-2">
            Add a new collaborator to your organization.
          </DialogDescription>
        </div>

        <div className="p-8 space-y-8">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="name@company.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 pl-11 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none shadow-inner font-medium"
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Select Role</Label>
            <div className="grid grid-cols-1 gap-3">
              {ROLE_CONFIG.map((config) => (
                <button
                  key={config.id}
                  onClick={() => setRole(config.id)}
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-2xl border-2 transition-all text-left group",
                    role === config.id 
                      ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20" 
                      : "border-transparent bg-gray-50 dark:bg-gray-800 hover:border-border"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-xl shrink-0 transition-colors",
                    role === config.id ? "bg-indigo-600 text-white" : "bg-white dark:bg-gray-700 text-muted-foreground"
                  )}>
                    <config.icon className="h-4 w-4" />
                  </div>
                  <div className="space-y-0.5">
                    <p className={cn(
                      "text-sm font-black uppercase tracking-widest",
                      role === config.id ? "text-indigo-600" : "text-foreground"
                    )}>{config.label}</p>
                    <p className="text-xs font-medium text-muted-foreground leading-relaxed">{config.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-8 bg-gray-50 dark:bg-gray-900 border-t border-border flex justify-end gap-4">
          <Button variant="ghost" onClick={onClose} disabled={isLoading} className="rounded-xl font-bold">Cancel</Button>
          <Button 
            onClick={handleInvite} 
            disabled={isLoading || !email}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[10px] px-10 h-12 shadow-lg shadow-indigo-500/20"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
            Send Invitation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InviteMemberModal;