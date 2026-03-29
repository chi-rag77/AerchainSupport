"use client";

import React, { useState } from 'react';
import { OrgUser, UserRole } from '@/types';
import { Badge } from '@/components/ui/badge';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Check, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

interface RoleChangePickerProps {
  user: OrgUser;
  disabled?: boolean;
}

const RoleChangePicker = ({ user, disabled }: RoleChangePickerProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newRole, setNewRole] = useState<UserRole>(user.role);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleSave = async () => {
    if (newRole === user.role) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('update-user-role', {
        body: { user_id: user.id, new_role: newRole }
      });

      if (error) throw error;

      toast.success(`Role updated for ${user.display_name || user.email}`);
      queryClient.invalidateQueries({ queryKey: ['orgMembers'] });
      setIsEditing(false);
    } catch (err: any) {
      toast.error(`Failed to update role: ${err.message}`);
      setNewRole(user.role);
    } finally {
      setIsLoading(false);
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
        <Select value={newRole} onValueChange={(v) => setNewRole(v as UserRole)}>
          <SelectTrigger className="h-8 w-32 rounded-lg text-[10px] font-black uppercase tracking-widest border-indigo-200 bg-indigo-50/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-none shadow-2xl">
            <SelectItem value="admin" className="text-[10px] font-black uppercase tracking-widest">Admin</SelectItem>
            <SelectItem value="manager" className="text-[10px] font-black uppercase tracking-widest">Manager</SelectItem>
            <SelectItem value="viewer" className="text-[10px] font-black uppercase tracking-widest">Viewer</SelectItem>
          </SelectContent>
        </Select>
        <Button 
          size="icon" 
          variant="ghost" 
          onClick={handleSave} 
          disabled={isLoading}
          className="h-8 w-8 rounded-lg bg-green-50 text-green-600 hover:bg-green-100"
        >
          {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
        </Button>
        <Button 
          size="icon" 
          variant="ghost" 
          onClick={() => { setIsEditing(false); setNewRole(user.role); }}
          disabled={isLoading}
          className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <button 
      onClick={() => !disabled && setIsEditing(true)}
      disabled={disabled}
      className={cn(
        "group flex items-center gap-2 transition-all",
        !disabled && "hover:scale-105"
      )}
    >
      <Badge className={cn(
        "font-black uppercase tracking-widest text-[9px] border-none px-3 py-1 rounded-full",
        user.role === 'admin' ? "bg-indigo-50 text-indigo-700" : 
        user.role === 'manager' ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-gray-600"
      )}>
        {user.role}
      </Badge>
      {!disabled && (
        <span className="text-[8px] font-black uppercase tracking-widest text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
          Change
        </span>
      )}
    </button>
  );
};

export default RoleChangePicker;