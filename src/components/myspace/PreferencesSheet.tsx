"use client";

import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Clock, Bell, Shield, Zap, 
  Save, Loader2, User, Settings2 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useSupabase } from '@/components/SupabaseProvider';
import { MultiSelect } from '@/components/MultiSelect';

interface PreferencesSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_OPTIONS = [
  { value: 'Bug', label: 'Bugs' },
  { value: 'Task', label: 'Tasks' },
  { value: 'Query', label: 'Queries' },
  { value: 'Feature', label: 'Feature Requests' },
];

const PreferencesSheet = ({ isOpen, onClose }: PreferencesSheetProps) => {
  const { session } = useSupabase();
  const userId = session?.user?.id;

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [prefs, setPrefs] = useState({
    work_hours_start: '09:00',
    work_hours_end: '17:00',
    preferred_categories: [] as string[],
    auto_pause: true,
  });

  useEffect(() => {
    if (isOpen && userId) {
      fetchPrefs();
    }
  }, [isOpen, userId]);

  const fetchPrefs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('agent_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (data) {
        setPrefs({
          work_hours_start: data.work_hours_start || '09:00',
          work_hours_end: data.work_hours_end || '17:00',
          preferred_categories: data.preferred_categories || [],
          auto_pause: data.auto_pause_duration_minutes > 0,
        });
      }
    } catch (err) {
      console.error("Error fetching prefs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!userId) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('agent_preferences')
        .upsert({
          user_id: userId,
          work_hours_start: prefs.work_hours_start,
          work_hours_end: prefs.work_hours_end,
          preferred_categories: prefs.preferred_categories,
          auto_pause_duration_minutes: prefs.auto_pause ? 15 : 0,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      toast.success("Preferences updated successfully!");
      onClose();
    } catch (err: any) {
      toast.error(`Failed to save: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0 border-none shadow-2xl">
        <div className="p-8 bg-indigo-600 text-white">
          <SheetHeader>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md">
                <Settings2 className="h-6 w-6 text-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-100">Personalization</span>
            </div>
            <SheetTitle className="text-3xl font-black tracking-tight text-white">Workspace Prefs</SheetTitle>
            <SheetDescription className="text-indigo-100 font-medium">
              Configure your availability and focus areas.
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="text-xs font-bold uppercase tracking-widest">Loading Settings...</span>
            </div>
          ) : (
            <>
              {/* Availability */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 px-1">
                  <Clock className="h-4 w-4 text-indigo-600" />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Availability</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">Shift Start</Label>
                    <Input 
                      type="time" 
                      value={prefs.work_hours_start} 
                      onChange={(e) => setPrefs({...prefs, work_hours_start: e.target.value})}
                      className="rounded-xl bg-gray-50 border-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">Shift End</Label>
                    <Input 
                      type="time" 
                      value={prefs.work_hours_end} 
                      onChange={(e) => setPrefs({...prefs, work_hours_end: e.target.value})}
                      className="rounded-xl bg-gray-50 border-none"
                    />
                  </div>
                </div>
              </div>

              {/* Focus Areas */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 px-1">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Focus Areas</h4>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold">Preferred Categories</Label>
                  <MultiSelect 
                    options={CATEGORY_OPTIONS}
                    selected={prefs.preferred_categories}
                    onSelectedChange={(val) => setPrefs({...prefs, preferred_categories: val})}
                    placeholder="Select categories..."
                    className="rounded-xl bg-gray-50 border-none"
                  />
                  <p className="text-[10px] text-muted-foreground italic">AI will prioritize these in your recommended actions.</p>
                </div>
              </div>

              {/* Automation */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 px-1">
                  <Shield className="h-4 w-4 text-emerald-600" />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Automation</h4>
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-border/50">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold">Auto-Pause Queue</p>
                    <p className="text-[10px] text-muted-foreground">Pause assignments after 15m of inactivity.</p>
                  </div>
                  <Switch 
                    checked={prefs.auto_pause} 
                    onCheckedChange={(val) => setPrefs({...prefs, auto_pause: val})} 
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="p-8 bg-gray-50 border-t border-border flex justify-end gap-4">
          <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold">Cancel</Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving || isLoading}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[10px] px-10 h-12 shadow-lg shadow-indigo-500/20"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PreferencesSheet;